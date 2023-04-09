import { AnyQueryBuilder, Model } from 'objection';
import { StatusType } from '@signy/common';
import { OtpType } from '@signy/otp';
import { dbNames } from '..';

export class OtpCode extends Model {
    id: number;
    channel: string;
    code: string;
    otp_type: OtpType;
    expired_at: string;
    sent_at?: string;
    status: StatusType;

    static get tableName() {
        return dbNames.otpCodes.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['channel', 'code', 'otp_type'],

            properties: {
                id: { type: 'integer' },
                channel: { type: 'string', maxLength: 50 },
                code: { type: 'string', maxLength: 10 },
                otp_type: {
                    enum: Object.values(OtpType),
                    default: OtpType.CurrentEmail,
                },
                expired_at: { type: 'string' },
                sent_at: { type: ['null', 'string'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = OtpCode;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }
}
