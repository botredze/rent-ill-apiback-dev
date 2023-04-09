import { EmailLocalsParams, ExtraLocalParams } from '.';
import { EmailType } from '../enums';

export class SendEmailRequest {
    to: string;
    cc?: string[];
    bcc?: string[];
    emailType: EmailType;
    locals: EmailLocalsParams;
}

export class SendBulkEmailRequest {
    bcc: string[];
    template: string;
    locals: ExtraLocalParams[];
}
