import { Inject, Injectable } from '@nestjs/common';
import { SignyShareDocumentTypes, SignySharedUserChannelTypes } from '@signy/signy-share-document';
import { ApiEC, ServiceRpcException } from '@signy/exceptions';
import { queueJobNamse, RedisService } from '@signy/redis';
import { lastValueFrom } from 'rxjs';
import { EmailEventType, EmailType, SendEmailRequest, SendEmailResponse } from '@signy/email';
import { SendSmsRequest, smsConstants, SmsService } from '@signy/sms';
import { SignatoryInfo } from '@signy/signy-share-document';
import { ShareService } from '../../share/share.service';
import Bull from 'bull';
import { SignySharedUserDocument, User, UserAnalytic } from '@signy/db';
import { ClientProxy } from '@nestjs/microservices';
import { AuthEventType, AuthSignUpRequestInternal } from '@signy/auth';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AccessTypes, CheckAccessRequest, SubscriptionEventTypes } from '@signy/subscription';

@Injectable()
export class QueueProcessesService {
    private jwtSignOptions: JwtSignOptions = {};
    private jwtVerifyOptions: JwtVerifyOptions = {};
    private scheduleEmailBullInstance: Promise<Bull.Queue<SendEmailRequest>>;
    private schedulePhoneBullInstance: Promise<Bull.Queue<SendSmsRequest>>;
    constructor(
        @Inject('QUEUE_PROCESSES_SERVICE') private natsClient: ClientProxy,
        private redisService: RedisService,
        private smsService: SmsService,
        private shareService: ShareService,
        public jwtService: JwtService
    ) {
        this.scheduleEmailBullInstance = this.redisService.bullQueue<SendEmailRequest>(ShareService.name);
        this.schedulePhoneBullInstance = this.redisService.bullQueue<SendSmsRequest>(ShareService.name);
        this.jwtSignOptions.issuer = (process.env.PROJECT_NAME || 'signy.co.il')
            .replace(/\s/g, '.')
            .toLocaleLowerCase();
        this.jwtSignOptions.expiresIn = parseInt(process.env.JWT_MAX_AGE_SEC || `${60 * 60 * 24}`, 10);
        this.jwtSignOptions.secret = process.env.JWT_SECRET;
        this.jwtVerifyOptions.secret = process.env.JWT_SECRET;
    }

