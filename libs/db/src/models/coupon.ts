import { StatusType } from '@signy/common';
import { CouponBaseInfo } from '@signy/subscription';
import { AnyQueryBuilder, fn, Model } from 'objection';
import { dbNames, SubscriptionPlan } from '..';

export class Coupon extends Model {
    id: number;
    coupon: string;
    plan_id: number;
    amount: number;
    is_percent: boolean;
    expired_at: string;
    status: StatusType;

    subscriptionPlan?: SubscriptionPlan;

    static get tableName() {
        return dbNames.coupons.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['coupon', 'amount'],

            properties: {
                id: { type: 'integer' },
                coupon: { type: 'string', maxLength: 50 },
                plan_id: { type: ['null', 'integer'] },
                amount: { type: 'integer' },
                is_percent: { type: 'boolean', default: false },
                expired_at: { type: 'string' },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            subscriptionPlan: {
                relation: Model.HasOneRelation,
                modelClass: SubscriptionPlan,
                join: {
                    from: `${dbNames.coupons.tableName}.plan_id`,
                    to: `${dbNames.subscriptionPlans.tableName}.id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = Coupon;
                builder.where(ref('status'), StatusType.Active).where(ref('expired_at'), '>', fn.now());
            },
        };
    }

    toCouponBaseInfoDTO(): CouponBaseInfo {
        return {
            id: this.id,
            coupon: this.coupon,
            amount: this.amount,
            isPercent: !!this.is_percent,
            subscriptionPlan: this.subscriptionPlan?.toSubscriptionPlanInfoDTO(),
        };
    }
}
