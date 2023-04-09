import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetCompanyByIdRequest } from '@signy/common';
import { SessionUserInfo } from '@signy/auth';
import { ApiErrorResponse } from '@signy/exceptions';
import { CreateRoleRequest, CreateRoleResponse, ListCompanyRolesResponse } from '@signy/roles';
import { UserPassport } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { RoleService } from './role.service';

@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiTags('Role')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('role')
@UseGuards(JwtAuthGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post('create-role')
    @ApiOperation({ summary: 'Create new role' })
    async createCompany(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: CreateRoleRequest
    ): Promise<CreateRoleResponse> {
        return await this.roleService.createRole({ ...dto, userId });
    }

    @Post('list-company-roles')
    @ApiOperation({ summary: 'List company roles' })
    async listCompanyRoles(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: GetCompanyByIdRequest
    ): Promise<ListCompanyRolesResponse> {
        return await this.roleService.listCompanyRoles({ ...dto, userId });
    }
}
