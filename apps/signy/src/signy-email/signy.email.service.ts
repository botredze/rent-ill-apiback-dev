import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { SignyEmailTemplate, SignyDocumentSignatories, SmsInfo } from '@signy/db';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { EmailEventType, ExtraLocalParams, SendBulkEmailRequest, SendEmailResponse } from '@signy/email';
import { SmsService, SmsTypes } from '@signy/sms';
import { commonConstants } from '@signy/common';

@Injectable()
export class SignyEmailService {
    private logger: Logger;
    constructor(
        @Inject('SIGNY_EMAIL_SERVICE') private natsClient: ClientProxy,
        private readonly smsService: SmsService
    ) {
        this.logger = new Logger(SignyEmailService.name);
    }

    private async getTemplateWithPermission({
        emailTemplateId,
        userId,
    }: GetEmailTemplateWithPermissionRequest): Promise<SignyEmailTemplate> {
        const template = userId
            ? await SignyEmailTemplate.query().modify('active').findOne({ user_id: userId, id: emailTemplateId })
            : await SignyEmailTemplate.query().modify('active').findOne({ id: emailTemplateId });

        if (!template) {
            throw ServiceRpcException(ApiEC.SignyEmailTemplateNotFound);
        }

        return template;
    }

    async createEmailTemplate({
        emailTemplateId,
        template,
        userId,
    }: CreateEmailTemplateRequest): Promise<CreateTemplateResponse> {
        if (!template || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let emailTemplate: SignyEmailTemplate | undefined;
        if (emailTemplateId) {
            emailTemplate = await this.getTemplateWithPermission({ userId, emailTemplateId });

            if (!emailTemplate) {
                throw ServiceRpcException(ApiEC.SignyEmailTemplateNotFound);
            }
            emailTemplate = await emailTemplate.$query().patchAndFetch({
                template,
            });
        } else {
            emailTemplate = await SignyEmailTemplate.query().insertAndFetch({
                user_id: userId,
                template,
            });
        }

        return { template: emailTemplate.toEmailTemplateBaseInfo() };
    }

    async uploadTemplateFilesToS3({
        userId,
        uploadedFiles,
        emailTemplateId,
    }: UploadTemplateFilesToS3Request): Promise<UploadTemplateFilesToS3Response> {
        if (!uploadedFiles?.length || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let emailTemplate: SignyEmailTemplate | undefined;
        if (emailTemplateId) {
            emailTemplate = await this.getTemplateWithPermission({ userId, emailTemplateId });

            if (!emailTemplate) {
                throw ServiceRpcException(ApiEC.SignyEmailTemplateNotFound);
            }
            emailTemplate = await emailTemplate.$query().patchAndFetch({
                file_urls: emailTemplate?.file_urls?.length
                    ? // eslint-disable-next-line no-unsafe-optional-chaining
                      [...uploadedFiles, ...emailTemplate?.file_urls]
                    : [...uploadedFiles],
            });
        } else {
            emailTemplate = await SignyEmailTemplate.query().insertAndFetch({
                user_id: userId,
                file_urls: uploadedFiles,
            });
        }

        return {
            templateId: emailTemplate.id,
            files: uploadedFiles,
        };
    }

    async uploadCompanyLogo({
        uploadedLogo,
        userId,
        emailTemplateId,
    }: UploadSignyCompanyLogoRequest): Promise<UploadSignyCompanyLogoResponse> {
        if (!uploadedLogo.imageUrl || !userId || !emailTemplateId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let template = await this.getTemplateWithPermission({ userId, emailTemplateId });

        const oldLogo = template.company_logo;

        template = await template.$query().patchAndFetch({ company_logo: uploadedLogo });

        return {
            template: template.toEmailTemplateBaseInfo(),
            oldLogo: oldLogo || undefined,
        };
    }

    async getSignyEmailTemplateById({
        emailTemplateId,
        userId,
    }: GetEmailTemplateWithPermissionRequest): Promise<GetSignyEmailTemplateByIdResponse> {
        const template = await this.getTemplateWithPermission({ userId, emailTemplateId });

        return {
            template: template.toEmailTemplateBaseInfo(),
        };
    }

    async sendEmail({ emailTemplateId, userId, signatoriesIds }: SignySendEmailRequest): Promise<ApiSuccessResponse> {
        if (!signatoriesIds.length) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const template = await this.getTemplateWithPermission({ emailTemplateId, userId });

        const users = await SignyDocumentSignatories.query()
            .withGraphJoined('contact')
            .modify('active')
            .whereIn('signy_document_signatories.id', signatoriesIds);

        if (!users?.length) {
            return { ok: false };
        }

        const emails: string[] = [];
        const locals: ExtraLocalParams[] = [];
        for (const x of users) {
            if (x.email) {
                emails.push(x.email);

                locals.push({
                    fullName: x?.name
                        ? x.name
                        : x.contact?.fullName
                        ? x.contact.fullName
                        : commonConstants.defaultUserName,
                    email: x.email,
                });
            }
        }

        let isSent = false;
        if (emails.length && locals.length) {
            isSent = (
                await lastValueFrom(
                    this.natsClient.send<SendEmailResponse, SendBulkEmailRequest>(EmailEventType.SendBulkEmail, {
                        bcc: emails,
                        template: template.template,
                        locals,
                    })
                )
            ).isSent;
        }

        return { ok: isSent };
    }

    async sendSms({ signatoriesIds, smsTemplateId }: SignySendSmsRequest): Promise<ApiSuccessResponse> {
        if (!signatoriesIds.length || !smsTemplateId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const smsInfo = await SmsInfo.query().modify('active').findOne({ id: smsTemplateId });

        if (!smsInfo) {
            throw ServiceRpcException(ApiEC.SmsInfoNotFound);
        }

        const users = await SignyDocumentSignatories.query()
            .withGraphJoined('contact')
            .modify('active')
            .whereIn('signy_document_signatories.id', signatoriesIds);

        if (!users?.length) {
            return { ok: false };
        }

        let isSent = false;

        for (const x of users) {
            let phone;
            if (x?.phone) {
                phone = x.phone;
            } else if (!x?.phone && x.contact?.phone) {
                phone = x.contact.phone;
            }
            if (phone) {
                const message = smsInfo?.message.replace(
                    '{fullName}',
                    x.contact?.fullName || commonConstants.defaultUserName
                );
                isSent = (
                    await this.smsService.sendSms({
                        phone,
                        message,
                        orignator: smsInfo?.originator,
                    })
                ).isSent;
            }
        }

        return { ok: isSent };
    }

    async createSmsTemplate({
        smsTemplateId,
        message,
        userId,
    }: CreateSmsTemplateRequest): Promise<CreateSmsTemplateResponse> {
        if (!message || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let smsTemplate: SmsInfo | undefined;
        if (smsTemplateId) {
            smsTemplate = await SmsInfo.query().modify('active').findOne({ id: smsTemplateId, user_id: userId });

            if (!smsTemplate) {
                throw ServiceRpcException(ApiEC.SmsInfoNotFound);
            }
            smsTemplate = await smsTemplate.$query().patchAndFetch({
                message,
            });
        } else {
            smsTemplate = await SmsInfo.query().insertAndFetch({
                user_id: userId,
                message,
                originator: commonConstants.defaultSignySmsOriginator,
                additional_info: commonConstants.defaultSignySmsAdditionalInfo,
                type: SmsTypes.SignySms,
            });
        }

        return { template: smsTemplate.toSmsBaseInfo() };
    }

    async getSignySmsTemplateById({
        smsTemplateId,
        userId,
    }: GetSmsTemplateWithPermissionRequest): Promise<GetSignySmsTemplateByIdResponse> {
        const template = await SmsInfo.query().modify('active').findOne({ id: smsTemplateId, user_id: userId });

        if (!template) {
            throw ServiceRpcException(ApiEC.SmsInfoNotFound);
        }

        return {
            template: template.toSmsBaseInfo(),
        };
    }
}
