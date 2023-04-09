import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '..';
import { StatusType } from '@signy/common';

export class ResetPasswordToken extends Model {
    id: number;
    user_id: number;
    token: string;
    expired_at: string;
    status: StatusType;

    static get tableName() {
        return dbNames.resetTokens.tableName;
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
                token: { type: 'string', maxLength: 512 },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
                expired_at: { type: 'string' },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = ResetPasswordToken;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }
}
