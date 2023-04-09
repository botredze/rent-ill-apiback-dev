import { StatusType } from '@signy/common';
import { SmsBaseInfo } from '@signy/signy-email';
import { SmsTypes } from '@signy/sms';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';

export class SmsInfo extends Model {
    id: number;
    message: string;
    user_id?: number | null;
    originator: string;
    additional_info: string;
    type: SmsTypes;
    status: StatusType;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.smsInfo.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],

            properties: {
                id: { type: 'integer' },
                message: { type: 'string' },
                user_id: { type: ['null', 'integer'] },
                originator: { type: 'string' },
                type: { enum: Object.values(SmsTypes) },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SmsInfo;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    toSmsBaseInfo(): SmsBaseInfo {
        return {
            id: this.id,
            message: this.message,
            originator: this.originator,
            type: this.type,
        };
    }
}
