import { StatusType } from '@signy/common';
import { SignyConstants } from '@signy/signy';
import { SignyCustomGroupsBaseInfo } from '@signy/contact';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { User } from './user';

export class SignyContactCustomGroup extends Model {
    id: number;
    owner_id: number;
    contact_ids?: number[];
    sign_order_queue: number;
    name: string;
    color: string;
    is_custom: boolean;
    is_favourite: boolean;
    icon?: string;

    status: StatusType;

    created_at: string | Date;
    updated_at: string | Date;

    owner?: User;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyContactCustomGroup.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['owner_id', 'name'],

            properties: {
                id: { type: 'integer' },
                owner_id: { type: 'integer' },
                contact_ids: { type: ['null', 'array'] },
                sign_order_queue: { type: 'integer' },
                name: { type: 'string' },
                color: { type: 'string', default: SignyConstants.defaultColor },
                is_custom: { type: 'boolean', default: true },
                is_favourite: { type: 'boolean', default: false },
                icon: { type: ['null', 'string'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyContactCustomGroup;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            owner: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${dbNames.signyContactCustomGroup.tableName}.owner_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
        };
    }

    toSignyCustomGroupsBaseInfo(): SignyCustomGroupsBaseInfo {
        return {
            id: this.id,
            isSignOrderExists: this?.sign_order_queue ? true : false,
            signOrderQueue: this?.sign_order_queue,
            name: this.name,
            color: this.color,
            isCustom: !!this.is_custom,
            isFavourite: !!this.is_favourite,
            icon: this.icon,
            participatorsCount: this?.contact_ids?.length ? this.contact_ids.length : 0,
            createdAt: new Date(this?.created_at || new Date()).toISOString(),
        };
    }
}
