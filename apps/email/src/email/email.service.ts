import { join } from 'path';
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import Mail from 'nodemailer/lib/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { emailConstants } from './email.constants';
import { SendBulkEmailRequest, SendEmailRequest, SendEmailResponse } from '@signy/email';
import { createFile, deleteFile } from '../utils/file.manager';

@Injectable()
export class EmailService {
    private readonly transport: nodemailer.Transporter;
    private readonly from: string;
    private readonly send: boolean;
    private logger: Logger;

    constructor(private configService: ConfigService) {
        this.logger = new Logger(EmailService.name);

        const sesConfig = {
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: this.configService.get('GMAIL_USER', ''),
                pass: this.configService.get('GMAIL_PASSWORD', ''),
            },
        };

        this.transport = nodemailer.createTransport(sesConfig);
        this.from = this.configService.get('EMAIL_FROM', '');
        this.send = Boolean(process.env.NODE_ENV !== 'test');
    }

    async sendMail({ to, cc, bcc, emailType, locals }: SendEmailRequest): Promise<SendEmailResponse> {
        if (!to && !bcc?.length) {
            this.logger.error(`sendMail cannot send email with empty recipient!`);
            return { isSent: false };
        }

        if (!this.from) {
            this.logger.error(`Please check your enviroment's vars setted properly!`);
            return { isSent: false };
        }

        if (!locals?.fullName) {
            locals.fullName = emailConstants.defaultClientName;
        }

        const template = join(__dirname, 'assets', 'templates/email', emailType);
        const message: Mail.Options = { to, from: this.from };

        if (cc?.length) {
            message.cc = cc;
        }

        if (bcc?.length) {
            message.bcc = bcc;
            delete message.to;
        }

        const email = new Email({
            message,
            send: this.send,
            preview: false,
            transport: this.transport,
        });

        this.send &&
            this.logger.debug(`sending email to: ${to}, emailType: ${emailType}, locals: ${JSON.stringify(locals)}`);

        return {
            isSent: await email
                .send({
                    template,
                    locals,
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .then((mail: any) => !!mail)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((err: any) => {
                    this.logger.error(err);
                    this.logger.error(err.stack);
                    return false;
                }),
        };
    }

    async sendBulkEmail({ template, bcc, locals }: SendBulkEmailRequest): Promise<SendEmailResponse> {
        this.send && this.logger.debug(`sending email to: ${bcc}, locals: ${JSON.stringify(locals)}`);

        const path = __dirname + `/assets/templates/email/signy_email`;
        const fileName = 'html.pug';

        await createFile(path, fileName, template);

        let isSent = false;
        for (const x of bcc) {
            const message: Mail.Options = { to: x, from: this.from };

            const email = new Email({
                message,
                send: this.send,
                preview: false,
                transport: this.transport,
            });
            isSent = await email
                .send({
                    template: path,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    locals: locals.find((y: any) => {
                        if (y.email === x) {
                            return { ...y };
                        }
                    }),
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .then((mail: any) => !!mail)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((err: any) => {
                    this.logger.error(err);
                    this.logger.error(err.stack);
                    return false;
                });
        }

        await deleteFile(path, fileName);

        return {
            isSent,
        };
    }
}
