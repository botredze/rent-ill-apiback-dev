import { StatusType } from '@signy/common';
import { Branch } from './branches';
import { AnyQueryBuilder, Model } from 'objection';
import { Company } from './company';
import { PermissionActions } from './permission.actions';
import { User } from './user';
import { dbNames } from '../db.names';
import { RoleBaseInfo } from '@signy/roles';

export class Roles extends Model {
    id: number;

    user_id?: number | null;

    company_id?: number | null;

    branch_id?: number | null;

    name: string;

    sub_type_name?: string | null;

    status: StatusType;

    permissionActions?: PermissionActions[];
    company?: Company;
    branch?: Branch;
    user?: User;

    static get tableName() {
        return dbNames.roles.tableName;
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
                user_id: { type: ['null', 'integer'] },
                company_id: { type: ['null', 'integer'] },
                branch_id: { type: ['null', 'integer'] },
                name: { type: 'string' },
                sub_type_name: { type: ['null', 'string'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            permissionActions: {
                relation: Model.HasManyRelation,
                modelClass: PermissionActions,
                join: {
                    from: `${dbNames.roles.tableName}.id`,
                    to: `${dbNames.permissionActions.tableName}.role_id`,
                },
            },
            company: {
                relation: Model.HasOneRelation,
                modelClass: Company,
                join: {
                    from: `${dbNames.roles.tableName}.company_id`,
                    to: `${dbNames.companies.tableName}.id`,
                },
            },
            branch: {
                relation: Model.HasOneRelation,
                modelClass: Branch,
                join: {
                    from: `${dbNames.roles.tableName}.branch_id`,
                    to: `${dbNames.branches.tableName}.id`,
                },
            },
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${dbNames.roles.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = Roles;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    toRoleBaseInfo(): RoleBaseInfo {
        return {
            id: this.id,
            name: this.name,
            subTypeName: this.sub_type_name,
            status: this.status,
            user: this.user?.toUserBaseInfoDTO() ? this.user.toUserBaseInfoDTO() : null,
            company: this?.company?.toCompanyBaseInfo() ? this.company.toCompanyBaseInfo() : null,
            branch: this?.branch?.toBranchBaseInfo() ? this.branch.toBranchBaseInfo() : null,
            permissionActions: this?.permissionActions?.length
                ? this.permissionActions.map((x: PermissionActions) => {
                      return { ...x?.toPermissionActionsBaseInfo() };
                  })
                : null,
        };
    }
}
