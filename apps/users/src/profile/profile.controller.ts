import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CheckUserExistsResponse } from '@signy/auth';
import { UserIdRequest } from '@signy/common';
import { ApiSuccessResponse } from '@signy/exceptions';
import {
    EditLocationRequest,
    NotificationSettingsResponse,
    PersonalInformationRequest,
    SetUserAvatarResponse,
    UploadAvatarRequest,
    UserNameResponse,
    UserProfileBaseResponse,
    UserProfileExtendedResponse,
    UserNameRequest,
    UserProfileResponse,
} from '@signy/profile';
import { ProfileEventsType } from '@signy/profile';
import { ProfileService } from './profile.service';
import { SearchUserRequest, SearchUsersResponse, SetUserDriveTokenRequest, SetUserLangRequest } from '@signy/user';

@Controller()
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @MessagePattern(ProfileEventsType.CheckUserNameExists)
    async checkUserNameExists(dto: UserNameRequest): Promise<CheckUserExistsResponse> {
        return this.profileService.checkUserNameExists(dto);
    }

    @MessagePattern(ProfileEventsType.GenerateUserName)
    async generateUserName(dto: UserNameRequest): Promise<UserNameResponse> {
        return this.profileService.generateUserName(dto);
    }

    @MessagePattern(ProfileEventsType.SetUserPersonalInformation)
    async setUserPersonalInformation(dto: PersonalInformationRequest): Promise<UserProfileBaseResponse> {
        return this.profileService.setUserPersonalInformation(dto);
    }

    @MessagePattern(ProfileEventsType.SetUserAvatar)
    async setUserAvatar(dto: UploadAvatarRequest): Promise<SetUserAvatarResponse> {
        return this.profileService.setUserAvatar(dto);
    }

    @MessagePattern(ProfileEventsType.GetUserProfile)
    async getUserProfile(dto: UserIdRequest): Promise<UserProfileResponse> {
        return this.profileService.getUserProfile(dto);
    }

    @MessagePattern(ProfileEventsType.GetExtendedUserProfile)
    async getExtendedUserProfile(dto: UserIdRequest): Promise<UserProfileExtendedResponse> {
        return this.profileService.getExtendedUserProfile(dto);
    }

    @MessagePattern(ProfileEventsType.SetUserName)
    async setUserName(dto: UserNameRequest): Promise<UserProfileBaseResponse> {
        return this.profileService.setUserName(dto);
    }

    @MessagePattern(ProfileEventsType.EditLocation)
    async editLocation(dto: EditLocationRequest): Promise<ApiSuccessResponse> {
        return this.profileService.editLocation(dto);
    }

    @MessagePattern(ProfileEventsType.GetUserSettings)
    async getUserSettings(dto: UserIdRequest): Promise<NotificationSettingsResponse> {
        return this.profileService.getUserSettings(dto);
    }

    @MessagePattern(ProfileEventsType.SearchUsers)
    async searchUsers(dto: SearchUserRequest): Promise<SearchUsersResponse> {
        return this.profileService.searchUsers(dto);
    }

    @MessagePattern(ProfileEventsType.SetDriveToken)
    async setDriveToken(dto: SetUserDriveTokenRequest): Promise<ApiSuccessResponse> {
        return this.profileService.setDriveToken(dto);
    }

    @MessagePattern(ProfileEventsType.SetUserLang)
    async setUserLang(dto: SetUserLangRequest): Promise<ApiSuccessResponse> {
        return this.profileService.setUserLang(dto);
    }
}
