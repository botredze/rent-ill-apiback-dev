import { StatusType } from '@signy/common';
import {
    SignyDocumentInputSettingsExtraBaseInfo,
    SignyInputDateFormatTypes,
    SignyInputFloatTypes,
    SignyInputOptionListInfo,
    SignyInputTypes,
    SignyInputValidationTypes,
} from '@signy/document-input';
import { UploadedFileInfo } from '@signy/upload';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocument } from './signy.document';

export class SignyDocumentInputSettings extends Model {
    id: number;
    document_id: number;
    type: SignyInputTypes;
    is_required_on: boolean;
    is_select_checkmark_on: boolean;
    contact_recipients?: number[] | null;
    group_recipients?: number[] | null;
    placeholder?: string;
    hint?: string;
    attachments?: UploadedFileInfo[] | null;
    signature_color?: string[];
    field_id?: string;
    validtion_type?: SignyInputValidationTypes;
    validation_min?: number;
    validation_max?: number;
    text_font?: string;
    text_size?: number;
    text_color?: string;
    text_distance?: number;
    is_underline_on: boolean;
    is_italic_on: boolean;
    is_bold_on: boolean;
    is_edit_available: boolean;
    float?: SignyInputFloatTypes;
    options_list_data?: SignyInputOptionListInfo[] | null;
    is_show_labels_on: boolean;
    is_time: boolean;
    is_date: boolean;
    is_duration: boolean;
    date_format: SignyInputDateFormatTypes;
    range_count?: number;
    is_range_zero: boolean;
    is_range_one: boolean;
    input_order: number;
    extra_data?: object | null;
    status: StatusType;

    document?: SignyDocument;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyDocumentInputSettings.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['document_id', 'type'],

            properties: {
                id: { type: 'integer' },
                document_id: { type: 'integer' },
                type: { enum: Object.values(SignyInputTypes) },
                is_required_on: { type: 'boolean', default: false },
                is_select_checkmark_on: { type: 'boolean', default: false },
                contact_recipients: { type: ['null', 'array'] },
                group_recipients: { type: ['null', 'array'] },
                placeholder: { type: ['null', 'string'] },
                hint: { type: ['null', 'string'] },
                attachments: { type: ['null', 'array'] },
                signature_color: { type: ['null', 'array'] },
                field_id: { type: ['null', 'string'] },
                validtion_type: { enum: Object.values(SignyInputValidationTypes) },
                validation_min: { type: ['null', 'integer'] },
                validation_max: { type: ['null', 'integer'] },
                text_font: { type: ['null', 'string'] },
                text_size: { type: ['null', 'integer'] },
                text_color: { type: ['null', 'string'] },
                text_distance: { type: ['null', 'integer'] },
                is_underline_on: { type: 'boolean', default: false },
                is_italic_on: { type: 'boolean', default: false },
                is_bold_on: { type: 'boolean', default: false },
                is_edit_available: { type: 'boolean', default: false },
                float: { enum: Object.values(SignyInputFloatTypes) },
                options_list_data: { type: ['null', 'array'] },
                is_show_labels_on: { type: 'boolean', default: false },
                is_time: { type: 'boolean', default: false },
                is_date: { type: 'boolean', default: false },
                is_duration: { type: 'boolean', default: false },
                date_format: { enum: Object.values(SignyInputDateFormatTypes) },
                range_count: { type: ['null', 'integer'] },
                is_range_zero: { type: 'boolean', default: false },
                is_range_one: { type: 'boolean', default: false },
                input_order: { type: 'integer', default: 0 },
                extra_data: { type: ['null', 'object'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentInputSettings;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signyDocumentInputSettings.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
        };
    }

    toSignyDocumentInputSettingsBaseInfo(): SignyDocumentInputSettingsExtraBaseInfo {
        return {
            id: this.id,
            documentId: this.document_id,
            type: this.type,
            allAttachments: this?.attachments ? this.attachments : undefined,
            isRequiredOn: !!this.is_required_on,
            isSelectCheckmarkOn: !!this.is_select_checkmark_on,
            placeholder: this.placeholder || undefined,
            hint: this.hint || undefined,
            signatureColor: this.signature_color || undefined,
            fieldId: this.field_id || undefined,
            validationType: this.validtion_type || undefined,
            validationMin: this.validation_min || undefined,
            validationMax: this.validation_max || undefined,
            textFont: this.text_font || undefined,
            textSize: this.text_size || undefined,
            textColor: this.text_color || undefined,
            textDistance: this.text_distance || undefined,
            isUnderlineOn: !!this.is_underline_on,
            isItalicOn: !!this.is_italic_on,
            isBoldOn: !!this.is_bold_on,
            isEditAvailable: !!this.is_edit_available,
            float: this.float || undefined,
            optionsListData: this.options_list_data || undefined,
            isShowLabelsOn: !!this.is_show_labels_on,
            isTime: !!this.is_time,
            isDate: !!this.is_date,
            isDuration: !!this.is_duration,
            dateFormat: this.date_format || undefined,
            rangeCount: this.range_count || undefined,
            isRangeZero: !!this.is_range_zero,
            inputOrder: this?.input_order,
            isRangeOne: !!this.is_range_one,
            extraData: this?.extra_data ? this.extra_data : undefined,
        };
    }
}
