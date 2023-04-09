import { StatusType } from '@signy/common';
import { SignyDocumentCustomGroupsBaseInfo } from '@signy/document';
import { SignyConstants } from '@signy/signy';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocument } from './signy.document';
import { User } from './user';

export class SignyDocumentCustomGroups extends Model {
    id: number;
    creator_id?: number | null;
    document_ids?: number[];
    is_favourite: boolean;
    title: string;
    color: string;
    status: StatusType;

    document?: SignyDocument;
    creator?: User;

    static get tableName() {
        return dbNames.signyDocumentCustomGroups.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['title'],

            properties: {
                id: { type: 'integer' },
                creator_id: { type: ['null', 'integer'] },
                document_ids: { type: ['null', 'array'] },
                is_favourite: { type: 'boolean', default: false },
                title: { type: 'string' },
                color: { type: 'string', default: SignyConstants.defaultColor },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentCustomGroups;
                builder.where(ref('status'), StatusType.Active);
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
                    from: `${dbNames.signyDocumentCustomGroups.tableName}.creator_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
        };
    }

    toSignyDocumentCustomGroupsBaseInfo(): SignyDocumentCustomGroupsBaseInfo {
        return {
            id: this.id,
            title: this.title,
            color: this.color,
            isFavourite: !!this.is_favourite,
        };
    }
}
