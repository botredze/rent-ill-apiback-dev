import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
    CompanyEventsTypes,
    CreateCompanyRequest,
    CreateCompanyResponse,
    EditCompanyRequest,
    GetCompanyByIdRequest,
    GetCompanyResponse,
    SetCompanyLogoResponse,
    SetComponyLogoRequest,
    CheckLogoExistanceInfo,
    InviteMemberRequest,
} from '@signy/company';
import { ApiSuccessResponse } from '@signy/exceptions';
import { CompanyService } from './company.service';

@Controller()
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @MessagePattern(CompanyEventsTypes.CreateCompany)
    async createCompany(dto: CreateCompanyRequest): Promise<CreateCompanyResponse> {
        return await this.companyService.createCompany(dto);
    }

    @MessagePattern(CompanyEventsTypes.EditCompany)
    async editCompany(dto: EditCompanyRequest): Promise<GetCompanyResponse> {
        return await this.companyService.editCompany(dto);
    }

    @MessagePattern(CompanyEventsTypes.GetCompanyById)
    async getCompanyById(dto: GetCompanyByIdRequest): Promise<GetCompanyResponse> {
        return await this.companyService.getCompanyById(dto);
    }

    @MessagePattern(CompanyEventsTypes.SetCompanyLogo)
    async setCompanyLogo(dto: SetComponyLogoRequest): Promise<SetCompanyLogoResponse> {
        return await this.companyService.setCompanyLogo(dto);
    }

    @MessagePattern(CompanyEventsTypes.DeleteCompany)
    async deleteCompany(dto: GetCompanyByIdRequest): Promise<CheckLogoExistanceInfo> {
        return await this.companyService.deleteCompany(dto);
    }

    @MessagePattern(CompanyEventsTypes.InviteMember)
    async inviteMember(dto: InviteMemberRequest): Promise<ApiSuccessResponse> {
        return await this.companyService.inviteMember(dto);
    }
}
