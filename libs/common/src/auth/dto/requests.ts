import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsPhoneNumber } from 'class-validator';
import { CoordsInfo, UserIdRequest } from '../..';
import { otpConstants } from '../../otp';
import { IsPassword, TransformStringTrimLowerCase } from '../../decorators';
import { GenderTypes } from '../../user/enums';

export class CheckUserExistsRequest {
    @ApiProperty({ required: false, type: 'string', format: 'email' })
    @IsOptional()
    @TransformStringTrimLowerCase()
    // @IsAppEmail()
    email?: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @TransformStringTrimLowerCase()
    @IsPhoneNumber()
    phone?: string;
}

export class AuthSignUpRequest {
    @ApiProperty({ required: false, type: 'string', format: 'email' })
    @IsOptional()
    @TransformStringTrimLowerCase()
    // @IsAppEmail()
    email?: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @TransformStringTrimLowerCase()
    @IsPhoneNumber()
    phone?: string;

    @ApiProperty()
    @IsPassword()
    password: string;

    deviceId?: string;
}

export class AuthSignUpRequestInternal {
    email?: string;
    name?: string;
    phone?: string;
}

export class AuthSignInRequest {
    @ApiProperty({ required: false, type: 'string', example: 'Here put email of user or phone number' })
    @IsOptional()
    @TransformStringTrimLowerCase()
    // @IsAppEmail()
    email?: string;

    @ApiHideProperty()
    phone?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    fcmToken?: string;
}

export class AuthCreateSessionRequest extends UserIdRequest {
    fcmToken?: string;
    deviceId?: string;
}

export class ResetPasswordRequest extends CheckUserExistsRequest {}

export class ResetPasswordOTPRequest {
    @ApiProperty({ required: false, type: 'string', format: 'email' })
    @IsOptional()
    @TransformStringTrimLowerCase()
    // @IsAppEmail()
    email?: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @TransformStringTrimLowerCase()
    @IsPhoneNumber()
    phone?: string;

    @ApiProperty()
    @IsString()
    @MinLength(otpConstants.codeLength)
    @MaxLength(otpConstants.codeLength)
    code: string;
}

export class RecoverPasswordRequest {
    @ApiProperty()
    @IsString()
    @MinLength(1)
    @MaxLength(1024)
    recoveryToken: string;

    @ApiProperty()
    @IsPassword()
    newPassword: string;
}

export class FacebookGoogleSignInRequest {
    @ApiProperty({ description: 'Facebook, Google user access token' })
    @IsString()
    @MinLength(1)
    @MaxLength(4096)
    accessToken: string;
}

export class AppleSignInRequest {
    @ApiProperty({
        description: 'A JSON Web Token (JWT) that securely communicates information about the user to your app',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(4048)
    identityToken: string;

    @ApiProperty({
        description: 'An identifier associated with the authenticated user (apple returns this as user field)',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(4048)
    appleUserId: string;

    @ApiProperty({ required: false, description: 'Apple user first name' })
    @IsOptional()
    @IsString()
    @MaxLength(4048)
    firstName?: string;

    @ApiProperty({ required: false, description: 'Apple user last name' })
    @IsOptional()
    @IsString()
    @MaxLength(4048)
    lastName?: string;
}

export class SignUpByInvitationRequest {
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    location?: string | null;
    coords?: CoordsInfo | null;
    gender?: GenderTypes | null;
    dob?: string | null;
    nationalId?: string | null;
}
