import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserIdRequest } from '@signy/common';
import { FcmTokensResponse } from '@signy/sessions';
import { SessionEventsType } from '@signy/sessions';
import { SessionService } from './session.service';

@Controller()
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}
    @MessagePattern(SessionEventsType.GetUserFcmTokens)
    async getUserFcmTokens(dto: UserIdRequest): Promise<FcmTokensResponse> {
        return this.sessionService.getUserFcmTokens(dto);
    }
}
