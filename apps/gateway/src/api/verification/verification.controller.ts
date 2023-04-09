import { Observable } from 'rxjs';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags, ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';
import { ApiErrorResponse } from '@signy/exceptions';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPassport } from '../auth/decorators';
import { VerificationService } from './verification.service';
import { OtpCodeResponse, ResendOtpCodeRequest, VerificationCodeRequest } from '@signy/verification';
import { AuthSessionUserResponse, SessionUserInfo } from '@signy/auth';

@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiTags('Verification')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Post('verify-otp-code')
    @ApiOperation({ summary: 'Verify OTP code' })
    verifyOtpCode(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId, sessionToken = '' }: SessionUserInfo,
        @Body() dto: VerificationCodeRequest
    ): Observable<AuthSessionUserResponse> {
        return this.verificationService.verifyOtpCode({ ...dto, userId, sessionToken });
    }

    @Post('resend-otp-code')
    @ApiOperation({ summary: 'Resend OTP code' })
    resendOtpCode(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId, sessionToken = '' }: SessionUserInfo,
        @Body() dto: ResendOtpCodeRequest
    ): Observable<OtpCodeResponse> {
        return this.verificationService.resendOtpCode({ ...dto, userId, sessionToken });
    }
}
