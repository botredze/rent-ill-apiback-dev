import { ApiProperty } from '@nestjs/swagger';
import { PageInfoRequest } from '@signy/pagination';
import { IsString, IsNotEmpty, IsBoolean, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { commonConstants, Language } from '../..';
import { UserIdRequest } from '../..';
import { IsAppEmail } from '../../decorators';
import { IsPassword } from '../../decorators';
import { TransformStringTrimLowerCase } from '../../decorators';
import { UserSearchType } from '../enums';

export class AuthSessionUserRequest extends UserIdRequest {
    sessionToken?: string;
}

export class SetTermsAndPolicyRequest extends AuthSessionUserRequest {
    @ApiProperty()
    @IsBoolean()
    setTermsPolicyAccepted: boolean;
}

export class SetFcmTokenRequest extends AuthSessionUserRequest {
    @ApiProperty()
    @IsString()
    @MaxLength(commonConstants.maxTokenLength)
    fcmToken: string;
}

export class CheckPasswordRequest extends UserIdRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class ChangePasswordRequest extends UserIdRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty()
    @IsPassword()
    newPassword: string;
}

export class ChangeEmailRequest extends UserIdRequest {
    @ApiProperty({ type: 'string', format: 'email' })
    @TransformStringTrimLowerCase()
    @IsAppEmail()
    @MaxLength(commonConstants.maxEmailLength)
    currentEmail: string;

    @ApiProperty({ type: 'string', format: 'email' })
    @TransformStringTrimLowerCase()
    @IsAppEmail()
    @MaxLength(commonConstants.maxEmailLength)
    newEmail: string;
}

export class SearchUserRequest extends PageInfoRequest {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(commonConstants.maxSearchLength)
    search?: string;

    @ApiProperty({ enum: UserSearchType })
    @IsOptional()
    @IsEnum(UserSearchType)
    searchType?: UserSearchType;
}

export class SetUserDriveTokenRequest extends UserIdRequest {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    token: string;
}

export class SetUserLangRequest extends UserIdRequest {
    @ApiProperty({ enum: Language })
    @IsEnum(Language)
    lang: Language;
}
