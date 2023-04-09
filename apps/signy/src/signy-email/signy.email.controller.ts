import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
    CreateEmailTemplateRequest,
    UploadTemplateFilesToS3Request,
    UploadTemplateFilesToS3Response,
    SignyEmailEventType,
    CreateTemplateResponse,
    UploadSignyCompanyLogoResponse,
    UploadSignyCompanyLogoRequest,
    GetEmailTemplateWithPermissionRequest,
    GetSignyEmailTemplateByIdResponse,
    SignySendEmailRequest,
    SignySendSmsRequest,
    GetSignySmsTemplateByIdResponse,
    GetSmsTemplateWithPermissionRequest,
    CreateSmsTemplateResponse,
    CreateSmsTemplateRequest,
} from '@signy/signy-email';
import { ApiSuccessResponse } from '@signy/exceptions';
import { SignyEmailService } from './signy.email.service';

@Controller()
export class SignyEmailController {
    constructor(private readonly signyEmailService: SignyEmailService) {}

    @MessagePattern(SignyEmailEventType.CreateEmailTemplate)
    async createEmailTemplate(dto: CreateEmailTemplateRequest): Promise<CreateTemplateResponse> {
        return await this.signyEmailService.createEmailTemplate(dto);
    }

    @MessagePattern(SignyEmailEventType.UploadTemplateFilesToS3)
    async uploadTemplateFilesToS3(dto: UploadTemplateFilesToS3Request): Promise<UploadTemplateFilesToS3Response> {
        return await this.signyEmailService.uploadTemplateFilesToS3(dto);
    }

    @MessagePattern(SignyEmailEventType.UploadCompanyLogo)
    async uploadCompanyLogo(dto: UploadSignyCompanyLogoRequest): Promise<UploadSignyCompanyLogoResponse> {
        return await this.signyEmailService.uploadCompanyLogo(dto);
    }

    @MessagePattern(SignyEmailEventType.GetSignyEmailTemplateById)
    async getSignyEmailTemplateById(
        dto: GetEmailTemplateWithPermissionRequest
    ): Promise<GetSignyEmailTemplateByIdResponse> {
        return await this.signyEmailService.getSignyEmailTemplateById(dto);
    }

    @MessagePattern(SignyEmailEventType.SignySendEmail)
    async sendEmail(dto: SignySendEmailRequest): Promise<ApiSuccessResponse> {
        return await this.signyEmailService.sendEmail(dto);
    }

    @MessagePattern(SignyEmailEventType.SignySendSms)
    async sendSms(dto: SignySendSmsRequest): Promise<ApiSuccessResponse> {
        return await this.signyEmailService.sendSms(dto);
    }

    @MessagePattern(SignyEmailEventType.CreateSmsTemplate)
    async createSmsTemplate(dto: CreateSmsTemplateRequest): Promise<CreateSmsTemplateResponse> {
        return await this.signyEmailService.createSmsTemplate(dto);
    }

    @MessagePattern(SignyEmailEventType.GetSignySmsTemplateById)
    async getSignySmsTemplateById(dto: GetSmsTemplateWithPermissionRequest): Promise<GetSignySmsTemplateByIdResponse> {
        return await this.signyEmailService.getSignySmsTemplateById(dto);
    }
}
