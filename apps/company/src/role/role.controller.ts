import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GetCompanyByIdRequest } from '@signy/common';
import { CreateRoleRequest, CreateRoleResponse, ListCompanyRolesResponse, RoleEventsTypes } from '@signy/roles';
import { RoleService } from './role.service';

@Controller()
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @MessagePattern(RoleEventsTypes.CreateRole)
    async createRole(dto: CreateRoleRequest): Promise<CreateRoleResponse> {
        return await this.roleService.createRole(dto);
    }

    @MessagePattern(RoleEventsTypes.ListCompanyRoles)
    async listCompanyRoles(dto: GetCompanyByIdRequest): Promise<ListCompanyRolesResponse> {
        return await this.roleService.listCompanyRoles(dto);
    }
}
