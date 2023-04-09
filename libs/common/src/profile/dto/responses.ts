import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserBaseInfo } from '../../auth/dto';
import { AuthType } from '../../auth/enums';
import { UploadedImageInfo, UploadedThumbnailInfo } from '../../upload/dto';
import { PageInfoResponse } from '@signy/pagination';
import {
    CheckAvatarExistanceInfo,
    NotificationSettingsInfo,
    PersonalBaseInfo,
    PersonDetailedBaseInfo,
    UserProfileInfo,
} from './entities';

export class UserNameResponse {
    @ApiProperty({ example: 'MichaelBrown123' })
    userName: string;
}

export class NotificationSettingsResponse {
    @ApiProperty({ required: false, type: () => NotificationSettingsInfo })
    notification?: NotificationSettingsInfo;
}

export class PersonDetailedBaseResponse extends NotificationSettingsResponse {
    @ApiProperty({ required: false, type: () => PersonalBaseInfo })
    personalBaseView: PersonalBaseInfo;
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    avatar: UploadedImageInfo;
}

export class UploadUserAvatarResponse {
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    uploadedImage: UploadedImageInfo;
    @ApiProperty({ required: false, type: () => UploadedThumbnailInfo })
    uploadedThumbnail: UploadedThumbnailInfo;
}

export class SetUserAvatarResponse {
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    uploadedImage?: UploadedImageInfo;
    @ApiHideProperty()
    avatarExists?: CheckAvatarExistanceInfo;
}

export class UserProfileResponse extends NotificationSettingsResponse {
    @ApiProperty({ enum: AuthType })
    authType: AuthType;
    @ApiProperty({ required: false, type: 'string', format: 'email' })
    userEmail?: string | null;
    @ApiProperty({ required: false, type: () => UserBaseInfo })
    userBaseInfo?: UserBaseInfo;
    // @ApiProperty({ type: 'boolean', default: false })
    // hasNewNotifications: boolean;
}

export class UserProfileExtendedResponse {
    @ApiProperty({ required: false, type: () => PersonDetailedBaseInfo })
    userProfile?: PersonDetailedBaseInfo;
    @ApiProperty({ type: 'boolean', default: false })
    hasNewNotifications: boolean;
    @ApiProperty({ required: false, type: 'string' })
    userEmail?: string;
}

export class UserProfileBaseResponse {
    @ApiProperty({ required: false, type: () => PersonalBaseInfo })
    personalInfo?: PersonalBaseInfo | null;
}

export class GetExtraUserInfoResponse {
    userInfo: PersonDetailedBaseInfo;
}
export class GetUserProfileExtraInfoResponse {
    @ApiProperty({ type: () => UserProfileInfo })
    profile: UserProfileInfo;
    @ApiProperty({ required: false, type: 'integer' })
    submissions: number;
    @ApiProperty({ required: false, type: 'integer' })
    published: number;
    @ApiProperty({ required: false, type: 'integer' })
    accepted: number;
}

export class GetUserProfileListResponse {
    @ApiProperty({ type: () => [GetUserProfileExtraInfoResponse] })
    list: GetUserProfileExtraInfoResponse[];
    @ApiProperty({ type: () => PageInfoResponse })
    pageInfo: PageInfoResponse;
}
