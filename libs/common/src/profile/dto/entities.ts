import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { CoordsInfo } from '../../dto';
import { UploadedImageInfo } from '../../upload/dto';
import { UserSettingsInfo } from '../../auth/dto';

export class PersonalBaseInfo {
    @ApiProperty({ type: 'integer' })
    id: number;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ example: 'John' })
    firstName?: string | null;

    @ApiProperty({ example: 'Wick' })
    lastName?: string | null;

    @ApiProperty({ example: '@JohnWick' })
    userName: string;

    @ApiProperty({ required: false, example: 'Cyprus, Nicosia, Necdet Levent str, 17 apt.' })
    location?: string | null;

    @IsString()
    dob?: string | null;

    @IsString()
    suffix?: string | null;

    @IsString()
    gender?: string | null;

    @ApiProperty({ required: false, type: () => CoordsInfo })
    coords?: CoordsInfo | null;
}

export class NotificationSettingsInfo {
    @ApiProperty()
    @IsBoolean()
    isNotificationsOn: boolean;
}

export class CheckAvatarExistanceInfo {
    @ApiHideProperty()
    exists: boolean;
    @ApiHideProperty()
    userAvatar?: UploadedImageInfo | null;
}

export class PersonDetailedBaseInfo {
    personalBaseView?: PersonalBaseInfo;
    avatar?: UploadedImageInfo;
    notification: UserSettingsInfo;
}

export class UserProfileInfo {
    @ApiProperty({ required: false, type: () => PersonalBaseInfo })
    profile?: PersonalBaseInfo;
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    avatar?: UploadedImageInfo;
}
