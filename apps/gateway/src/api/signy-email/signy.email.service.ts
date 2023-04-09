import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    CreateEmailTemplateRequest,
    CreateSmsTemplateRequest,
    CreateSmsTemplateResponse,
    CreateTemplateResponse,
    GetEmailTemplateWithPermissionRequest,
    GetSignyEmailTemplateByIdResponse,
    GetSignySmsTemplateByIdResponse,
    GetSmsTemplateWithPermissionRequest,
    SignyEmailEventType,
    SignySendEmailRequest,
    SignySendSmsRequest,
    UploadSignyCompanyLogoRequest,
    UploadSignyCompanyLogoResponse,
    UploadTemplateFilesToS3Request,
    UploadTemplateFilesToS3Response,
} from '@signy/signy-email';
import { UploadedFileInfo } from '@signy/upload';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { S3Service, uploadFolders } from '@signy/s3';
import { SendSmsResponse } from '@signy/sms';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SignyEmailService {
    private logger: Logger;
    constructor(
        @Inject('GATEWAY_SIGNY_EMAIL_PUBLISHER') private natsClient: ClientProxy,
        private s3Service: S3Service
    ) {
        this.logger = new Logger(SignyEmailService.name);
    }

    async createEmailTemplate(dto: CreateEmailTemplateRequest): Promise<CreateTemplateResponse> {
        return await lastValueFrom(
            this.natsClient.send<CreateTemplateResponse, CreateEmailTemplateRequest>(
                SignyEmailEventType.CreateEmailTemplate,
                {
                    ...dto,
                }
            )
        );
    }

    async uploadTemplateFilesToS3(dto: UploadTemplateFilesToS3Request): Promise<UploadTemplateFilesToS3Response> {
        const uploadedFiles: UploadedFileInfo[] = [];
        if (!dto?.files?.length) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        for (const x of dto.files) {
            const uploaded = await this.s3Service.uploadTemplateFile({
                stream: x.buffer,
                mimetype: x.mimetype,
                folder: uploadFolders.signyEmailTemplates,
            });
            if (uploaded) {
                uploadedFiles.push(uploaded);
            }
        }

        delete dto.files;

        return await lastValueFrom(
            this.natsClient.send<UploadTemplateFilesToS3Response, UploadTemplateFilesToS3Request>(
                SignyEmailEventType.UploadTemplateFilesToS3,
                {
                    ...dto,
                    uploadedFiles,
                }
            )
        );
    }

    async uploadCompanyLogo(dto: UploadSignyCompanyLogoRequest): Promise<UploadSignyCompanyLogoResponse> {
        if (!dto?.logo?.buffer?.length) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const uploadedLogo = await this.s3Service.uploadImage({
            stream: dto.logo.buffer,
            mimetype: dto.logo.mimetype,
            imageFolder: uploadFolders.signyCompanyLogos,
        });

        if (!uploadedLogo) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        delete dto?.logo;

        const res = await lastValueFrom(
            this.natsClient.send<UploadSignyCompanyLogoResponse, UploadSignyCompanyLogoRequest>(
                SignyEmailEventType.UploadCompanyLogo,
                {
                    ...dto,
                    uploadedLogo,
                }
            )
        );

        if (res?.oldLogo) {
            const delImageResult = await this.s3Service.deleteFile({
                url: res.oldLogo.imageUrl,
                key: res.oldLogo.imageKey,
            });
            const delThumbResult = await this.s3Service.deleteFile({
                url: res.oldLogo.thumbnailUrl,
                key: res.oldLogo.thumbnailKey,
            });

            if (!delImageResult && !delThumbResult) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }

            delete res?.oldLogo;
        }

        return res;
    }

    async getSignyEmailTemplateById(
        dto: GetEmailTemplateWithPermissionRequest
    ): Promise<GetSignyEmailTemplateByIdResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetSignyEmailTemplateByIdResponse, GetEmailTemplateWithPermissionRequest>(
                SignyEmailEventType.GetSignyEmailTemplateById,
                {
                    ...dto,
                }
            )
        );
    }

    async sendEmail(dto: SignySendEmailRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, SignySendEmailRequest>(SignyEmailEventType.SignySendEmail, dto)
        );
    }

    async sendSms(dto: SignySendSmsRequest): Promise<SendSmsResponse> {
        return await lastValueFrom(
            this.natsClient.send<SendSmsResponse, SignySendSmsRequest>(SignyEmailEventType.SignySendSms, dto)
        );
    }

    async createSmsTemplate(dto: CreateSmsTemplateRequest): Promise<CreateSmsTemplateResponse> {
        return await lastValueFrom(
            this.natsClient.send<CreateSmsTemplateResponse, CreateSmsTemplateRequest>(
                SignyEmailEventType.CreateSmsTemplate,
                dto
            )
        );
    }

    async getSignySmsTemplateById(dto: GetSmsTemplateWithPermissionRequest): Promise<GetSignySmsTemplateByIdResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetSignySmsTemplateByIdResponse, GetSmsTemplateWithPermissionRequest>(
                SignyEmailEventType.GetSignySmsTemplateById,
                dto
            )
        );
    }
}
