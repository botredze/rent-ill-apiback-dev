import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { SendEmailRequest, SendEmailResponse, EmailEventType, SendBulkEmailRequest } from '@signy/email';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
    constructor(private readonly emailService: EmailService) {}
    @MessagePattern(EmailEventType.SendEmail)
    async sendEmailWithResponse(dto: SendEmailRequest): Promise<SendEmailResponse> {
        return this.emailService.sendMail(dto);
    }
    @EventPattern(EmailEventType.SendEmail)
    async sendEmail(dto: SendEmailRequest): Promise<SendEmailResponse> {
        return this.emailService.sendMail(dto);
    }

    @MessagePattern(EmailEventType.SendBulkEmail)
    async sendBulkEmailWithResponse(dto: SendBulkEmailRequest): Promise<SendEmailResponse> {
        return this.emailService.sendBulkEmail(dto);
    }
    @EventPattern(EmailEventType.SendBulkEmail)
    async sendBulkEmail(dto: SendBulkEmailRequest): Promise<SendEmailResponse> {
        return this.emailService.sendBulkEmail(dto);
    }
}
