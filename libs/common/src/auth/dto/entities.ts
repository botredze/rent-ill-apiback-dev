import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsAppEmail } from '../../decorators';
import { ApiProperty } from '@nestjs/swagger';
import { AuthType } from '../enums';
import { UploadedImageInfo } from '../../upload/dto';
import { Type } from 'class-transformer';
import { SignatoryBaseInfo } from '../../signy/dto';
import { Language } from '../../enums';

export class JWTPayload {
    id: number;
    sessionToken: string;
    iat: number;
    exp?: number;
    iss?: string;
}

export class ExternalUserInfo {
    @IsString()
    @MaxLength(1024)
    userId: string;

    @IsAppEmail()
    internalEmail: string;

    @IsEnum(AuthType)
    authType: AuthType;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    userEmail?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    displayName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    lastName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1024)
    avatar?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    userPhone?: string;
}

export class ExternalUserContactsInfo {
    contacts: ExternalUserInfo[];
}

export class SessionUserInfo {
    @ApiProperty({ type: 'integer' })
    id: number;

    @ApiProperty({ enum: AuthType })
    authType: AuthType;

    @ApiProperty({ required: false })
    sessionToken?: string;

    @ApiProperty({ required: false })
    fullName?: string;

    @ApiProperty()
    email?: string;

    @ApiProperty()
    phone?: string[];

    @ApiProperty()
    isEmailVerified: boolean;

    @ApiProperty()
    isPhoneVerified: boolean;

    @ApiProperty()
    @IsString()
    dob?: string | undefined;

    @ApiProperty()
    @IsString()
    suffix?: string;

    @ApiProperty()
    @IsString()
    gender?: string;

    @ApiProperty()
    @IsEnum(Language)
    language?: Language;

    @ApiProperty()
    isTermsAndPolicyAccepted: boolean;

    @ApiProperty()
    isTrailOn: boolean;

    @ApiProperty()
    isUserProfileSetupRequired: boolean;

    @ApiProperty()
    canChangeEmail: boolean;

    @ApiProperty()
    canChangePassword: boolean;

    @ApiProperty()
    isUserHintsPassed: boolean;

    @ApiProperty()
    isDriveSyncOn: boolean;

    @ApiProperty()
    signatory?: SignatoryBaseInfo;
}

export class UserBaseInfo {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    userName?: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    @Type(() => UploadedImageInfo)
    @IsOptional()
    avatar?: UploadedImageInfo;
    @IsOptional()
    @IsString()
    dob?: string | undefined;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    suffix?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    phone?: string[];
}

export class UserSettingsInfo {
    @ApiProperty()
    isNotificationsOn: boolean;
}
