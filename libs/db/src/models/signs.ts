import { StatusType } from '@signy/common';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { Document } from './document';
import { User } from './user';

export class Signs extends Model {
    id: number;
    user_id: number;
    documnet_id: number;
    status: StatusType;

    user?: User;
    document?: Document;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signs.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'documnet_id'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                documnet_id: { type: 'integer' },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = Signs;
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
                    from: `${dbNames.signs.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            document: {
                relation: Model.HasOneRelation,
                modelClass: Document,
                join: {
                    from: `${dbNames.signs.tableName}.documnet_id`,
                    to: `${dbNames.document.tableName}.id`,
                },
            },
        };
    }
}
