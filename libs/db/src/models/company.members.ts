import { StatusType } from '@signy/common';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { Branch } from './branches';
import { Company } from './company';
import { Roles } from './roles';
import { User } from './user';
export class CompanyMembers extends Model {
    id: number;

    user_id: number;

    role_id?: number;

    company_id: number;

    branch_id?: number | null;

    status: StatusType;

    roles?: Roles[];
    user?: User;
    company?: Company;
    branch?: Branch;

    static get tableName() {
        return dbNames.companyMembers.tableName;
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
                user_id: { type: 'integer' },
                role_id: { type: ['null', 'integer'] },
                company_id: { type: 'integer' },
                branch_id: { type: ['null', 'integer'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
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
                    from: `${dbNames.companyMembers.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            company: {
                relation: Model.HasOneRelation,
                modelClass: Company,
                join: {
                    from: `${dbNames.companyMembers.tableName}.company_id`,
                    to: `${dbNames.companies.tableName}.id`,
                },
            },
            branch: {
                relation: Model.HasOneRelation,
                modelClass: Branch,
                join: {
                    from: `${dbNames.companyMembers.tableName}.branch_id`,
                    to: `${dbNames.branches.tableName}.id`,
                },
            },
            roles: {
                relation: Model.HasManyRelation,
                modelClass: Roles,
                join: {
                    from: `${dbNames.companyMembers.tableName}.user_id`,
                    to: `${dbNames.roles.tableName}.user_id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = CompanyMembers;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }
}
