import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { AuthSessionUserResponse } from '@signy/auth';
import { AuthEventType } from '@signy/auth';
import { OtpCodeResponse, ResendOtpCodeRequest, VerificationCodeRequest } from '@signy/verification';

@Injectable()
export class VerificationService {
    constructor(@Inject('GATEWAY_VERIFICATION_PUBLISHER') private natsClient: ClientProxy) {}

    resendOtpCode(dto: ResendOtpCodeRequest): Observable<OtpCodeResponse> {
        return this.natsClient.send<OtpCodeResponse, ResendOtpCodeRequest>(AuthEventType.VerificationCodeResend, dto);
    }

    verifyOtpCode(dto: VerificationCodeRequest): Observable<AuthSessionUserResponse> {
        return this.natsClient.send<AuthSessionUserResponse, VerificationCodeRequest>(
            AuthEventType.VerificationOtpCode,
            dto
        );
    }
}
