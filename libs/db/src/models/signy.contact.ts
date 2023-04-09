import { commonConstants, SignyContactStatusTypes } from '@signy/common';
import { SignyContactImportTypes } from '@signy/contact';
import { SignyBaseInfo, SignyConstants } from '@signy/signy';
import { GenderTypes } from '@signy/user';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { Branch } from './branches';
import { Company } from './company';
import { SignyDocumentSignatories } from './signy.document.signatories';
import { User } from './user';

export class SignyContact extends Model {
    id: number;
    owner_id: number;
    group_ids?: number[];
    company_id?: number;
    branch_id?: number;
    type: SignyContactImportTypes;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    telegram?: string;
    telegram_nick?: string;
    is_favourite: boolean;
    avatar?: string;
    gender?: GenderTypes;
    dob?: string;
    color: string;
    status: SignyContactStatusTypes;

    owner?: User;
    company?: Company;
    branch?: Branch;
    signatory?: SignyDocumentSignatories;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyContact.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['owner_id'],

            properties: {
                id: { type: 'integer' },
                owner_id: { type: 'integer' },
                group_ids: { type: ['null', 'array'] },
                company_id: { type: ['null', 'integer'] },
                branch_id: { type: ['null', 'integer'] },
                type: { enum: Object.values(SignyContactImportTypes), default: SignyContactImportTypes.Internal },
                first_name: { type: ['null', 'string'] },
                last_name: { type: ['null', 'string'] },
                email: { type: ['null', 'string'] },
                phone: { type: ['null', 'string'] },
                whatsapp: { type: ['null', 'string'] },
                telegram: { type: ['null', 'string'] },
                telegram_nick: { type: ['null', 'string'] },
                is_favourite: { type: 'boolean', default: false },
                avatar: { type: ['null', 'string'] },
                gender: { enum: Object.values(GenderTypes) },
                dob: { type: ['null', 'string'] },
                color: { type: 'string', default: SignyConstants.defaultColor },
                status: { enum: Object.values(SignyContactStatusTypes), default: SignyContactStatusTypes.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyContact;
                builder.where(ref('status'), SignyContactStatusTypes.Active);
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
                    from: `${dbNames.signyContact.tableName}.owner_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            company: {
                relation: Model.HasOneRelation,
                modelClass: Company,
                join: {
                    from: `${dbNames.signyContact.tableName}.company_id`,
                    to: `${dbNames.companies.tableName}.id`,
                },
            },
            branch: {
                relation: Model.HasOneRelation,
                modelClass: Branch,
                join: {
                    from: `${dbNames.signyContact.tableName}.branch_id`,
                    to: `${dbNames.branches.tableName}.id`,
                },
            },
            signatory: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocumentSignatories,
                join: {
                    from: `${dbNames.signyContact.tableName}.id`,
                    to: `${dbNames.signyDocumentSignatories.tableName}.contact_id`,
                },
            },
        };
    }

    get fullName(): string {
        const fullName: string[] = [];
        if (this?.first_name) {
            fullName.push(this.first_name);
        }
        if (this?.last_name) {
            fullName.push(this.last_name);
        }
        return fullName.length
            ? fullName.join(' ')
            : this?.email
            ? this.email.substring(0, this.email.indexOf('@'))
            : this?.phone
            ? this.phone
            : commonConstants.defaultUserName;
    }

    toSignyContactsBaseInfo(): SignyBaseInfo {
        return {
            id: this.id,
            type: this.type,
            fullName: this?.fullName,
            email: this?.email,
            phone: this?.phone,
            whatsapp: this?.whatsapp,
            telegram: this?.telegram,
            telegramNick: this?.telegram_nick,
            isFavourite: Boolean(this.is_favourite),
            avatar: this?.avatar,
            gender: this?.gender,
            dob: this?.dob ? new Date(this.dob).toISOString() : undefined,
            color: this.color,
            signatory: this?.signatory ? this.signatory.toSignatoryBaseInfo() : undefined,
            status: this.status,
        };
    }
}
