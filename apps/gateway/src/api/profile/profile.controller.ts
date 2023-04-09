import { Observable } from 'rxjs';
import { Express } from 'express';
import 'multer';
import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags, ApiBadRequestResponse, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards';
import { UserPassport } from '../auth/decorators';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { ProfileService } from './profile.service';
import { CheckUserExistsResponse, SessionUserInfo } from '@signy/auth';
import {
    EditLocationRequest,
    NotificationSettingsResponse,
    PersonalInformationRequest,
    SetUserAvatarRequest,
    SetUserAvatarResponse,
    UserNameRequest,
    UserNameResponse,
    UserProfileBaseResponse,
    UserProfileExtendedResponse,
    UserProfileResponse,
} from '@signy/profile';
import { imageFileFilter, uploadConstants } from '@signy/s3';
import { SearchUserRequest, SearchUsersResponse } from '@signy/user';

@ApiTags('Profile')
@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Post('check-user-name-exists')
    @ApiOperation({ summary: 'Check if user name already exists' })
    checkUserNameExists(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UserNameRequest
    ): Observable<CheckUserExistsResponse> {
        return this.profileService.checkUserNameExists({ ...dto, userId });
    }

    @Get('get-user-profile')
    @ApiOperation({ summary: 'Get User Profile' })
    async getUserProfile(@UserPassport() user: SessionUserInfo): Promise<UserProfileResponse> {
        return this.profileService.getUserProfile(user);
    }

    @Post('generate-user-name')
    @ApiOperation({ summary: "Generate User's name" })
    generateUserName(@Body() dto: UserNameRequest): Observable<UserNameResponse> {
        return this.profileService.generateUserName(dto);
    }

    @Post('set-user-personal-information')
    @ApiOperation({ summary: "Set User's personal information" })
    setUserPersonalInformation(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: PersonalInformationRequest
    ): Observable<UserProfileBaseResponse> {
        return this.profileService.setUserPersonalInformation({ ...dto, userId });
    }

    @Post('set-user-name')
    @ApiOperation({ summary: 'Set User name' })
    setUserName(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UserNameRequest
    ): Observable<UserProfileBaseResponse> {
        return this.profileService.setUserName({ ...dto, userId });
    }

    @Post('set-user-avatar')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('avatar', { limits: { fileSize: uploadConstants.maxFileSize }, fileFilter: imageFileFilter })
    )
    @ApiOperation({ summary: "Set User's avatar" })
    async setUserAvatar(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SetUserAvatarRequest,

        @UploadedFile() avatar: Express.Multer.File
    ): Promise<SetUserAvatarResponse> {
        return this.profileService.setUserAvatar({ avatar, userId });
    }

    @Get('get-extended-user-profile')
    @ApiOperation({ summary: 'Get User Profile' })
    async getExtendedUserProfile(@UserPassport() user: SessionUserInfo): Promise<UserProfileExtendedResponse> {
        return this.profileService.getExtendedUserProfile(user);
    }

    @Post('edit-location')
    @ApiOperation({ summary: 'Edit Location' })
    editLocation(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: EditLocationRequest
    ): Observable<ApiSuccessResponse> {
        return this.profileService.editLocation({ ...dto, userId });
    }

    @Get('get-user-settings')
    @ApiOperation({ summary: 'Get User Settings' })
    getUserSettings(@UserPassport() user: SessionUserInfo): Observable<NotificationSettingsResponse> {
        return this.profileService.getUserSettings(user);
    }

    // @Post('set-notification-message-on')
    // @ApiOperation({ summary: 'Set notification messages on' })
    // setNotificationMessagesOn(
    //     @UserPassport() { id: userId }: SessionUserInfo,
    //     @Body() dto: SetNotificationRequest
    // ): Observable<NotificationSettingsResponse> {
    //     return this.profileService.setNotificationMessagesOn({ ...dto, userId });
    // }

    @Post('search-users')
    @ApiOperation({ summary: 'Search user`s by phone or email' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async searchUsers(@Body() dto: SearchUserRequest): Promise<SearchUsersResponse> {
        return await this.profileService.searchUsers(dto);
    }
}
