import { fn } from 'objection';
import { lastValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiEC, ServiceRpcException } from '@signy/exceptions';
import { OtpCode, SmsInfo } from '@signy/db';
import { EmailEventType, EmailType, SendEmailRequest, SendEmailResponse } from '@signy/email';
import { StatusType } from '@signy/common';
import {
    OtpType,
    otpConstants,
    OtpCodeResponse,
    VerifyOtpCodeRequest,
    ChannelOtpTypeRequest,
    ChannelOtpTypeForcedRequest,
    ChannelCodeWithOtpTypeRequest,
    OtpTypeRequest,
    VerifyOtpCodeResponse,
} from '@signy/otp';
import { SlackMessageType, SlackService } from '@signy/slack';
import { SmsService, SmsTypes } from '@signy/sms';
@Injectable()
export class OtpService {
    constructor(
        @Inject('OTP_SERVICE') private natsClient: ClientProxy,
        @Inject(OtpCode) private readonly otpCodeModel: typeof OtpCode,
        private readonly slackService: SlackService,
        private readonly smsService: SmsService
    ) {}

    private static generateOtpCode(): string {
        let result = '';
        for (let i = 0; i < otpConstants.codeLength; i++) {
            result += otpConstants.codeCharacters.charAt(Math.floor(Math.random() * otpConstants.codeLength));
        }
        return result;
    }

    private async getCurrentOtpCode({ channel, otpType }: ChannelOtpTypeRequest): Promise<OtpCode | undefined> {
        if (!channel) {
            return undefined;
        }

        await this.disableOtpCode({ channel, otpType });

        return this.otpCodeModel.query().findOne({ channel, otp_type: otpType, status: StatusType.Active });
        // .where('expired_at', '>=', fn.now());
    }

    async disableOtpCode({ channel, otpType }: ChannelOtpTypeForcedRequest): Promise<void> {
        if (!channel) {
            return;
        }

        await this.otpCodeModel
            .query()
            .patch({ status: StatusType.Disabled })
            .where({ channel, otp_type: otpType, status: StatusType.Active });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // .where((wb: any) => {
        //     if (!force) {
        //         wb.where('expired_at', '<=', fn.now());
        //     }
        // });
    }

    async isOtpCodeValid({ channel, code, otpType }: ChannelCodeWithOtpTypeRequest): Promise<boolean> {
        if (!channel || !code) {
            return false;
        }
        return !!(await this.otpCodeModel
            .query()
            .findOne({ channel, code, otp_type: otpType, status: StatusType.Active }));
        // .where((wb: AnyQueryBuilder) => {
        //     if (admin === false) {
        //         wb.where('expired_at', '>=', fn.now());
        //     }
        // }));
    }