    async addJobToQueue(
        documentId: number,
        userId: number,
        signatories: SignatoryInfo[],
        shareType: SignyShareDocumentTypes,
        scheduleDate?: Date
    ) {
        const foundShareDocument = await this.shareService.getShareDocumentWithPermission({ documentId, userId });
        if (!foundShareDocument || !foundShareDocument?.document?.documentSignatories?.length) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        await foundShareDocument.$query().patchAndFetch({ type: shareType });

        let delay = 0;
        if (scheduleDate) {
            delay = new Date(scheduleDate).getTime() - new Date().getTime();
        }

        for (const x of signatories) {
            // const alreadyShared = await SignySharedUserDocument.query()
            //     .modify('active')
            //     .findOne({ signy_signatory_id: x.id });
            // if (alreadyShared) {
            //     throw ServiceRpcException(ApiEC.DocumentAlreadySharedToSignatory);
            // }
            let to = foundShareDocument.document.documentSignatories.find((y) => y.id === x.id);

            const user = await lastValueFrom(
                this.natsClient.send<User, AuthSignUpRequestInternal>(AuthEventType.SignUpLocalInternal, {
                    email: to?.email,
                    phone: to?.phone,
                    name: to?.name,
                })
            );

            to = await to?.$query().patchAndFetch({ user_id: user.id });

            const accessToken = await this.jwtService.signAsync(
                {
                    linkData: {
                        email: to?.email || to?.contact?.email,
                        phone: to?.phone || to?.contact?.phone,
                        userId: user?.id,
                        documentId,
                    },
                },
                this.jwtSignOptions
            );

            if (x.type.includes(SignySharedUserChannelTypes.Email)) {
                if (!to?.email && !to?.contact?.email) {
                    throw ServiceRpcException(ApiEC.WrongInput);
                }

                const sendEmailRequest = {
                    emailType: EmailType.SignySharedDocument,
                    to: to?.email ? to.email : (to.contact?.email as string),
                    locals: {
                        link: `${foundShareDocument.url}?token=${accessToken}`,
                        fullName: to?.user?.profile?.fullName || to?.name || to?.contact?.fullName,
                    },
                };
                const scheduledJobName = scheduleDate
                    ? queueJobNamse.SendScheduledEmail.replace('{email}', sendEmailRequest.to)
                          .replace('{date}', scheduleDate.toString())
                          .replace('{signatoryId}', `${to.id.toString()}-${new Date().getMilliseconds()}`)
                    : queueJobNamse.SendEmail.replace('{email}', sendEmailRequest.to).replace(
                          '{signatoryId}',
                          `${to.id.toString()}-${new Date().getMilliseconds()}`
                      );

                (await this.scheduleEmailBullInstance).add(scheduledJobName, sendEmailRequest, {
                    delay,
                    removeOnComplete: true,
                    removeOnFail: true,
                });
                (await this.scheduleEmailBullInstance).process(scheduledJobName, async (job) => {
                    const { isSent } = await lastValueFrom(
                        this.natsClient.send<SendEmailResponse, SendEmailRequest>(EmailEventType.SendEmail, job.data)
                    );

                    await SignySharedUserDocument.query().insert({
                        document_id: documentId,
                        signy_signatory_id: x.id,
                        channel_type: SignySharedUserChannelTypes.Email,
                        is_sent: isSent || false,
                    });

                    return isSent;
                });
            }
            if (x.type.includes(SignySharedUserChannelTypes.Phone)) {
                await lastValueFrom(
                    this.natsClient.emit<CheckAccessRequest>(SubscriptionEventTypes.CheckAccess, {
                        userId,
                        type: AccessTypes.SMS,
                    })
                );
                if (!to?.phone && !to?.contact?.phone) {
                    throw ServiceRpcException(ApiEC.WrongInput);
                }

                const smsQueue: { requestData: SendSmsRequest; queueName: string } = {
                    requestData: {
                        phone: to.phone || (to.contact?.phone as string),
                        message: smsConstants.signyShareMessage.replace(
                            '{url}',
                            `${foundShareDocument.url}?token=${accessToken}`
                        ),
                        orignator: smsConstants.signyOriginator,
                    },
                    queueName: scheduleDate
                        ? queueJobNamse.SendScheduledSms.replace('{number}', to.phone || (to.contact?.phone as string))
                              .replace('{date}', scheduleDate.toString())
                              .replace('{signatoryId}', `${to.id.toString()}-${new Date().getMilliseconds()}`)
                        : queueJobNamse.SendSms.replace('{number}', to.phone || (to.contact?.phone as string)).replace(
                              '{signatoryId}',
                              `${to.id.toString()}-${new Date().getMilliseconds()}`
                          ),
                };

                (await this.schedulePhoneBullInstance).add(smsQueue.queueName, smsQueue.requestData, {
                    delay,
                    removeOnComplete: true,
                    removeOnFail: true,
                });

                (await this.schedulePhoneBullInstance).process(smsQueue.queueName, async (job) => {
                    const { isSent } = await this.smsService.sendSms(job.data);

                    if (isSent) {
                        await UserAnalytic.query()
                            .modify('active')
                            .findOne({ user_id: userId })
                            .decrement('sms_count', 1);
                    }

                    await SignySharedUserDocument.query().insert({
                        document_id: documentId,
                        signy_signatory_id: x.id,
                        channel_type: SignySharedUserChannelTypes.Phone,
                        is_sent: isSent || false,
                    });

                    return isSent;
                });
            }
        }
    }
}
