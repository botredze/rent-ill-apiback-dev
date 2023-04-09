import { SubscriptionStatusTypes } from '@signy/common';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { Feature } from './feature';
import { CreateSubscriptionRequest, SubscriptionPlanInfo } from '@signy/subscription';

export class SubscriptionPlan extends Model {
    id: number;
    feature_id: number;
    title: string;
    description?: string;
    cost: number;
    term?: number;
    discount_percantage?: number;
    term_type?: string;
    is_limited: boolean;
    data_order: number;
    status: SubscriptionStatusTypes;

    feature?: Feature;

    static get tableName() {
        return dbNames.subscriptionPlans.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['title'],

            properties: {
                id: { type: 'integer' },
                feature_id: { type: 'integer' },
                title: { type: 'string' },
                description: { type: ['null', 'string'] },
                cost: { type: 'integer', default: 0 },
                term: { type: ['null', 'integer'] },
                discount_percantage: { type: ['null', 'integer'] },
                term_type: { type: ['null', 'string'] },
                is_limited: { type: 'boolean' },
                data_order: { type: 'integer', default: 0 },
                status: { enum: Object.values(SubscriptionStatusTypes), default: SubscriptionStatusTypes.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SubscriptionPlan;
                builder.where(ref('status'), SubscriptionStatusTypes.Active);
            },
            limited(builder: AnyQueryBuilder) {
                const { ref } = SubscriptionPlan;
                builder.where(ref('status'), SubscriptionStatusTypes.Active).where(ref('is_limited'), true);
            },
            fullAccess(builder: AnyQueryBuilder) {
                const { ref } = SubscriptionPlan;
                builder
                    .where(ref('status'), SubscriptionStatusTypes.Active)
                    .where(ref('is_limited'), false)
                    .orderBy('data_order');
            },
            ordered(builder: AnyQueryBuilder) {
                const { ref } = SubscriptionPlan;
                builder.where(ref('status'), SubscriptionStatusTypes.Active).orderBy(ref('data_order'));
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            feature: {
                relation: Model.HasOneRelation,
                modelClass: Feature,
                join: {
                    from: `${dbNames.subscriptionPlans.tableName}.feature_id`,
                    to: `${dbNames.features.tableName}.id`,
                },
            },
        };
    }

    toSubscriptionPlanInfoDTO(): SubscriptionPlanInfo {
        return {
            id: this.id,
            title: this.title,
            description: this?.description || undefined,
            cost: this.cost,
            term: this?.term || undefined,
            discountPercantage: this?.discount_percantage || undefined,
            termType: this?.term_type || undefined,
            isLimited: !!this.is_limited,
            isSmsPlan: !!this?.feature?.isSmsPlan,
            features: this?.feature?.toFeatureBaseInfoDTO(),
        };
    }

    toCreateSubscriptionDTO(discount = 0): CreateSubscriptionRequest {
        return {
            price: this.cost - discount,
            term: this.term || 1,
            termType: this.term_type || 'year',
        };
    }
}
