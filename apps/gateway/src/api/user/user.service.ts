import { Inject, Injectable, Logger } from '@nestjs/common';
import { htmlToText } from 'html-to-text';
import { lastValueFrom, Observable } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiSuccessResponse } from '@signy/exceptions';
import { ApiException } from '@signy/exceptions';
import { EmailEventType, EmailType } from '@signy/email';
import {
    AuthSessionUserRequest,
    ChangeEmailRequest,
    ChangePasswordRequest,
    CheckPasswordRequest,
    CheckPasswordResponse,
    DeleteUserAccountResponse,
    SetFcmTokenRequest,
    SetTermsAndPolicyRequest,
    SetUserDriveTokenRequest,
    SetUserLangRequest,
} from '@signy/user';
import { AuthSessionUserResponse, SessionUserInfo, AuthEventType } from '@signy/auth';
import { SendEmailRequest, SendEmailResponse } from '@signy/email';
import { ContactSupportRequest, UserIdRequest } from '@signy/common';
import { ApiEC } from '@signy/exceptions';
import { S3Service } from '@signy/s3';
import { ProfileEventsType } from '@signy/profile';

@Injectable()
export class UserService {
    private logger: Logger;
    constructor(
        @Inject('GATEWAY_USER_PUBLISHER') private natsClient: ClientProxy,
        private readonly s3Service: S3Service
    ) {
        this.logger = new Logger(UserService.name);
    }

    signOut(dto: AuthSessionUserRequest): Observable<ApiSuccessResponse> {
        if (!dto?.sessionToken) {
            throw new ApiException(ApiEC.InternalServerError);
        }
        return this.natsClient.send<ApiSuccessResponse, AuthSessionUserRequest>(AuthEventType.UserSignOut, dto);
    }

    currentUser(dto: AuthSessionUserRequest): Observable<AuthSessionUserResponse> {
        return this.natsClient.send<AuthSessionUserResponse, AuthSessionUserRequest>(AuthEventType.GetSessionUser, dto);
    }

    acceptTermsPolicy(dto: SetTermsAndPolicyRequest): Observable<AuthSessionUserResponse> {
        return this.natsClient.send<AuthSessionUserResponse, SetTermsAndPolicyRequest>(
            AuthEventType.AcceptTermsPolicy,
            dto
        );
    }

    setFcmToken(dto: SetFcmTokenRequest): Observable<ApiSuccessResponse> {
        return this.natsClient.send<ApiSuccessResponse, SetFcmTokenRequest>(AuthEventType.SetFcmToken, dto);
    }

    checkUserPassword(dto: CheckPasswordRequest): Observable<CheckPasswordResponse> {
        return this.natsClient.send<CheckPasswordResponse, CheckPasswordRequest>(AuthEventType.CheckPassword, dto);
    }

    changePassword(dto: ChangePasswordRequest): Observable<ApiSuccessResponse> {
        return this.natsClient.send<ApiSuccessResponse, ChangePasswordRequest>(AuthEventType.ChangePassword, dto);
    }

    changeUserEmail(dto: ChangeEmailRequest): Observable<ApiSuccessResponse> {
        return this.natsClient.send<ApiSuccessResponse, ChangeEmailRequest>(AuthEventType.ChangeEmail, dto);
    }

    async sendSupportEmail(
        sessionUser: SessionUserInfo,
        { message, replyTo }: ContactSupportRequest
    ): Promise<ApiSuccessResponse> {
        if (!message) {
            throw new ApiException(ApiEC.WrongInput);
        }

        if (!sessionUser.email) {
            throw new ApiException(ApiEC.WrongInput);
        }

        const { isSent: ok } = await lastValueFrom(
            this.natsClient.send<SendEmailResponse, SendEmailRequest>(EmailEventType.SendEmail, {
                to: replyTo ?? sessionUser.email,
                emailType: EmailType.SupportTeam,
                locals: {
                    fullName: sessionUser.fullName,
                    messageBody: htmlToText(message, { wordwrap: 120 }),
                },
            })
        );

        if (!ok) {
            throw new ApiException(ApiEC.InternalServerError);
        }

        return { ok };
    }

    async deleteAccount(sessionUser: SessionUserInfo): Promise<DeleteUserAccountResponse> {
        const { ok, avatar, isForceLogout } = await lastValueFrom(
            this.natsClient.send<DeleteUserAccountResponse, UserIdRequest>(AuthEventType.UserDeleteAccount, {
                userId: sessionUser.id,
            })
        );

        if (avatar?.imageKey || avatar?.imageUrl) {
            if (!(await this.s3Service.deleteFile({ key: avatar.imageKey, url: avatar.imageUrl }))) {
                this.logger.error(
                    `deleteAccount: userId:${sessionUser.id}, avatar: ${JSON.stringify(avatar)} delete failed`
                );
            }
        }

        if (avatar?.thumbnailKey || avatar?.thumbnailUrl) {
            if (!(await this.s3Service.deleteFile({ key: avatar.thumbnailKey, url: avatar.thumbnailUrl }))) {
                this.logger.error(
                    `deleteAccount: userId:${sessionUser.id}, avatar: ${JSON.stringify(avatar)} delete failed`
                );
            }
        }

        return { ok, isForceLogout };
    }

    async setDriveToken(dto: SetUserDriveTokenRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, SetUserDriveTokenRequest>(ProfileEventsType.SetDriveToken, dto)
        );
    }

    async setUserLang(dto: SetUserLangRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, SetUserLangRequest>(ProfileEventsType.SetUserLang, dto)
        );
    }
}
