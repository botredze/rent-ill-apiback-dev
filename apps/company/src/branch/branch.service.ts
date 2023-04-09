import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StatusType } from '@signy/common';
import {
    BranchIdRequest,
    CreateBranchRequest,
    CreateBranchResponse,
    EditBranchRequest,
    GetBranchResponse,
} from '@signy/branch';
import { Branch } from '@signy/db';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { Transaction } from 'objection';
import { AddressService } from '../address/address.service';
import { CompanyService } from '../company/company.service';

@Injectable()
export class BranchService {
    private logger: Logger;
    constructor(
        @Inject('BRANCH_SERVICE') private natsClient: ClientProxy,
        @Inject(Branch) private readonly branchModel: typeof Branch,
        private addressService: AddressService,
        @Inject(forwardRef(() => CompanyService))
        private companyService: CompanyService
    ) {
        this.logger = new Logger(BranchService.name);
    }

    private async getBranch({ branchId }: BranchIdRequest, trx?: Transaction): Promise<Branch> {
        if (!branchId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const branch = await this.branchModel
            .query(trx)
            .modify('active')
            .withGraphJoined('[company.[owner.[profile]], address]')
            .findOne({ 'branches.id': branchId });
        if (!branch) {
            throw ServiceRpcException(ApiEC.BranchNotFound);
        }
        return branch;
    }

    async createBranch({
        userId,
        companyId,
        title,
        address,
        comments,
    }: CreateBranchRequest): Promise<CreateBranchResponse> {
        const company = await this.companyService.getCompanyWithPermission({ userId, companyId });

        const trx = await this.branchModel.startTransaction();

        let branch: Branch | null;
        try {
            const newAddress = await this.addressService.createAddress(address, trx);

            if (!newAddress) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }

            branch = await this.branchModel.query(trx).insertAndFetch({
                name: title,
                company_id: company.id,
                address_id: newAddress.id,
                comments,
            });

            branch = await branch.$query(trx).withGraphJoined('[company.[owner.[profile]], address]');

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        if (!branch) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return {
            branch: branch.toBranchBaseInfo(),
        };
    }

    async editBranch({ userId, comments, title, address, branchId }: EditBranchRequest): Promise<GetBranchResponse> {
        if (!userId) throw ServiceRpcException(ApiEC.WrongInput);

        const branch = await this.getBranch({ branchId });

        let addressId: number | null = null;
        if (address) {
            addressId = (await this.addressService.editAddress(address))?.id;
        }

        await branch.$query().patchAndFetch({
            name: title,
            address_id: addressId ? addressId : branch?.address_id,
            comments,
        });

        if (!branch) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return { branch: branch.toBranchBaseInfo() };
    }

    async getBranchById({ branchId }: BranchIdRequest, trx?: Transaction): Promise<GetBranchResponse> {
        if (!branchId) throw ServiceRpcException(ApiEC.WrongInput);

        const branch = await this.getBranch({ branchId }, trx);

        return { branch: branch?.toBranchBaseInfo() };
    }

    async deleteBranch({ branchId }: BranchIdRequest): Promise<ApiSuccessResponse> {
        if (!branchId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const branch = await this.getBranch({ branchId });

        await branch.$query().patchAndFetch({ status: StatusType.Deleted });

        return { ok: !!branch };
    }
}
