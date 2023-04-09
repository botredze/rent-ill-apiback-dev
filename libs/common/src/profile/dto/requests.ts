import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';
import 'multer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    IsBoolean,
    ValidateNested,
    IsLatitude,
    IsLongitude,
    IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { commonConstants } from '../..';
import { IsSanitized } from '../../decorators';
import { CoordsInfo, UserIdRequest } from '../..';
import { UploadedImageInfo, UploadedThumbnailInfo } from '../../upload';
import { UserProfileSearchTypes } from '../enums';
import { PageInfoRequest } from '@signy/pagination';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { GenderTypes, UserSuffixeTypes } from '@signy/user';

export class UserNameRequest extends UserIdRequest {
    @ApiProperty({ example: 'MichaelBrown' })
    @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s/g, '') : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(commonConstants.maxNameLength)
    @IsSanitized()
    userName: string;
}

export class PersonalInformationRequest extends UserIdRequest {
    @ApiProperty({ required: false, example: 'Michael' })
    @IsOptional()
    @IsString()
    @MaxLength(commonConstants.maxNameLength)
    @IsSanitized()
    firstName?: string | null;

    @ApiProperty({ required: false, example: 'Brown' })
    @IsOptional()
    @IsString()
    @MaxLength(commonConstants.maxNameLength)
    @IsSanitized()
    lastName?: string | null;

    @ApiProperty({ required: false, example: 'JohnWick' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s/g, '') : value))
    @IsString()
    @MaxLength(commonConstants.maxNameLength)
    @IsSanitized()
    userName?: string | null;

    @ApiProperty({ required: false, example: 'Cyprus, Nicosia, Necdet Levent str, 17 apt.' })
    @IsOptional()
    @IsString()
    @MaxLength(commonConstants.maxStringInputLength)
    @IsSanitized()
    location?: string | null;

    @ApiProperty({ required: false, enum: UserSuffixeTypes })
    @IsEnum(UserSuffixeTypes)
    @IsOptional()
    suffix?: UserSuffixeTypes | null;

    @ApiProperty({ required: false, format: 'YYYY-MM-DD', example: '1994-08-19' })
    @IsString()
    @IsOptional()
    dob?: string | null;

    @ApiProperty({ required: false, enum: GenderTypes })
    @IsEnum(GenderTypes)
    @IsOptional()
    gender?: GenderTypes | null;

    @ApiProperty({ required: false, type: () => CoordsInfo })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CoordsInfo)
    coords?: CoordsInfo | null;
}

export class SetUserAvatarRequest extends UserIdRequest {
    @ApiProperty({ type: 'string', format: 'binary' })
    avatar: Express.Multer.File;
}

export class UploadAvatarRequest {
    @ApiProperty({ required: true, type: 'integer' })
    @IsInt()
    @IsPositive()
    userId: number;

    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    @Type(() => UploadedImageInfo)
    uploadedImage: UploadedImageInfo;

    @ApiProperty({ required: false, type: () => UploadedThumbnailInfo })
    @Type(() => UploadedThumbnailInfo)
    uploadedThumbnail: UploadedThumbnailInfo;
}

export class EditLocationRequest extends UserIdRequest {
    @ApiProperty({ required: false, example: 'Cyprus, Nicosia, Necdet Levent str, 17 apt.' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(commonConstants.maxStringInputLength)
    @IsSanitized()
    location: string;
    @ApiProperty({ type: 'number', format: 'float' })
    @IsLatitude()
    latitude: number;
    @ApiProperty({ type: 'number', format: 'float' })
    @IsLongitude()
    longitude: number;
}

export class SetNotificationRequest extends UserIdRequest {
    @ApiProperty({ required: false, type: 'boolean', default: false })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            if (value.toLocaleLowerCase() === 'true') {
                return true;
            }
            if (value.toLocaleLowerCase() === 'false') {
                return false;
            }
        }
        if (typeof value !== 'boolean') {
            return undefined;
        }
        return value;
    })
    @IsBoolean()
    setRequestsUpdatesOn: boolean;
}

export class SearchUserProfileRequest extends PageInfoRequest {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(commonConstants.maxSearchLength)
    search?: string;

    @ApiProperty({ enum: UserProfileSearchTypes })
    @IsOptional()
    @IsEnum(UserProfileSearchTypes)
    searchType?: UserProfileSearchTypes;

    @ApiProperty({ required: false, type: 'integer' })
    @IsOptional()
    id?: number;
}

export class CreateUserProfileRequest extends UserIdRequest {
    extUserId?: number;
    name?: string;
}
