import { lastValueFrom, Observable } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiSuccessResponse } from '@signy/exceptions';
import { ApiException } from '@signy/exceptions';
import {
    EditLocationRequest,
    NotificationSettingsResponse,
    PersonalInformationRequest,
    SetUserAvatarRequest,
    SetUserAvatarResponse,
    UploadAvatarRequest,
    UploadUserAvatarResponse,
    UserNameRequest,
    UserNameResponse,
    UserProfileBaseResponse,
    UserProfileExtendedResponse,
    UserProfileResponse,
} from '@signy/profile';
import { ProfileEventsType } from '@signy/profile';
import { CheckUserExistsResponse, SessionUserInfo } from '@signy/auth';
import { UserIdRequest } from '@signy/common';
import { UploadedImageInfo } from '@signy/upload';
import { ApiEC } from '@signy/exceptions';
import { S3Service } from '@signy/s3';
import { SearchUserRequest, SearchUsersResponse } from '@signy/user';

@Injectable()
export class ProfileService {
    constructor(
        @Inject('GATEWAY_PROFILE_PUBLISHER') private natsClient: ClientProxy,
        private readonly s3Service: S3Service
    ) {}

    checkUserNameExists(dto: UserNameRequest): Observable<CheckUserExistsResponse> {
        return this.natsClient.send<CheckUserExistsResponse, UserNameRequest>(
            ProfileEventsType.CheckUserNameExists,
            dto
        );
    }

    generateUserName(dto: UserNameRequest): Observable<UserNameResponse> {
        return this.natsClient.send<UserNameResponse, UserNameRequest>(ProfileEventsType.GenerateUserName, dto);
    }

    setUserPersonalInformation(dto: PersonalInformationRequest): Observable<UserProfileBaseResponse> {
        return this.natsClient.send<UserProfileBaseResponse, PersonalInformationRequest>(
            ProfileEventsType.SetUserPersonalInformation,
            dto
        );
    }

    setUserName(dto: UserNameRequest): Observable<UserProfileBaseResponse> {
        return this.natsClient.send<UserProfileBaseResponse, UserNameRequest>(ProfileEventsType.SetUserName, dto);
    }

    async setUserAvatar({ avatar, userId }: SetUserAvatarRequest): Promise<SetUserAvatarResponse> {
        const uploadedImage: UploadUserAvatarResponse = await this.uploadedImage(avatar);

        if (!uploadedImage) throw new ApiException(ApiEC.InternalServerError);

        const uploadedAvatar = await lastValueFrom(
            this.natsClient.send<SetUserAvatarResponse, UploadAvatarRequest>(ProfileEventsType.SetUserAvatar, {
                userId,
                uploadedImage: uploadedImage.uploadedImage,
                uploadedThumbnail: uploadedImage.uploadedThumbnail,
            })
        );

        for (const x of Object.values(uploadedAvatar).slice(1, 2)) {
            if (x.exists === true) {
                await this.deleteUserAvatar(x.userAvatar);
            }
        }
        return { uploadedImage: uploadedAvatar.uploadedImage };
    }

    async uploadedImage(avatar: Express.Multer.File): Promise<UploadUserAvatarResponse> {
        if (!avatar?.buffer?.length) {
            throw new ApiException(ApiEC.ImageFileRequired);
        }
        const uploadedImage = await this.s3Service.uploadImage({ stream: avatar.buffer, mimetype: avatar.mimetype });
        if (!uploadedImage?.imageUrl) {
            throw new ApiException(ApiEC.InternalServerError);
        }
        const uploadedThumbnail = await this.s3Service.resizeImage({ key: uploadedImage.imageKey });

        return { uploadedThumbnail, uploadedImage };
    }

    async deleteUserAvatar(dto: UploadedImageInfo): Promise<ApiSuccessResponse> {
        if (!dto.imageUrl) {
            return { ok: true };
        }
        const delImageResult = await this.s3Service.deleteFile({
            url: dto?.imageUrl,
            key: dto?.imageKey,
        });
        const delThumbResult = await this.s3Service.deleteFile({
            url: dto?.thumbnailUrl,
            key: dto?.thumbnailKey,
        });

        if (!delImageResult && !delThumbResult) {
            throw new ApiException(ApiEC.InternalServerError);
        }

        return { ok: true };
    }

    async getUserProfile(sessionUser: SessionUserInfo): Promise<UserProfileResponse> {
        const userProfile = await lastValueFrom(
            this.natsClient.send<UserProfileResponse, UserIdRequest>(ProfileEventsType.GetUserProfile, {
                userId: sessionUser.id,
            })
        );
        return userProfile;
    }

    async getExtendedUserProfile(sessionUser: SessionUserInfo): Promise<UserProfileExtendedResponse> {
        const userProfile = await lastValueFrom(
            this.natsClient.send<UserProfileExtendedResponse, UserIdRequest>(ProfileEventsType.GetExtendedUserProfile, {
                userId: sessionUser.id,
            })
        );
        return {
            ...userProfile,
            userEmail: sessionUser.email,
        };
    }

    editLocation(dto: EditLocationRequest): Observable<ApiSuccessResponse> {
        return this.natsClient.send<ApiSuccessResponse, EditLocationRequest>(ProfileEventsType.EditLocation, dto);
    }
    getUserSettings(user: SessionUserInfo): Observable<NotificationSettingsResponse> {
        return this.natsClient.send<NotificationSettingsResponse, UserIdRequest>(ProfileEventsType.GetUserSettings, {
            userId: user.id,
        });
    }

    async searchUsers(dto: SearchUserRequest): Promise<SearchUsersResponse> {
        return await lastValueFrom(
            this.natsClient.send<SearchUsersResponse, SearchUserRequest>(ProfileEventsType.SearchUsers, dto)
        );
    }
}
