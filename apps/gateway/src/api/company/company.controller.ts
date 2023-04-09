import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
    CreateCompanyRequest,
    CreateCompanyResponse,
    EditCompanyRequest,
    GetCompanyByIdRequest,
    GetCompanyResponse,
    InviteMemberRequest,
    SetCompanyLogoResponse,
    UploadCompanyLogoRequest,
} from '@signy/common';
import { SessionUserInfo } from '@signy/auth';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { imageFileFilter, uploadConstants } from '@signy/s3';
import { UserPassport } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { CompanyService } from './company.service';

@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiTags('Company')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Post('create-company')
    @ApiOperation({ summary: 'Create new company' })
    async createCompany(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: CreateCompanyRequest
    ): Promise<CreateCompanyResponse> {
        return await this.companyService.createCompany({ ...dto, userId });
    }

    @Post('edit-company')
    @ApiOperation({ summary: 'Edit company' })
    async editCompany(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: EditCompanyRequest
    ): Promise<GetCompanyResponse> {
        return await this.companyService.editCompany({ ...dto, userId });
    }

    @Post('get-company-by-id')
    @ApiOperation({ summary: 'Get company by id' })
    async getCompanyById(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: GetCompanyByIdRequest
    ): Promise<GetCompanyResponse> {
        return await this.companyService.getCompanyById({ ...dto, userId });
    }

    @Post('set-company-logo')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('logo', { limits: { fileSize: uploadConstants.maxFileSize }, fileFilter: imageFileFilter })
    )
    @ApiOperation({ summary: "Set Company's logo" })
    async setCompanyLogo(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UploadCompanyLogoRequest,

        @UploadedFile() logo: Express.Multer.File
    ): Promise<SetCompanyLogoResponse> {
        return this.companyService.setCompanyLogo({ ...dto, userId, logo });
    }

    @Post('delete-company')
    @ApiOperation({ summary: 'Delete company' })
    async deleteCompany(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: GetCompanyByIdRequest
    ): Promise<ApiSuccessResponse> {
        return await this.companyService.deleteCompany({ ...dto, userId });
    }

    @Post('invite-member')
    @ApiOperation({ summary: 'Invite member to company' })
    async inviteMember(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId }: SessionUserInfo,
        @Body() dto: InviteMemberRequest
    ): Promise<ApiSuccessResponse> {
        return await this.companyService.inviteMember({ ...dto, userId });
    }
}
