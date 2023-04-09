import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GetCompanyByIdRequest, UserIdRequest } from '@signy/common';
import { PermissionActions, Roles, User } from '@signy/db';
import { ApiEC, ServiceRpcException } from '@signy/exceptions';
import {
    CreateRoleRequest,
    CreateRoleResponse,
    GetRoleAndCreateRequest,
    ListCompanyRolesResponse,
    RoleTypesInfo,
} from '@signy/roles';
import { CompanyService } from '../company/company.service';
import { lastValueFrom } from 'rxjs';
import { AuthEventType } from '@signy/auth';
import { Transaction } from 'objection';

@Injectable()
export class RoleService {
    private logger: Logger;
    constructor(
        @Inject('ROLE_SERVICE') private natsClient: ClientProxy,
        @Inject(Roles) private readonly rolesModel: typeof Roles,
        @Inject(PermissionActions) private readonly permissionActionsModel: typeof PermissionActions,
        @Inject(forwardRef(() => CompanyService))
        private companyService: CompanyService
    ) {
        this.logger = new Logger(RoleService.name);
    }

    async createRole({
        userId,
        branchId,
        companyId,
        name,
        personId,
        subTypeName,
        type,
    }: CreateRoleRequest): Promise<CreateRoleResponse> {
        if (!userId || !name) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        if (!companyId && !branchId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        if (personId) {
            await lastValueFrom(
                this.natsClient.send<User, UserIdRequest>(AuthEventType.GetUserById, { userId: personId })
            );
        }

        if (companyId) {
            await this.companyService.getCompanyWithPermission({ userId, companyId });
        }

        if (branchId) {
            // await this.branchService.getBranchById({ branchId });
        }

        const trx = await this.rolesModel.startTransaction();

        let role: Roles;
        try {
            role = await this.rolesModel.query(trx).insertAndFetch({
                user_id: personId,
                branch_id: branchId ? branchId : null,
                company_id: companyId ? companyId : null,
                name,
                sub_type_name: subTypeName ? subTypeName : null,
            });
            for (const x of type) {
                if (x?.type) {
                    await this.permissionActionsModel.query(trx).insert({
                        role_id: role.id,
                        type: x.type,
                        create: Boolean(x.create),
                        write: Boolean(x.write),
                        delete: Boolean(x.delete),
                        update: Boolean(x.update),
                        read: Boolean(x.read),
                        reports: Boolean(x.reports),
                    });
                }
            }

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }
        role = await role
            .$query()
            .withGraphJoined('[permissionActions, company.[owner.[profile], address], branch, user.[profile]]');

        if (!role) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return {
            role: role.toRoleBaseInfo(),
        };
    }

    async listCompanyRoles({ companyId, userId }: GetCompanyByIdRequest): Promise<ListCompanyRolesResponse> {
        if (!companyId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await this.companyService.getCompanyWithPermission({ userId, companyId });

        const roles = await this.rolesModel
            .query()
            .withGraphJoined('permissionActions')
            .modify('active')
            .where({ company_id: companyId });

        return {
            roles: roles?.length
                ? roles.map((x) => {
                      return { ...x.toRoleBaseInfo(), branch: undefined, user: undefined, company: undefined };
                  })
                : null,
        };
    }

    async getRoleAndCreate(
        { roleId, companyId, branchId, personId, userId }: GetRoleAndCreateRequest,
        trx?: Transaction
    ): Promise<CreateRoleResponse> {
        if (!roleId || !personId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        if (!companyId && !branchId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const role = await this.rolesModel
            .query(trx)
            .withGraphJoined('permissionActions')
            .modify('active')
            .findById(roleId);
        if (!role) {
            throw ServiceRpcException(ApiEC.RoleNotFound);
        }
        const permissions: RoleTypesInfo[] = [];

        role?.permissionActions?.map((x) => {
            permissions.push({
                type: x.type,
                create: x.create,
                write: x.write,
                delete: x.delete,
                update: x.update,
                read: x.read,
                reports: x.reports,
            });
        });
        return await this.createRole({
            name: role.name,
            companyId,
            branchId,
            personId,
            userId,
            subTypeName: role.sub_type_name,
            type: permissions,
        });
    }
}
