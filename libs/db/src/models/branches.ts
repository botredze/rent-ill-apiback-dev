import { StatusType } from '@signy/common';
import { UploadedImageInfo } from '@signy/upload';
import { AnyQueryBuilder, Model } from 'objection';
import { Address } from './address';
import { CompanyMembers } from './company.members';
import { Company } from './company';
import { dbNames } from '../db.names';
import { BranchBaseInfo } from '@signy/branch';

export class Branch extends Model {
    id: number;

    name: string;

    company_id: number;

    address_id: number;

    comments?: string | null;

    logo?: UploadedImageInfo | null;

    status: StatusType;

    company?: Company;
    companyMembers?: CompanyMembers[];
    address?: Address;

    static get tableName() {
        return dbNames.branches.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],

            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                company_id: { type: 'integer' },
                address_id: { type: 'integer' },
                comments: { type: ['null', 'string'] },
                logo: { type: ['null', 'object'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            company: {
                relation: Model.HasOneRelation,
                modelClass: Company,
                join: {
                    from: `${dbNames.branches.tableName}.company_id`,
                    to: `${dbNames.companies.tableName}.id`,
                },
            },
            companyMembers: {
                relation: Model.HasManyRelation,
                modelClass: CompanyMembers,
                join: {
                    from: `${dbNames.branches.tableName}.id`,
                    to: `${dbNames.companyMembers.tableName}.branch_id`,
                },
            },
            address: {
                relation: Model.HasOneRelation,
                modelClass: Address,
                modify: 'active',
                join: {
                    from: `${dbNames.branches.tableName}.address_id`,
                    to: `${dbNames.addresses.tableName}.id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = Branch;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    toBranchBaseInfo(): BranchBaseInfo {
        return {
            id: this.id,
            name: this.name,
            address: this?.address?.toAddressBaseInfo() || null,
            comments: this?.comments,
            company: this?.company?.toCompanyBaseInfo(),
            status: this.status,
        };
    }
}
