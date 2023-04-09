import { CouponStatusType } from '@signy/common';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames, User } from '..';

export class UserCoupon extends Model {
    id: number;
    user_id: number;
    coupon_id: number;
    date: string;
    status: CouponStatusType;

    static get tableName() {
        return dbNames.userCoupons.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'coupon_id'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                coupon_id: { type: 'integer' },
                date: { type: 'string' },
                status: { enum: Object.values(CouponStatusType), default: CouponStatusType.Used },
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
                    from: `${dbNames.userCoupons.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            coupon: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${dbNames.userCoupons.tableName}.coupon_id`,
                    to: `${dbNames.coupons.tableName}.id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            used(builder: AnyQueryBuilder) {
                const { ref } = UserCoupon;
                builder.where(ref('status'), CouponStatusType.Used);
            },
        };
    }
}
