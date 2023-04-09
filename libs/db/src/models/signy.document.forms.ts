import { StatusType } from '@signy/common';
import { SignyInputOptionListInfo } from '@signy/document-input';
import { UploadedFileInfo } from '@signy/upload';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocument } from './signy.document';
import { SignyDocumentInputSettings } from './signy.document.input.settings';

export class SignyDocumentForm extends Model {
    id: number;
    document_id: number;
    input_settings_id: number;
    is_original_form: boolean;
    value?: string;
    value_json?: SignyInputOptionListInfo[] | null;
    attachments?: UploadedFileInfo[] | null;
    status: StatusType;

    documentInputs?: SignyDocumentInputSettings;
    document?: SignyDocument;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyDocumentForm.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['input_settings_id', 'document_id'],

            properties: {
                id: { type: 'integer' },
                input_settings_id: { type: 'integer' },
                document_id: { type: 'integer' },
                is_original_form: { type: 'boolean', default: false },
                value: { type: ['null', 'string'] },
                value_json: { type: ['null', 'array'] },
                attachments: { type: ['null', 'array'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentForm;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            documentInputs: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocumentInputSettings,
                join: {
                    from: `${dbNames.signyDocumentForm.tableName}.input_settings_id`,
                    to: `${dbNames.signyDocumentInputSettings.tableName}.id`,
                },
            },
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signyDocumentForm.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
        };
    }
}
