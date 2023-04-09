import { Observable } from 'rxjs';
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiSecurity, ApiTags, ApiBadRequestResponse, ApiOperation, ApiHeader } from '@nestjs/swagger';
import {
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
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards';
import { UserPassport } from '../auth/decorators';
import { ContactSupportRequest } from '@signy/common';
import { AuthSessionUserResponse, SessionUserInfo } from '@signy/auth';

@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiTags('User')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('current-user')
    currentUser(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId, sessionToken = '' }: SessionUserInfo
    ): Observable<AuthSessionUserResponse> {
        return this.userService.currentUser({ userId, sessionToken });
    }

    @Post('accept-terms-policy')
    @ApiOperation({ summary: 'Accept Application Terms & Condition' })
    acceptTermsPolicy(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId, sessionToken }: SessionUserInfo,
        @Body() dto: SetTermsAndPolicyRequest
    ): Observable<AuthSessionUserResponse> {
        return this.userService.acceptTermsPolicy({ ...dto, userId, sessionToken });
    }

    @Post('set-fcm-token')
    @ApiHeader({
        name: process.env.API_HEADERS_DEVICE_ID || 'x-device-id',
        allowEmptyValue: true,
        required: false,
    })
    @ApiOperation({ summary: "Set user's device fcm token" })
    setFcmToken(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId, sessionToken = '' }: SessionUserInfo,
        @Body() dto: SetFcmTokenRequest
    ): Observable<ApiSuccessResponse> {
        return this.userService.setFcmToken({ ...dto, userId, sessionToken });
    }

    @Post('check-password')
    @ApiOperation({ summary: "Check User's password " })
    checkPassword(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CheckPasswordRequest
    ): Observable<CheckPasswordResponse> {
        return this.userService.checkUserPassword({ ...dto, userId });
    }

    @Post('change-password')
    @ApiOperation({ summary: "Change user's password" })
    changePassword(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: ChangePasswordRequest
    ): Observable<ApiSuccessResponse> {
        return this.userService.changePassword({ ...dto, userId });
    }

    @Post('change-email')
    @ApiOperation({ summary: 'Change user email' })
    changeEmail(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: ChangeEmailRequest
    ): Observable<ApiSuccessResponse> {
        return this.userService.changeUserEmail({ ...dto, userId });
    }

    @Post('contact-support')
    @ApiOperation({ summary: 'Change user email' })
    async sendSupportEmail(
        @UserPassport() sessionUser: SessionUserInfo,
        @Body() dto: ContactSupportRequest
    ): Promise<ApiSuccessResponse> {
        return this.userService.sendSupportEmail(sessionUser, dto);
    }

    @Post('sign-out')
    @ApiOperation({ summary: 'User logout' })
    signOut(
        @UserPassport({ allowUnverifiedEmail: true }) { id: userId, sessionToken = '' }: SessionUserInfo
    ): Observable<ApiSuccessResponse> {
        return this.userService.signOut({ userId, sessionToken });
    }

    @Post('delete-account')
    @ApiOperation({ summary: "Delete user's account" })
    async deleteAccount(
        @UserPassport({ allowUnverifiedEmail: true }) sessionUser: SessionUserInfo
    ): Promise<DeleteUserAccountResponse> {
        return this.userService.deleteAccount(sessionUser);
    }

    @Post('set-drive-token')
    @ApiOperation({ summary: "Set user's drive token" })
    async setDriveToken(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SetUserDriveTokenRequest
    ): Promise<ApiSuccessResponse> {
        return this.userService.setDriveToken({ ...dto, userId });
    }

    @Post('set-user-lang')
    @ApiOperation({ summary: "Set user's language" })
    async setUserLang(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SetUserLangRequest
    ): Promise<ApiSuccessResponse> {
        return this.userService.setUserLang({ ...dto, userId });
    }
}
