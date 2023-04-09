import { nanoid } from 'nanoid';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { authConstants } from '@signy/auth';
import { ServiceRpcException } from '@signy/exceptions';
import { SignyDocumentSignatories, User, UserSession } from '@signy/db';
import { ProfileService } from '../profile/profile.service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthSessionUserResponse, AuthSuccessResponse } from '@signy/auth';
import { ApiEC } from '@signy/exceptions';
import { StatusType } from '@signy/common';
import { OtpCodeResponse } from '@signy/verification';
import { AuthType } from '@signy/auth';
import { OtpEventType, OtpType } from '@signy/otp';
import { AuthSessionUserRequest, SetFcmTokenRequest } from '@signy/user';
import { ApiSuccessResponse } from '@signy/exceptions';
import { FcmTokensResponse } from '@signy/sessions';
import { UserIdRequest } from '@signy/common';
import { OtpTypeRequest } from '@signy/otp';
import { AnyQueryBuilder } from 'objection';
import { ContactEventType, InternalContactCreationRequest } from '@signy/contact';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class SessionService {
    private jwtSignOptions: JwtSignOptions = {};
    private jwtVerifyOptions: JwtVerifyOptions = {};
    private logger: Logger;
    constructor(
        public jwtService: JwtService,
        private readonly profileService: ProfileService,
        @Inject('SESSION_SERVICE') private natsClient: ClientProxy,
        @Inject(UserSession) private readonly userSessionModel: typeof UserSession,
        private subscriptionService: SubscriptionService
    ) {
        this.jwtSignOptions.issuer = (process.env.PROJECT_NAME || 'signy.co.il')
            .replace(/\s/g, '.')
            .toLocaleLowerCase();
        this.jwtSignOptions.expiresIn = parseInt(process.env.JWT_MAX_AGE_SEC || `${60 * 60 * 24}`, 10);
        this.jwtSignOptions.secret = process.env.JWT_SECRET;
        this.jwtVerifyOptions.secret = process.env.JWT_SECRET;
        this.logger = new Logger(SessionService.name);
    }

    async createUserSession(
        user: User,
        fcmToken?: string | null,
        deviceId?: string | null
    ): Promise<AuthSuccessResponse> {
        if (!user) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        const sessionToken = nanoid();

        const accessToken = await this.jwtService.signAsync({ id: user.id, sessionToken }, this.jwtSignOptions);

        if (!sessionToken || !accessToken) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        const expiredAt = new Date(Date.now() + authConstants().sessionTTL * 1000)
            .toISOString()
            .replace('T', ' ')
            .substring(0, 19);

        let currentSession = await this.userSessionModel
            .query()
            .findOne({ user_id: user.id, device_id: deviceId ?? null, fcm_token: fcmToken ?? null });

        if (currentSession) {
            await currentSession.$query().patchAndFetch({
                token: sessionToken,
                expired_at: expiredAt,
                status: StatusType.Active,
            });
        } else {
            currentSession = await this.userSessionModel
                .query()
                .insert({
                    user_id: user.id,
                    token: sessionToken,
                    expired_at: expiredAt,
                    device_id: deviceId,
                    fcm_token: fcmToken,
                    status: StatusType.Active,
                })
                .onConflict(['user_id', 'fcm_token'])
                .merge({ token: sessionToken, expired_at: expiredAt, status: StatusType.Active });
        }
        if (user.auth_type === AuthType.Email && !user?.is_email_verified) {
            await lastValueFrom(
                this.natsClient.send<OtpCodeResponse, OtpTypeRequest>(OtpEventType.ResendOtpCode, {
                    otpType: OtpType.CurrentEmail,
                    user: user.toOtpUserInfoDTO(),
                })
            );
        }

        if (user.auth_type === AuthType.Phone && user?.phone?.length && !user?.is_phone_verified) {
            await lastValueFrom(
                this.natsClient.send<OtpCodeResponse, OtpTypeRequest>(OtpEventType.ResendOtpCode, {
                    otpType: OtpType.LastPhone,
                    user: { ...user.toOtpUserInfoDTO(), phone: user.phone[0] },
                })
            );
        }

        await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, InternalContactCreationRequest>(
                ContactEventType.InternalContactCreation,
                {
                    userId: user.id,
                    email:
                        user.auth_type === AuthType.Email && user?.email
                            ? user.email
                            : user.auth_type !== AuthType.Phone && user?.ext_user_email
                            ? user.ext_user_email
                            : undefined,
                    phone: user?.phone?.length ? user?.phone[0] : undefined,
                }
            )
        );

        const userBySessionToken = await this.getUserBySessionToken({ userId: user.id, sessionToken });
        const userSubscription = await this.subscriptionService.getUserSubscription({ userId: user.id });
        return {
            accessToken,
            userSubscription,
            ...userBySessionToken,
        };
    }

    async getUserBySessionToken({ userId, sessionToken }: AuthSessionUserRequest): Promise<AuthSessionUserResponse> {
        if (!userId || !sessionToken) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const userSession = await this.userSessionModel
            .query()
            .modify('active')
            .withGraphJoined('user(active).[profile]')
            .where(`${this.userSessionModel.tableName}.user_id`, userId)
            .findOne({ token: sessionToken });

        if (!userSession?.user) {
            throw ServiceRpcException(ApiEC.AccessDenied);
        }

        const signatory = await SignyDocumentSignatories.query()
            .modify('active')
            .where((cb: AnyQueryBuilder) => {
                if (userSession.user?.email) {
                    cb.where({ email: userSession.user?.email });
                }
                if (userSession.user?.phone?.length) {
                    cb.orWhere({ phone: userSession.user?.phone?.length ? userSession.user.phone[0] : undefined });
                }
                cb.orWhere({ user_id: userSession.user_id });
            })
            .first();
        if (signatory) {
            userSession.user.signatory = signatory;
        }
        return {
            sessionUser: {
                ...userSession.user.toSessionUserInfoDTO(),
                sessionToken,
            },
            userBaseInfo:
                userSession?.user?.profile && !userSession?.user?.profile?.isUserProfileSetupRequired
                    ? userSession.user.profile.toUserBaseInfo()
                    : undefined,
            userSettings: userSession?.user?.profile ? userSession.user.profile.toNotificationBaseInfo() : undefined,
        };
    }

    async deleteUserSession({ userId, sessionToken }: AuthSessionUserRequest): Promise<ApiSuccessResponse> {
        if (!userId) {
            return { ok: true };
        }

        await this.userSessionModel
            .query()
            .patch({ status: StatusType.Deleted })
            .where({ user_id: userId })
            .where((wb: AnyQueryBuilder) => {
                if (sessionToken) {
                    wb.where({ token: sessionToken });
                }
            });

        return { ok: true };
    }

    async setFcmToken({ userId, sessionToken, fcmToken }: SetFcmTokenRequest): Promise<ApiSuccessResponse> {
        if (!userId || !sessionToken) {
            return { ok: false };
        }

        return {
            ok: !!(await this.userSessionModel
                .query()
                .patch({ fcm_token: fcmToken })
                .where({ user_id: userId, token: sessionToken })),
        };
    }

    async getUserFcmTokens({ userId }: UserIdRequest): Promise<FcmTokensResponse> {
        const list = await this.userSessionModel
            .query()
            .modify('active')
            .select('id', 'fcm_token')
            .modify('active')
            .where({ user_id: userId })
            .whereNotNull('fcm_token');

        return { fcmTokens: list.map((x) => x.toFcmTokenInfoDTO()) };
    }
}
