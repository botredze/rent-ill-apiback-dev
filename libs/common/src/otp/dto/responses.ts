import { ApiSuccessResponse } from '@signy/exceptions';
import { OtpUserInfo } from '.';
import { OtpType } from '../enums';

export class VerifyOtpCodeResponse extends ApiSuccessResponse {
    user: OtpUserInfo;
    otpType: OtpType;
}

export class OtpCodeResponse {
    isSent: boolean;
    timeout: number;
}

export class IsOtpCodeValidResponse {
    otpCodeValid: boolean;
}
