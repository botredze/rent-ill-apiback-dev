import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '..';
import { FeatureStatusTypes } from '@signy/common';
import { FeatureBaseInfo } from '@signy/subscription';

export class Feature extends Model {
    id: number;
    name: string;
    hint?: string;
    users_count?: number;
    contacts_count?: number;
    documents_count?: number;
    templates_count?: number;
    mails_count?: number;
    sms_count?: number;
    storage_capacity?: number;
    data_order: number;
    status: FeatureStatusTypes;

    static get tableName() {
        return dbNames.features.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],

            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                hint: { type: ['null', 'string'] },
                users_count: { type: ['null', 'integer'] },
                contacts_count: { type: ['null', 'integer'] },
                documents_count: { type: ['null', 'integer'] },
                templates_count: { type: ['null', 'integer'] },
                mails_count: { type: ['null', 'integer'] },
                sms_count: { type: ['null', 'integer'] },
                storage_capacity: { type: ['null', 'integer'] },
                data_order: { type: 'integer', default: 0 },
                status: { enum: Object.values(FeatureStatusTypes), default: FeatureStatusTypes.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = Feature;
                builder.where(ref('status'), FeatureStatusTypes.Active);
            },
            ordered(builder: AnyQueryBuilder) {
                const { ref } = Feature;
                builder.where(ref('status'), FeatureStatusTypes.Active).orderBy(ref('data_order'));
            },
        };
    }

    get isSmsPlan(): boolean {
        return this.sms_count &&
            !this.users_count &&
            !this.contacts_count &&
            !this.documents_count &&
            !this.templates_count &&
            !this.mails_count &&
            !this.storage_capacity
            ? true
            : false;
    }

    toFeatureBaseInfoDTO(): FeatureBaseInfo {
        return {
            id: this.id,
            name: this.name,
            hint: this.hint || undefined,
            usersCount: this?.users_count || 0,
            contactsCount: this?.contacts_count || 0,
            documentsCount: this?.documents_count || 0,
            templatesCount: this?.templates_count || 0,
            mailsCount: this?.mails_count || 0,
            smsCount: this?.sms_count || 0,
            storageCapacity: this?.storage_capacity || 0,
        };
    }
}
