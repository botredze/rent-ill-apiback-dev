import { AnyQueryBuilder, Model } from 'objection';
import { PermissionActionsBaseInfo, PermissionTypes } from '@signy/roles';
import { StatusType } from '@signy/common';
import { Roles } from './roles';
import { dbNames } from '../db.names';
export class PermissionActions extends Model {
    id: number;

    role_id: number;

    type: PermissionTypes;

    create: boolean;

    read: boolean;

    write: boolean;

    update: boolean;

    delete: boolean;

    reports: boolean;

    status: StatusType;

    role?: Roles;

    static get tableName() {
        return dbNames.permissionActions.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['role_id', 'type'],

            properties: {
                id: { type: 'integer' },
                role_id: { type: 'integer' },
                type: { enum: Object.values(PermissionTypes) },
                create: { type: 'boolean', default: false },
                read: { type: 'boolean', default: false },
                write: { type: 'boolean', default: false },
                update: { type: 'boolean', default: false },
                delete: { type: 'boolean', default: false },
                reports: { type: 'boolean', default: false },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            role: {
                relation: Model.BelongsToOneRelation,
                modelClass: Roles,
                join: {
                    from: `${dbNames.permissionActions.tableName}.role_id`,
                    to: `${dbNames.roles.tableName}.id`,
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

    toPermissionActionsBaseInfo(): PermissionActionsBaseInfo {
        return {
            id: this.id,
            type: this.type,
            create: Boolean(this.create),
            read: Boolean(this.read),
            write: Boolean(this.write),
            update: Boolean(this.update),
            delete: Boolean(this.delete),
            reports: Boolean(this.reports),
            status: this.status,
        };
    }
}
