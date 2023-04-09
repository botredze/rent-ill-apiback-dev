import { SubscriptionStatusType } from '@signy/common';
import { SubscriptionBaseInfo } from '@signy/subscription';
import dayjs from 'dayjs';
import { Model } from 'objection';
import { dbNames, SubscriptionPlan, User } from '..';

export class UserSubscription extends Model {
    user_id: number;
    plan_id: number;
    //Id from payment system
    subscription_id?: string;
    start_date: string;
    end_date?: string;

    status: SubscriptionStatusType;

    subscriptionPlan: SubscriptionPlan;

    static get tableName() {
        return dbNames.userSubscriptions.tableName;
    }

    static get idColumn() {
        return 'user_id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'plan_id'],

            properties: {
                user_id: { type: 'integer' },
                plan_id: { type: 'integer' },
                subscription_id: { type: ['null', 'string'] },
                start_date: { type: 'string' },
                end_date: { type: ['null', 'string'] },
                status: { enum: Object.values(SubscriptionStatusType), default: SubscriptionStatusType.Active },
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
                    from: `${dbNames.userSubscriptions.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            subscriptionPlan: {
                relation: Model.HasOneRelation,
                modelClass: SubscriptionPlan,
                join: {
                    from: `${dbNames.userSubscriptions.tableName}.plan_id`,
                    to: `${dbNames.subscriptionPlans.tableName}.id`,
                },
            },
        };
    }

    get isFullAccess(): boolean {
        return Boolean(
            this.status === SubscriptionStatusType.Active && this.subscriptionPlan && !this.subscriptionPlan?.is_limited
        );
    }

    toSubscriptionBaseInfoDTO(): SubscriptionBaseInfo {
        return {
            plan: this.subscriptionPlan.toSubscriptionPlanInfoDTO(),
            startDate: dayjs(this.start_date).toISOString(),
            endDate: this.end_date ? dayjs(this.end_date).toISOString() : undefined,
            status: this.status,
        };
    }
}
