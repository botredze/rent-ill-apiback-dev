import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GetCompanyByIdRequest } from '@signy/common';
import { CreateRoleRequest, CreateRoleResponse, ListCompanyRolesResponse, RoleEventsTypes } from '@signy/roles';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RoleService {
    private logger: Logger;
    constructor(@Inject('GATEWAY_ROLE_PUBLISHER') private natsClient: ClientProxy) {
        this.logger = new Logger(RoleService.name);
    }

    async createRole(dto: CreateRoleRequest): Promise<CreateRoleResponse> {
        return await lastValueFrom(
            this.natsClient.send<CreateRoleResponse, CreateRoleRequest>(RoleEventsTypes.CreateRole, dto)
        );
    }

    async listCompanyRoles(dto: GetCompanyByIdRequest): Promise<ListCompanyRolesResponse> {
        return await lastValueFrom(
            this.natsClient.send<ListCompanyRolesResponse, GetCompanyByIdRequest>(RoleEventsTypes.ListCompanyRoles, dto)
        );
    }
}
