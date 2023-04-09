import { Body, Controller, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SessionUserInfo } from '@signy/auth';
import {
    CreateEmailTemplateRequest,
    CreateSmsTemplateRequest,
    CreateSmsTemplateResponse,
    CreateTemplateResponse,
    GetEmailTemplateWithPermissionRequest,
    GetSignyEmailTemplateByIdResponse,
    GetSignySmsTemplateByIdResponse,
    GetSmsTemplateWithPermissionRequest,
    SignySendEmailRequest,
    SignySendSmsRequest,
    UploadSignyCompanyLogoRequest,
    UploadSignyCompanyLogoResponse,
    UploadTemplateFilesToS3Request,
    UploadTemplateFilesToS3Response,
} from '@signy/signy-email';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { imageFileFilter, uploadConstants } from '@signy/s3';
import { SendSmsResponse } from '@signy/sms';
import { UserPassport } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { SignyEmailService } from './signy.email.service';

@ApiTags('Signy-email')
@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('signy-email')
@UseGuards(JwtAuthGuard)
export class SignyEmailController {
    constructor(private readonly signyEmailService: SignyEmailService) {}

    @Post('create-email-template')
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiOperation({ summary: 'Create template for email' })
    async createEmailTemplate(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CreateEmailTemplateRequest
    ): Promise<CreateTemplateResponse> {
        return this.signyEmailService.createEmailTemplate({ ...dto, userId });
    }

    @Post('upload-template-files')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'files' }], {
            limits: { fileSize: uploadConstants.maxFileSize, files: uploadConstants.maxFiles },
        })
    )
    @ApiOperation({ summary: 'Upload email template files to S3' })
    async uploadTemplateFilesToS3(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UploadTemplateFilesToS3Request,
        @UploadedFiles() files?: { files: Express.Multer.File[] }
    ): Promise<UploadTemplateFilesToS3Response> {
        return await this.signyEmailService.uploadTemplateFilesToS3({
            ...dto,
            userId,
            files: files?.files,
        });
    }

    @Post('set-company-logo')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('logo', { limits: { fileSize: uploadConstants.maxFileSize }, fileFilter: imageFileFilter })
    )
    @ApiOperation({ summary: 'Set company logo in template' })
    async uploadCompanyLogo(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UploadSignyCompanyLogoRequest,
        @UploadedFile() logo: Express.Multer.File
    ): Promise<UploadSignyCompanyLogoResponse> {
        return this.signyEmailService.uploadCompanyLogo({ ...dto, logo, userId });
    }

    @Post('get-email-template-by-id')
    @ApiOperation({ summary: 'Get template by id with permission' })
    async getSignyEmailTemplateById(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: GetEmailTemplateWithPermissionRequest
    ): Promise<GetSignyEmailTemplateByIdResponse> {
        return this.signyEmailService.getSignyEmailTemplateById({ ...dto, userId });
    }

    @Post('send-email')
    @ApiOperation({ summary: 'Send email' })
    async sendEmail(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SignySendEmailRequest
    ): Promise<ApiSuccessResponse> {
        return this.signyEmailService.sendEmail({ ...dto, userId });
    }

    @Post('send-sms')
    @ApiOperation({ summary: 'Send sms' })
    async sendSms(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SignySendSmsRequest
    ): Promise<SendSmsResponse> {
        return this.signyEmailService.sendSms({ ...dto, userId });
    }

    @Post('get-sms-template-by-id')
    @ApiOperation({ summary: 'Get template by id with permission' })
    async getSignySmsTemplateById(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: GetSmsTemplateWithPermissionRequest
    ): Promise<GetSignySmsTemplateByIdResponse> {
        return this.signyEmailService.getSignySmsTemplateById({ ...dto, userId });
    }

    @Post('create-sms-template')
    @ApiOperation({ summary: 'Create template for sms' })
    async createSmsTemplate(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CreateSmsTemplateRequest
    ): Promise<CreateSmsTemplateResponse> {
        return this.signyEmailService.createSmsTemplate({ ...dto, userId });
    }
}
