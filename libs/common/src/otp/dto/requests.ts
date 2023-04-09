import { OtpUserInfo } from './entities';
import { OtpType } from '../enums';

export class ChannelOtpTypeRequest {
  channel: string;
  otpType: OtpType;
}

export class ChannelOtpTypeForcedRequest extends ChannelOtpTypeRequest {
  force?: boolean;
}

export class ChannelCodeWithOtpTypeRequest extends ChannelOtpTypeRequest {
  code: string;
  admin?: boolean;
}

export class OtpUserInfoRequest {
  user: OtpUserInfo;
}

export class OtpTypeRequest extends OtpUserInfoRequest {
  link?: string;
  otpType: OtpType;
}

export class VerifyOtpCodeRequest extends OtpTypeRequest {
  code: string;
  admin?: boolean;
}
