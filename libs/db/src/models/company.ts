import { StatusType } from '@signy/common';
import { UploadedImageInfo } from '@signy/upload';
import { CompanyBaseInfo, CompanyTypes } from '@signy/company';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { Address } from './address';
import { Branch } from './branches';
import { CompanyMembers } from './company.members';
import { User } from './user';

export class Company extends Model {
    id: number;

    national_company_id?: number | null;

    name: string;

    owner_id: number;

    company_type: CompanyTypes;

    address_id?: number | null;

    sms_count?: number | null;

    is_sms_auto_renew_only: boolean;

    comments?: string | null;

    logo?: UploadedImageInfo | null;

    status: StatusType;

    owner?: User;
    address?: Address;
    branches?: Branch[];
    companyMembers?: CompanyMembers[];

    static get tableName() {
        return dbNames.companies.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'owner_id', 'company_type'],

            properties: {
                id: { type: 'integer' },
                national_company_id: { type: ['null', 'integer'] },
                name: { type: 'string' },
                owner_id: { type: 'integer' },
                company_type: { enum: Object.values(CompanyTypes) },
                address_id: { type: ['null', 'integer'] },
                sms_count: { type: ['null', 'integer'] },
                is_sms_auto_renew_only: { type: 'boolean' },
                comments: { type: ['null', 'string'] },
                logo: { type: ['null', 'object'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            owner: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: `${dbNames.companies.tableName}.owner_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            address: {
                relation: Model.HasOneRelation,
                modelClass: Address,
                modify: 'active',
                join: {
                    from: `${dbNames.companies.tableName}.address_id`,
                    to: `${dbNames.addresses.tableName}.id`,
                },
            },
            companyMembers: {
                relation: Model.HasManyRelation,
                modelClass: CompanyMembers,
                join: {
                    from: `${dbNames.companies.tableName}.id`,
                    to: `${dbNames.companyMembers.tableName}.company_id`,
                },
            },
            branches: {
                relation: Model.HasManyRelation,
                modelClass: Branch,
                join: {
                    from: `${dbNames.companies.tableName}.id`,
                    to: `${dbNames.branches.tableName}.company_id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = Company;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    toLogoInfo(): UploadedImageInfo | undefined {
        return this.logo
            ? {
                  mimetype: this.logo?.mimetype || undefined,
                  imageUrl: this.logo?.imageUrl || '',
                  thumbnailUrl: this.logo?.thumbnailUrl || undefined,
              }
            : undefined;
    }

    toCompanyBaseInfo(): CompanyBaseInfo {
        return {
            id: this.id,
            name: this.name,
            nationalCompanyId: this?.national_company_id,
            owner: this?.owner?.toUserBaseInfoDTO() || null,
            companyType: this.company_type,
            address: this?.address?.toAddressBaseInfo() || null,
            smsCount: this?.sms_count || 0,
            isSmsAutoRenew: this.is_sms_auto_renew_only,
            comments: this?.comments,
            logo: this?.toLogoInfo(),
            status: this.status,
        };
    }
}