    async requestOTPCode({ user, otpType, link }: OtpTypeRequest): Promise<OtpCodeResponse> {
        const channel =
            otpType === OtpType.NewEmail
                ? user?.tempEmail
                : otpType === OtpType.LastPhone
                ? user?.phone
                : otpType === OtpType.ChangePhone
                ? user?.phone
                : user?.email;

        if (!channel) {
            return { isSent: false, timeout: 0 };
        }

        if (user?.isEmailVerified && otpType === OtpType.CurrentEmail) {
            throw ServiceRpcException(ApiEC.EmailAlreadyVerified);
        }

        let otpCode = await this.getCurrentOtpCode({ channel, otpType });

        if (!otpCode) {
            otpCode = await this.otpCodeModel.query().insert({
                channel,
                code: OtpService.generateOtpCode(),
                otp_type: otpType,
                expired_at: new Date(new Date().getTime() + otpConstants.expiredInSec * 1000)
                    .toISOString()
                    .replace('T', ' ')
                    .substring(0, 19),
            });
        }

        if (!otpCode) {
            return { isSent: false, timeout: 0 };
        }

        const timeoutForNextSent =
            otpConstants.requestTimeout -
            (otpCode.sent_at
                ? Math.ceil((new Date().getTime() - new Date(otpCode.sent_at).getTime()) / 1000)
                : otpConstants.requestTimeout);
        if (timeoutForNextSent > 0) {
            return { isSent: false, timeout: timeoutForNextSent };
        }

        await otpCode.$query().patch({ sent_at: fn.now() });

        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        let isSent: boolean = false;
        if (otpType !== OtpType.LastPhone) {
            let emailType = EmailType.CurrentEmail;

            switch (otpType) {
                case OtpType.ResetPassword:
                    emailType = EmailType.ResetPassword;
                    break;
                case OtpType.ChangeEmail:
                    emailType = EmailType.ChangeEmail;
                    break;
                case OtpType.NewEmail:
                    emailType = EmailType.NewEmail;
                    break;
            }

            isSent = (
                await lastValueFrom(
                    this.natsClient.send<SendEmailResponse, SendEmailRequest>(EmailEventType.SendEmail, {
                        emailType,
                        to: channel,
                        locals: {
                            link: link ? link : undefined,
                            otpCode: otpCode.code,
                            fullName: user.fullName,
                        },
                    })
                )
            ).isSent;

            await this.slackService.sendMessage({
                type: SlackMessageType.PhoneCode,
                text: `code:${otpCode.code}, email:${channel}`,
            });
        } else if (otpType === OtpType.LastPhone) {
            const smsInfo = await SmsInfo.query()
                .modify('active')
                .where({
                    type:
                        otpType === OtpType.LastPhone
                            ? SmsTypes.PhoneVerification
                            : otpType === OtpType.ChangePhone
                            ? SmsTypes.ChangePhone
                            : SmsTypes.ResetPassword,
                })
                .first();
            if (!smsInfo) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }
            const message = smsInfo?.message.replace('{code}', otpCode.code);
            isSent = (await this.smsService.sendSms({ phone: channel, message, orignator: smsInfo?.originator }))
                .isSent;

            await this.slackService.sendMessage({
                type: SlackMessageType.PhoneCode,
                text: `code:${otpCode.code}, phone:${channel}`,
            });
        }

        return { isSent, timeout: otpConstants.requestTimeout };
    }

    async verifyOtpCode({ user, code, otpType, admin = false }: VerifyOtpCodeRequest): Promise<VerifyOtpCodeResponse> {
        if (user.isEmailVerified && otpType === OtpType.CurrentEmail) {
            return { ok: true, user, otpType };
        }

        if (user.isPhoneVerified && otpType === OtpType.LastPhone) {
            return { ok: true, user, otpType };
        }

        const channel =
            otpType === OtpType.NewEmail
                ? user?.tempEmail
                : otpType === OtpType.LastPhone
                ? user?.phone
                : otpType === OtpType.ChangePhone
                ? user?.phone
                : user?.email;
        if (!channel) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }
        if (!(await this.isOtpCodeValid({ channel, code, otpType, admin }))) {
            return { ok: false, user, otpType };
        }

        await this.disableOtpCode({ channel, otpType, force: true });

        if (otpType === OtpType.ChangeEmail && user.tempEmail) {
            const { isSent } = await this.requestOTPCode({
                user,
                otpType: OtpType.NewEmail,
            });
            if (!isSent) {
                return { ok: false, user, otpType };
            }
        } else if (otpType === OtpType.NewEmail && user.tempEmail) {
            user.email = user.tempEmail;
            user.isEmailVerified = true;
            delete user.tempEmail;
        } else if (otpType === OtpType.CurrentEmail) {
            user.isEmailVerified = true;
        } else if (otpType === OtpType.LastPhone || otpType === OtpType.ChangePhone) {
            user.isPhoneVerified = true;
        }
        return { ok: true, user, otpType };
    }

    async resendOtpCode(dto: OtpTypeRequest): Promise<OtpCodeResponse> {
        return this.requestOTPCode(dto);
    }
}
