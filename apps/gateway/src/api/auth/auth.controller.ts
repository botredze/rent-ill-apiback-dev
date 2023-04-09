import { Observable } from 'rxjs';
import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiSecurity, ApiTags, ApiBadRequestResponse, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ApiEC, ApiErrorResponse, ApiException } from '@signy/exceptions';
import { AuthService } from './auth.service';
import { UserPassport } from '../auth/decorators';
import { AppleAuthGuard, FacebookAuthGuard, GoogleAuthGuard, LocalAuthGuard } from './guards';
import { OtpCodeResponse } from '@signy/verification';
import {
    AppleSignInRequest,
    AuthSignInRequest,
    AuthSignUpRequest,
    AuthSuccessResponse,
    CheckUserExistsRequest,
    CheckUserExistsResponse,
    FacebookGoogleSignInRequest,
    RecoverPasswordRequest,
    ResetPasswordOTPRequest,
    ResetPasswordOTPResponse,
    ResetPasswordRequest,
    SessionUserInfo,
} from '@signy/auth';
import parsePhoneNumber from 'libphonenumber-js';

const API_HEADERS_DEVICE_ID: string = process?.env?.API_HEADERS_DEVICE_ID
    ? process.env.API_HEADERS_DEVICE_ID
    : 'x-device-id';

@ApiTags('Auth')
@ApiSecurity('X_API_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('check-user-exists')
    @ApiOperation({ summary: 'Check if user already exists' })
    checkUserExists(@Body() dto: CheckUserExistsRequest): Observable<CheckUserExistsResponse> {
        return this.authService.checkUserExists(dto);
    }

    @Post('sign-up')
    @ApiHeader({
        name: API_HEADERS_DEVICE_ID,
        allowEmptyValue: true,
        required: false,
    })
    @ApiOperation({
        summary: 'Sign up with email & password',
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signUp(@Body() dto: AuthSignUpRequest, @Headers() headers: any): Observable<AuthSuccessResponse> {
        if (dto?.phone) {
            const phoneNumber = parsePhoneNumber(dto.phone);
            if (phoneNumber?.country !== 'IL') {
                throw new ApiException(ApiEC.InvalidPhoneNumberForIsrael);
            }
        }
        return this.authService.signUp({
            ...dto,
            deviceId: headers[API_HEADERS_DEVICE_ID],
        });
    }

    @Post('sign-in')
    @UseGuards(LocalAuthGuard)
    @ApiHeader({
        name: API_HEADERS_DEVICE_ID,
        allowEmptyValue: true,
        required: false,
    })
    @ApiOperation({ summary: 'Sign in with email & password' })
    signIn(
        @UserPassport({ allowUnverifiedEmail: true }) user: SessionUserInfo,
        @Body() { fcmToken }: AuthSignInRequest,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Headers() headers: any
    ): Observable<AuthSuccessResponse> {
        return this.authService.signIn({
            userId: user.id,
            fcmToken,
            deviceId: headers[API_HEADERS_DEVICE_ID],
        });
    }

    @Post('google-sign-in')
    @UseGuards(GoogleAuthGuard)
    @ApiHeader({
        name: API_HEADERS_DEVICE_ID,
        allowEmptyValue: true,
        required: false,
    })
    @ApiOperation({ summary: 'Sign in with Google account' })
    googleSignIn(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: FacebookGoogleSignInRequest,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Headers() headers: any
    ): Observable<AuthSuccessResponse> {
        return this.authService.signIn({
            userId: user.id,
            deviceId: headers[API_HEADERS_DEVICE_ID],
        });
    }

    @Post('facebook-sign-in')
    @UseGuards(FacebookAuthGuard)
    @ApiHeader({
        name: API_HEADERS_DEVICE_ID,
        allowEmptyValue: true,
        required: false,
    })
    @ApiOperation({ summary: 'Sign in with Facebook account' })
    facebookSignIn(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: FacebookGoogleSignInRequest,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Headers() headers: any
    ): Observable<AuthSuccessResponse> {
        return this.authService.signIn({
            userId: user.id,
            deviceId: headers[API_HEADERS_DEVICE_ID],
        });
    }

    @Post('apple-sign-in')
    @UseGuards(AppleAuthGuard)
    @ApiHeader({
        name: API_HEADERS_DEVICE_ID,
        allowEmptyValue: true,
        required: false,
    })
    @ApiOperation({ summary: 'Sign in with Apple account' })
    appleSignIn(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: AppleSignInRequest,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Headers() headers: any
    ): Observable<AuthSuccessResponse> {
        return this.authService.signIn({
            userId: user.id,
            deviceId: headers[API_HEADERS_DEVICE_ID],
        });
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password' })
    resetPassword(@Body() dto: ResetPasswordRequest): Observable<OtpCodeResponse> {
        return this.authService.resetPassword(dto);
    }

    @Post('verify-reset-password-otp')
    @ApiOperation({ summary: 'Reset password verification' })
    verifyResetPasswordOtp(@Body() dto: ResetPasswordOTPRequest): Observable<ResetPasswordOTPResponse> {
        return this.authService.verifyResetPasswordOtp(dto);
    }

    @Post('recover-password')
    @ApiOperation({ summary: 'Set new password on password reset' })
    recoverPassword(@Body() dto: RecoverPasswordRequest): Observable<AuthSuccessResponse> {
        return this.authService.recoverPassword(dto);
    }
}
