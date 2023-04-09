import { SignyDocumentStatusTypes } from '@signy/common';
import { SignyDocumentBaseInfo, SignyDocumentStepTypes } from '@signy/document';
import { UploadedFileInfo } from '@signy/upload';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocumentSettings } from './signy.document.settings';
import { SignyDocumentSignatories } from './signy.document.signatories';
import { User } from './user';

export class SignyDocument extends Model {
    id: number;
    creator_id: number;
    is_template: boolean;
    is_form: boolean;
    step_type: SignyDocumentStepTypes;
    original_file: UploadedFileInfo;
    file?: UploadedFileInfo[] | null;
    form_image?: UploadedFileInfo | null;
    folower_ids?: number[] | null;
    name?: string | null;
    size?: number | null;
    upload_date: Date | string;
    extra_data?: object | null;
    attachments?: UploadedFileInfo[] | null;
    step_level: number;
    custom_groups_ids?: number[] | null;
    status: SignyDocumentStatusTypes;

    creator?: User;
    documentSettings: SignyDocumentSettings;
    documentSignatories?: SignyDocumentSignatories[];

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyDocument.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['creator_id', 'original_file'],

            properties: {
                id: { type: 'integer' },
                creator_id: { type: 'integer' },
                is_template: { type: 'boolean', default: false },
                is_form: { type: 'boolean', default: false },
                step_type: { enum: Object.values(SignyDocumentStepTypes), default: SignyDocumentStepTypes.Prepare },
                original_file: { type: 'object' },
                file: { type: ['null', 'array'] },
                form_image: { type: ['null', 'object'] },
                folower_ids: { type: ['null', 'array'] },
                name: { type: ['null', 'string'] },
                size: { type: ['null', 'integer'] },
                upload_date: { type: 'string', default: new Date().toISOString() },
                extra_data: { type: ['null', 'object'] },
                attachments: { type: ['null', 'array'] },
                step_level: { type: 'integer', default: 1 },
                custom_groups_ids: { type: ['null', 'array'] },
                status: { enum: Object.values(SignyDocumentStatusTypes), default: SignyDocumentStatusTypes.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyDocument;
                builder.where(ref('status'), SignyDocumentStatusTypes.Active);
                builder.where(ref('is_template'), false);
            },
            template(builder: AnyQueryBuilder) {
                const { ref } = SignyDocument;
                builder.where(ref('status'), SignyDocumentStatusTypes.Active);
                builder.where(ref('is_template'), true);
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            creator: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${dbNames.signyDocument.tableName}.creator_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            documentSettings: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocumentSettings,
                join: {
                    from: `${dbNames.signyDocument.tableName}.id`,
                    to: `${dbNames.signyDocumentSettings.tableName}.document_id`,
                },
            },
            documentSignatories: {
                relation: Model.HasManyRelation,
                modelClass: SignyDocumentSignatories,
                join: {
                    from: `${dbNames.signyDocument.tableName}.id`,
                    to: `${dbNames.signyDocumentSignatories.tableName}.document_id`,
                },
            },
        };
    }

    toSignyDocumentBaseInfo(isOwner?: boolean): SignyDocumentBaseInfo {
        return {
            id: this.id,
            isTemplate: !!this.is_template,
            isForm: !!this.is_form,
            stepType: this.step_type,
            originalFile: this.original_file,
            file: this?.file ? this.file : undefined,
            name: this?.name ? this.name : undefined,
            size: this?.size ? this.size : undefined,
            uploadDate: new Date(this.upload_date).toISOString(),
            extraData: this?.extra_data ? this.extra_data : undefined,
            attachments: this?.attachments,
            stepLevel: this.step_level,
            settings: this.documentSettings?.toSignyDocumentSettingsBaseInfo(isOwner),
            status: this.status,
        };
    }
}
