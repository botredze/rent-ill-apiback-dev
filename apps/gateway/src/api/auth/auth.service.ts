import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { UserIdRequest } from '@signy/common';
import { AuthSessionUserRequest } from '@signy/user';
import { OtpCodeResponse } from '@signy/verification';
import {
    AuthCreateSessionRequest,
    AuthSessionUserResponse,
    AuthSignInRequest,
    AuthSignUpRequest,
    AuthSuccessResponse,
    CheckUserExistsRequest,
    CheckUserExistsResponse,
    ExternalUserContactsInfo,
    ExternalUserInfo,
    JWTPayload,
    RecoverPasswordRequest,
    ResetPasswordOTPRequest,
    ResetPasswordOTPResponse,
    ResetPasswordRequest,
    SessionUserInfo,
} from '@signy/auth';
import { AuthEventType } from '@signy/auth';
@Injectable()
export class AuthService {
    constructor(@Inject('GATEWAY_AUTH_PUBLISHER') private natsClient: ClientProxy) {}

    checkUserExists(dto: CheckUserExistsRequest): Observable<CheckUserExistsResponse> {
        return this.natsClient.send<CheckUserExistsResponse, CheckUserExistsRequest>(
            AuthEventType.CheckUserExists,
            dto
        );
    }

    getUserById(dto: UserIdRequest): Observable<SessionUserInfo> {
        return this.natsClient.send<SessionUserInfo, UserIdRequest>(AuthEventType.GetUserById, dto);
    }

    getUserBySessionToken({ id: userId, sessionToken }: JWTPayload): Observable<AuthSessionUserResponse> {
        return this.natsClient.send<AuthSessionUserResponse, AuthSessionUserRequest>(AuthEventType.GetSessionUser, {
            userId,
            sessionToken,
        });
    }

    getUserByCredentials(dto: AuthSignInRequest): Observable<AuthSessionUserResponse> {
        return this.natsClient.send<AuthSessionUserResponse, AuthSignInRequest>(
            AuthEventType.GetUserByCredentials,
            dto
        );
    }

    signUp(dto: AuthSignUpRequest): Observable<AuthSuccessResponse> {
        return this.natsClient.send<AuthSuccessResponse, AuthSignUpRequest>(AuthEventType.SignUpLocal, dto);
    }

    signIn(dto: AuthCreateSessionRequest): Observable<AuthSuccessResponse> {
        return this.natsClient.send<AuthSuccessResponse, AuthCreateSessionRequest>(AuthEventType.UserSignIn, dto);
    }

    resetPassword(dto: ResetPasswordRequest): Observable<OtpCodeResponse> {
        return this.natsClient.send<OtpCodeResponse, ResetPasswordRequest>(AuthEventType.ResetPassword, dto);
    }

    verifyResetPasswordOtp(dto: ResetPasswordOTPRequest): Observable<ResetPasswordOTPResponse> {
        return this.natsClient.send<ResetPasswordOTPResponse, ResetPasswordOTPRequest>(
            AuthEventType.VerifyResetPassword,
            dto
        );
    }

    recoverPassword(dto: RecoverPasswordRequest): Observable<AuthSuccessResponse> {
        return this.natsClient.send<AuthSuccessResponse, RecoverPasswordRequest>(AuthEventType.RecoverPassword, dto);
    }

    externalUserAuth(dto: ExternalUserInfo): Observable<AuthSessionUserResponse> {
        return this.natsClient.send<AuthSessionUserResponse, ExternalUserInfo>(AuthEventType.SignUpExternal, dto);
    }

    importContactsFromGoogle(dto: ExternalUserContactsInfo): ExternalUserContactsInfo {
        return dto;
    }
}
