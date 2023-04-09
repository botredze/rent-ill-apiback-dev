import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
    AuthCreateSessionRequest,
    AuthSessionUserResponse,
    AuthSignInRequest,
    AuthSignUpRequest,
    AuthSignUpRequestInternal,
    AuthSuccessResponse,
    CheckUserExistsRequest,
    CheckUserExistsResponse,
    ExternalUserInfo,
    RecoverPasswordRequest,
    ResetPasswordOTPRequest,
    ResetPasswordOTPResponse,
    ResetPasswordRequest,
    SignUpByInvitationRequest,
} from '@signy/auth';
import { AuthEventType } from '@signy/auth';
import { UserIdRequest } from '@signy/common';
import { ApiSuccessResponse } from '@signy/exceptions';
import {
    AuthSessionUserRequest,
    ChangeEmailRequest,
    ChangePasswordRequest,
    CheckPasswordRequest,
    CheckPasswordResponse,
    DeleteUserAccountResponse,
    SetFcmTokenRequest,
    SetTermsAndPolicyRequest,
} from '@signy/user';
import { OtpCodeResponse, ResendOtpCodeRequest, VerificationCodeRequest } from '@signy/verification';
import { AuthService } from './auth.service';
import { User } from '@signy/db';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @MessagePattern(AuthEventType.CheckUserExists)
    async checkUserExistsRes(dto: CheckUserExistsRequest): Promise<CheckUserExistsResponse> {
        return this.authService.checkUserExists(dto);
    }

    @MessagePattern(AuthEventType.GetUserById)
    async getUserById(dto: UserIdRequest): Promise<User> {
        return await this.authService.getUserById(dto);
    }

    @MessagePattern(AuthEventType.GetSessionUser)
    async getSessionUser(dto: AuthSessionUserRequest): Promise<AuthSessionUserResponse> {
        return this.authService.getUserBySessionToken(dto);
    }

    @MessagePattern(AuthEventType.GetUserByCredentials)
    async getUserByCredentials(dto: AuthSignInRequest): Promise<AuthSessionUserResponse> {
        return this.authService.getUserByCredentials(dto);
    }

    @MessagePattern(AuthEventType.AcceptTermsPolicy)
    async acceptTermsPolicy(dto: SetTermsAndPolicyRequest): Promise<AuthSessionUserResponse> {
        return this.authService.acceptTermsPolicy(dto);
    }

    @MessagePattern(AuthEventType.SetFcmToken)
    async setFcmToken(dto: SetFcmTokenRequest): Promise<ApiSuccessResponse> {
        return this.authService.setFcmToken(dto);
    }

    @MessagePattern(AuthEventType.SignUpLocal)
    async signUpLocal(dto: AuthSignUpRequest): Promise<AuthSuccessResponse> {
        return this.authService.signUpLocal(dto);
    }

    @MessagePattern(AuthEventType.SignUpLocalInternal)
    async signUpLocalInternal(dto: AuthSignUpRequestInternal): Promise<User> {
        return this.authService.signUpLocaInternal(dto);
    }

    @MessagePattern(AuthEventType.UserSignIn)
    async userSignIn(dto: AuthCreateSessionRequest): Promise<AuthSuccessResponse> {
        return this.authService.signIn(dto);
    }

    @MessagePattern(AuthEventType.UserSignOut)
    async userSignOut(dto: AuthSessionUserRequest): Promise<ApiSuccessResponse> {
        return this.authService.signOut(dto);
    }

    @MessagePattern(AuthEventType.VerificationCodeResend)
    async resendVerificationCode(dto: ResendOtpCodeRequest): Promise<OtpCodeResponse> {
        return this.authService.resendVerificationCode(dto);
    }

    @MessagePattern(AuthEventType.VerificationOtpCode)
    async verifyOtpCode(dto: VerificationCodeRequest): Promise<AuthSessionUserResponse> {
        return this.authService.verifyOtpCode(dto);
    }

    @MessagePattern(AuthEventType.CheckPassword)
    async checkPassword(dto: CheckPasswordRequest): Promise<CheckPasswordResponse> {
        return this.authService.checkUserPassword(dto);
    }

    @MessagePattern(AuthEventType.ChangePassword)
    async changePassword(dto: ChangePasswordRequest): Promise<ApiSuccessResponse> {
        return this.authService.changePassword(dto);
    }

    @MessagePattern(AuthEventType.ChangeEmail)
    async changeEmail(dto: ChangeEmailRequest): Promise<ApiSuccessResponse> {
        return this.authService.changeEmail(dto);
    }

    @MessagePattern(AuthEventType.ResetPassword)
    async resetPassword(dto: ResetPasswordRequest): Promise<OtpCodeResponse> {
        return this.authService.resetPassword(dto);
    }

    @MessagePattern(AuthEventType.VerifyResetPassword)
    async verifyResetPassword(dto: ResetPasswordOTPRequest): Promise<ResetPasswordOTPResponse> {
        return this.authService.verifyResetPassword(dto);
    }

    @MessagePattern(AuthEventType.RecoverPassword)
    async recoverPassword(dto: RecoverPasswordRequest): Promise<AuthSuccessResponse> {
        return this.authService.recoverPassword(dto);
    }

    @MessagePattern(AuthEventType.SignUpExternal)
    async externalUserAuth(dto: ExternalUserInfo): Promise<AuthSessionUserResponse> {
        return this.authService.externalUserAuth(dto);
    }

    @MessagePattern(AuthEventType.UserDeleteAccount)
    async deleteUserAccount(dto: UserIdRequest): Promise<DeleteUserAccountResponse> {
        return this.authService.deleteUserAccount(dto);
    }

    @MessagePattern(AuthEventType.SignUpByInvitation)
    async signUpByInvitation(dto: SignUpByInvitationRequest): Promise<User> {
        return await this.authService.signUpByInvitation(dto);
    }
}
