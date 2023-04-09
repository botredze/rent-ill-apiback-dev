import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InvitationStatusTypes, RequestType, StatusType, UserIdRequest } from '@signy/common';
import { AuthEventType, SignUpByInvitationRequest } from '@signy/auth';
import {
    CheckLogoExistanceInfo,
    CreateCompanyRequest,
    CreateCompanyResponse,
    EditCompanyRequest,
    GetCompanyByIdRequest,
    GetCompanyResponse,
    InviteMemberRequest,
    SetCompanyLogoResponse,
    SetComponyLogoRequest,
} from '@signy/company';
import { Address, Company, CompanyMembers, Invitation, SignyCompanyDocument, User } from '@signy/db';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { Transaction } from 'objection';
import { lastValueFrom } from 'rxjs';
import { AddressService } from '../address/address.service';
import { BranchService } from '../branch/branch.service';
import { RoleService } from '../role/role.service';

@Injectable()
export class CompanyService {
    private logger: Logger;
    constructor(
        @Inject('COMPANY_SERVICE') private natsClient: ClientProxy,
        @Inject(Company) private readonly companyModel: typeof Company,
        @Inject(Invitation) private readonly invitationModel: typeof Invitation,
        @Inject(CompanyMembers) private readonly companyMembersModel: typeof CompanyMembers,
        private addressService: AddressService,
        @Inject(forwardRef(() => BranchService))
        private branchService: BranchService,
        @Inject(forwardRef(() => RoleService))
        private roleService: RoleService
    ) {
        this.logger = new Logger(CompanyService.name);
    }

