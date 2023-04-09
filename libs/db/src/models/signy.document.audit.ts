import { StatusType } from '@signy/common';
import { ActionTypes } from '@signy/document';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocument } from './signy.document';
import { SignyDocumentSignatories } from './signy.document.signatories';
import { User } from './user';

export class SignyDocumentAudit extends Model {
    id: number;
    user_id: number;
    document_id: number;
    signatory_id?: number;
    action_type: ActionTypes;
    ip?: string;
    status: StatusType;

    user?: User;
    document?: SignyDocument;
    signatory?: SignyDocumentSignatories | null;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyDocumentAudit.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'document_id', 'action_type'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                document_id: { type: 'integer' },
                signatory_id: { type: ['null', 'integer'] },
                action_type: { enum: Object.values(ActionTypes), default: ActionTypes.Prepare },
                ip: { type: ['null', 'string'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentAudit;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${dbNames.signyDocumentAudit.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signyDocumentAudit.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
            signatory: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocumentSignatories,
                join: {
                    from: `${dbNames.signyDocumentAudit.tableName}.signatory_id`,
                    to: `${dbNames.signyDocumentSignatories.tableName}.id`,
                },
            },
        };
    }
}
