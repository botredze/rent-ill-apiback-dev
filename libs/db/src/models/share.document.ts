import { AnyQueryBuilder, Model } from 'objection';
import { SignyShareDocumentTypes } from '@signy/signy-share-document';
import { User } from './user';
import { SignyDocument } from './signy.document';
import { dbNames } from '../db.names';
import { StatusType } from '@signy/common';
import { UploadedImageInfo } from '@signy/upload';

export class SignyShareDocument extends Model {
    id: number;
    document_id: number;
    user_id: number;
    type: SignyShareDocumentTypes;
    url: string;
    qr_code: UploadedImageInfo;
    is_sent: boolean;
    expired_at: Date | string;
    sent_at: Date | string;
    status: StatusType;

    user?: User;
    document?: SignyDocument;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyShareDocument.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['document_id', 'user_id', 'url'],

            properties: {
                id: { type: 'integer' },
                document_id: { type: 'integer' },
                user_id: { type: 'integer' },
                type: { enum: Object.values(SignyShareDocumentTypes), default: SignyShareDocumentTypes.AnyOne },
                url: { type: ['null', 'string'] },
                qr_code: { type: ['null', 'string'] },
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
                const { ref } = SignyShareDocument;
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
                    from: `${dbNames.signyShareDocument.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signyShareDocument.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
        };
    }
}
