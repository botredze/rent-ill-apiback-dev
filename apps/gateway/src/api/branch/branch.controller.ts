import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SessionUserInfo } from '@signy/auth';
import {
    BranchIdRequest,
    CreateBranchRequest,
    CreateBranchResponse,
    EditBranchRequest,
    GetBranchResponse,
} from '@signy/branch';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { UserPassport } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { BranchService } from './branch.service';

@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiTags('Branch')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('branch')
@UseGuards(JwtAuthGuard)
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Post('create-branch')
    @ApiOperation({ summary: 'Create new branch' })
    async createBranch(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: CreateBranchRequest
    ): Promise<CreateBranchResponse> {
        return await this.branchService.createBranch({ ...dto, userId });
    }

    @Post('edit-branch')
    @ApiOperation({ summary: 'Edit branch' })
    async editBranch(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: EditBranchRequest
    ): Promise<GetBranchResponse> {
        return await this.branchService.editBranch({ ...dto, userId });
    }

    @Post('get-branch-by-id')
    @ApiOperation({ summary: 'Get branch by id' })
    async getBranchById(@Body() dto: BranchIdRequest): Promise<GetBranchResponse> {
        return await this.branchService.getBranchById({ ...dto });
    }

    @Post('delete-branch')
    @ApiOperation({ summary: 'Delete branch' })
    async deleteBranch(@Body() dto: BranchIdRequest): Promise<ApiSuccessResponse> {
        return await this.branchService.deleteBranch({ ...dto });
    }
}
