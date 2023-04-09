import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    BranchEventsTypes,
    BranchIdRequest,
    CreateBranchRequest,
    CreateBranchResponse,
    EditBranchRequest,
    GetBranchResponse,
} from '@signy/branch';
import { ApiSuccessResponse } from '@signy/exceptions';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BranchService {
    private logger: Logger;
    constructor(@Inject('GATEWAY_BRANCH_PUBLISHER') private natsClient: ClientProxy) {
        this.logger = new Logger(BranchService.name);
    }

    async createBranch(dto: CreateBranchRequest): Promise<CreateBranchResponse> {
        return await lastValueFrom(
            this.natsClient.send<CreateBranchResponse, CreateBranchRequest>(BranchEventsTypes.CreateBranch, dto)
        );
    }

    async editBranch(dto: EditBranchRequest): Promise<GetBranchResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetBranchResponse, EditBranchRequest>(BranchEventsTypes.EditBranch, dto)
        );
    }

    async getBranchById(dto: BranchIdRequest): Promise<GetBranchResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetBranchResponse, BranchIdRequest>(BranchEventsTypes.GetBranchById, dto)
        );
    }

    async deleteBranch(dto: BranchIdRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, BranchIdRequest>(BranchEventsTypes.DeleteBranch, dto)
        );
    }
}
