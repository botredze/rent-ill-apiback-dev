import { StatusType } from '@signy/common';
import { SignySharedUserChannelTypes } from '@signy/signy-share-document';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocument } from './signy.document';
import { SignyDocumentSignatories } from './signy.document.signatories';

export class SignySharedUserDocument extends Model {
    id: number;
    document_id: number;
    signy_signatory_id: number;
    channel_type: SignySharedUserChannelTypes;
    is_progress_notify_follower: boolean;
    is_sent: boolean;
    expired_at: Date | string;
    sent_at: Date | string;
    status: StatusType;

    document?: SignyDocument;
    signyContact?: SignyDocumentSignatories;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signySharedUserDocument.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['document_id', 'signy_signatory_id'],

            properties: {
                id: { type: 'integer' },
                document_id: { type: 'integer' },
                signy_signatory_id: { type: 'integer' },
                channel_type: {
                    enum: Object.values(SignySharedUserChannelTypes),
                    default: SignySharedUserChannelTypes.Email,
                },
                is_progress_notify_follower: { type: 'boolean' },
                is_sent: { type: 'boolean' },
                expired_at: { type: 'string' },
                sent_at: { type: 'string' },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignySharedUserDocument;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocumentSignatories,
                join: {
                    from: `${dbNames.signySharedUserDocument.tableName}.signy_contact_id`,
                    to: `${dbNames.signyDocumentSignatories.tableName}.id`,
                },
            },
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signySharedUserDocument.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
        };
    }
}