    async getCompanyWithPermission({ companyId, userId }: GetCompanyByIdRequest, trx?: Transaction): Promise<Company> {
        if (!companyId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const company = await this.companyModel
            .query(trx)
            .modify('active')
            .withGraphJoined('[owner.[profile], address]')
            .findOne({ 'companies.id': companyId, owner_id: userId });
        if (!company) {
            throw ServiceRpcException(ApiEC.CompanyNotFound);
        }
        return company;
    }

    async createCompany({
        userId,
        comments,
        documentId,
        companyNationalId,
        companyType,
        title,
        address,
    }: CreateCompanyRequest): Promise<CreateCompanyResponse> {
        const trx = await this.companyModel.startTransaction();

        let company: Company | null;
        try {
            let newAddress: Address | undefined;
            if (address) {
                newAddress = await this.addressService.createAddress(address, trx);

                if (!newAddress) {
                    throw ServiceRpcException(ApiEC.InternalServerError);
                }
            }

            company = await this.companyModel.query(trx).insertAndFetch({
                national_company_id: companyNationalId,
                name: title,
                owner_id: userId,
                company_type: companyType,
                address_id: newAddress ? newAddress.id : null,
                comments,
            });

            company = await company.$query(trx).withGraphJoined('[owner.[profile], address]');

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        if (!company) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        if (documentId) {
            await SignyCompanyDocument.query().insert({ document_id: documentId, company_id: company.id });
        }

        return {
            company: company.toCompanyBaseInfo(),
        };
    }

    async editCompany({
        userId,
        companyId,
        comments,
        companyNationalId,
        companyType,
        title,
        address,
    }: EditCompanyRequest): Promise<GetCompanyResponse> {
        if (!userId || !companyId) throw ServiceRpcException(ApiEC.WrongInput);

        const company = await this.getCompanyWithPermission({ userId, companyId });

        let addressId: number | null = null;
        if (address) {
            addressId = (await this.addressService.editAddress(address))?.id;
        }

        await company.$query().patchAndFetch({
            national_company_id: companyNationalId,
            name: title,
            company_type: companyType,
            address_id: addressId ? addressId : company?.address_id,
            comments,
        });

        if (!company) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return { company: company.toCompanyBaseInfo() };
    }

    async getCompanyById({ userId, companyId }: GetCompanyByIdRequest): Promise<GetCompanyResponse> {
        if (!userId || !companyId) throw ServiceRpcException(ApiEC.WrongInput);

        const company = await this.getCompanyWithPermission({ userId, companyId });

        return { company: company?.toCompanyBaseInfo() };
    }

    async setCompanyLogo({ userId, companyId, uploadedImage }: SetComponyLogoRequest): Promise<SetCompanyLogoResponse> {
        if (!userId || !companyId || !uploadedImage) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const company = await this.companyModel
            .query()
            .modify('active')
            .withGraphJoined('[owner.[profile], address]')
            .findOne({ 'companies.id': companyId, owner_id: userId });

        if (!company) {
            throw ServiceRpcException(ApiEC.CompanyNotFound);
        }

        const oldLogo = company?.logo;

        await company.$query().patchAndFetch({ logo: uploadedImage });

        if (!company) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return { uploadedImage, logoExists: { companyLogo: oldLogo, exists: !!oldLogo } };
    }

    async deleteCompany({ companyId, userId }: GetCompanyByIdRequest): Promise<CheckLogoExistanceInfo> {
        if (!companyId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const company = await this.getCompanyWithPermission({ userId, companyId });

        await company.$query().patchAndFetch({ status: StatusType.Deleted });

        return { exists: !!company?.logo, companyLogo: company.logo };
    }

    async inviteMember({
        email,
        phone,
        roleId,
        branchId,
        companyId,
        coords,
        dob,
        gender,
        //TODO add message to email
        // invitationMessage,
        lastName,
        name,
        userId,
        personId,
        userNationalId,
        userLocation,
        existingUser,
    }: InviteMemberRequest): Promise<ApiSuccessResponse> {
        if (!email && !phone) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        if (existingUser && !personId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const trx = await this.companyMembersModel.startTransaction();

        let companyMember: CompanyMembers;
        try {
            const invitationExist = await this.invitationModel
                .query(trx)
                .findOne({
                    user_id: userId,
                    person_id: personId,
                    email,
                    phone,
                    request_type: companyId ? RequestType.Company : RequestType.Branch,
                })
                .skipUndefined();

            if (invitationExist) {
                throw ServiceRpcException(ApiEC.InvitationAlreadyExists);
            }

            if (companyId) {
                await this.getCompanyWithPermission({ userId, companyId }, trx);
            }

            if (branchId) {
                await this.branchService.getBranchById({ branchId }, trx);
            }

            let user: User | null = null;
            if (existingUser && personId) {
                user = await lastValueFrom(
                    this.natsClient.send<User, UserIdRequest>(AuthEventType.GetUserById, { userId: personId })
                );
            } else {
                user = await lastValueFrom(
                    this.natsClient.send<User, SignUpByInvitationRequest>(AuthEventType.SignUpByInvitation, {
                        email,
                        phone,
                        coords,
                        dob,
                        gender,
                        lastName,
                        firstName: name,
                        nationalId: userNationalId,
                        location: userLocation,
                    })
                );
            }

            if (!user) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }

            const isMember = await this.companyMembersModel.query(trx).modify('active').findOne({
                user_id: user.id,
                company_id: companyId,
                branch_id: branchId,
            });

            if (isMember) {
                throw ServiceRpcException(ApiEC.AlreadyMember);
            }

            let role = null;
            if (roleId) {
                role = (
                    await this.roleService.getRoleAndCreate(
                        { userId, personId: personId || user.id, companyId, branchId, roleId },
                        trx
                    )
                ).role;
            }

            if (!role) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }

            const invitation = await this.invitationModel.query(trx).insertAndFetch({
                user_id: user.id,
                person_id: userId,
                email,
                phone,
                token: user?.session?.token,
                request_type: companyId ? RequestType.Company : RequestType.Branch,
                status: InvitationStatusTypes.Pending,
            });

            if (!invitation) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            companyMember = await this.companyMembersModel.query(trx).insertAndFetch({
                user_id: invitation.user_id,
                role_id: role.id,
                company_id: companyId,
                branch_id: branchId,
            });

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        if (!companyMember) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return { ok: true };
    }
}
