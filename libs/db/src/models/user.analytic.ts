import { StatusType } from '@signy/common';
import { UserAnalyticBaseInfo } from '@signy/subscription';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { User } from './user';

export class UserAnalytic extends Model {
    id: number;
    user_id: number;
    documents_count: number;
    sms_count: number;
    users_count: number;
    templates_count: number;
    storage_capacity_used: number;
    status: StatusType;

    user: User;
    static get tableName() {
        return dbNames.userAnalytics.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id'],

            properties: {
                id: { type: 'integer' },
                // Auth
                user_id: { type: 'integer', default: 0 },
                documents_count: { type: 'integer', default: 0 },
                sms_count: { type: 'integer', default: 0 },
                users_count: { type: 'integer', default: 0 },
                templates_count: { type: 'integer', default: 0 },
                storage_capacity_used: { type: 'integer', default: 0 },

                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                modify: 'active',
                join: {
                    from: `${dbNames.userAnalytics.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = UserAnalytic;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    toUserAnalyticBaseInfo(): UserAnalyticBaseInfo {
        return {
            id: this.id,
            documentsCount: this.documents_count,
            smsCount: this.sms_count,
            storageCapacityUser: this.storage_capacity_used,
            templatesCount: this.templates_count,
            usersCount: this.users_count,
        };
    }
}
