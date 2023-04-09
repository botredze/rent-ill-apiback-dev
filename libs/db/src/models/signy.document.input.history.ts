import { StatusType } from '@signy/common';
import { SignyInputOptionListInfo } from '@signy/document-input';
import { UploadedFileInfo } from '@signy/upload';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocumentInputSettings } from './signy.document.input.settings';
import { SignyDocumentSignatories } from './signy.document.signatories';
import { InputHistoryBaseInfo } from '@signy/signatory';
export class SignyDocumentInputHistory extends Model {
    id: number;
    input_settings_id: number;
    signatory_id: number;
    value?: string;
    value_json?: SignyInputOptionListInfo[] | null;
    attachments?: UploadedFileInfo[] | null;
    created_at: string;
    status: StatusType;

    documentInputs: SignyDocumentInputSettings;
    signatory?: SignyDocumentSignatories;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyDocumentInputHistory.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['input_settings_id', 'signatory_id'],

            properties: {
                id: { type: 'integer' },
                input_settings_id: { type: 'integer' },
                signatory_id: { type: 'integer' },
                value: { type: ['null', 'string'] },
                value_json: { type: ['null', 'array'] },
                attachments: { type: ['null', 'array'] },
                created_at: { type: 'string' },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentInputHistory;
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
                    from: `${dbNames.signyDocumentInputHistory.tableName}.input_settings_id`,
                    to: `${dbNames.signyDocumentInputSettings.tableName}.id`,
                },
            },
            signatory: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocumentSignatories,
                join: {
                    from: `${dbNames.signyDocumentInputHistory.tableName}.signatory_id`,
                    to: `${dbNames.signyDocumentSignatories.tableName}.id`,
                },
            },
        };
    }

    toInputHistoryBaseInfo(): InputHistoryBaseInfo {
        return {
            id: this.id,
            value: this?.value || undefined,
            valueJson: this?.value_json || undefined,
            attachment: this?.attachments || undefined,
            input: this?.documentInputs?.toSignyDocumentInputSettingsBaseInfo(),
        };
    }
}
