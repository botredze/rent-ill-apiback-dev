import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { otpConstants } from '../../otp';
import { OtpType } from '../../otp';
import { AuthSessionUserRequest } from '../../user';

export class ResendOtpCodeRequest extends AuthSessionUserRequest {
    @ApiProperty({ enum: OtpType })
    @IsEnum(OtpType)
    otpType: OtpType;
}

export class VerificationCodeRequest extends ResendOtpCodeRequest {
    @ApiProperty()
    @IsString()
    @MinLength(otpConstants.codeLength)
    @MaxLength(otpConstants.codeLength)
    code: string;
}
