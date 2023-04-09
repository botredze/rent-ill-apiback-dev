import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
    BranchEventsTypes,
    BranchIdRequest,
    CreateBranchRequest,
    CreateBranchResponse,
    EditBranchRequest,
    GetBranchResponse,
} from '@signy/branch';
import { ApiSuccessResponse } from '@signy/exceptions';
import { BranchService } from './branch.service';

@Controller()
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @MessagePattern(BranchEventsTypes.CreateBranch)
    async createBranch(dto: CreateBranchRequest): Promise<CreateBranchResponse> {
        return await this.branchService.createBranch(dto);
    }

    @MessagePattern(BranchEventsTypes.EditBranch)
    async editBranch(dto: EditBranchRequest): Promise<GetBranchResponse> {
        return await this.branchService.editBranch(dto);
    }

    @MessagePattern(BranchEventsTypes.GetBranchById)
    async getBranchById(dto: BranchIdRequest): Promise<GetBranchResponse> {
        return await this.branchService.getBranchById(dto);
    }

    @MessagePattern(BranchEventsTypes.DeleteBranch)
    async deleteBranch(dto: BranchIdRequest): Promise<ApiSuccessResponse> {
        return await this.branchService.deleteBranch(dto);
    }
}
