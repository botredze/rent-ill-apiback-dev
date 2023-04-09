import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import {
    OtpEventType,
    ChannelCodeWithOtpTypeRequest,
    ChannelOtpTypeForcedRequest,
    IsOtpCodeValidResponse,
    OtpCodeResponse,
    OtpTypeRequest,
    VerifyOtpCodeRequest,
    VerifyOtpCodeResponse,
} from '@signy/otp';
import { OtpService } from './otp.service';

@Controller()
export class OtpController {
    constructor(private readonly otpService: OtpService) {}
    @MessagePattern(OtpEventType.VerifyOtpCode)
    async verifyOtpCode(dto: VerifyOtpCodeRequest): Promise<VerifyOtpCodeResponse> {
        return this.otpService.verifyOtpCode(dto);
    }

    @MessagePattern(OtpEventType.ResendOtpCode)
    async resendOtpCode(dto: OtpTypeRequest): Promise<OtpCodeResponse> {
        return this.otpService.resendOtpCode(dto);
    }

    @MessagePattern(OtpEventType.IsOtpCodeValid)
    async isOtpCodeValid(dto: ChannelCodeWithOtpTypeRequest): Promise<IsOtpCodeValidResponse> {
        return { otpCodeValid: await this.otpService.isOtpCodeValid(dto) };
    }

    @EventPattern(OtpEventType.DisableOtpCode)
    async disableOtpCode(dto: ChannelOtpTypeForcedRequest): Promise<void> {
        return this.otpService.disableOtpCode(dto);
    }
}
