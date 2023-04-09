import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '..';
import { User } from '.';
import { FcmTokenInfo, StatusType } from '@signy/common';
import { authConstants } from '@signy/auth';

export class UserSession extends Model {
    id: number;
    user_id: number;
    token: string;
    device_id?: string | null;
    fcm_token?: string | null;
    expired_at: string;
    status: StatusType;

    user?: User;

    static get tableName() {
        return dbNames.userSessions.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'token'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                token: { type: 'string', maxLength: authConstants().maxTokenLength },
                fcm_token: { type: ['null', 'string'], maxLength: authConstants().maxTokenLength },
                expired_at: { type: 'string' },
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
                join: {
                    from: `${dbNames.userSessions.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref, fn } = UserSession;
                builder.where(ref('status'), StatusType.Active);
                builder.where(ref('expired_at'), '>', fn.now());
            },
            latest(builder: AnyQueryBuilder) {
                const { ref, fn } = UserSession;
                builder.where(ref('status'), StatusType.Active);
                builder.where(ref('expired_at'), '>', fn.now());
                builder.orderBy(ref('updated_at'), 'DESC');
                builder.first();
            },
        };
    }

    toFcmTokenInfoDTO(): FcmTokenInfo {
        return {
            id: this.id,
            token: this.fcm_token || undefined,
        };
    }
}
