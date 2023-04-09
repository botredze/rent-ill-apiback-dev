import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SignyService } from './signy.service';
import { SignyEventType, SignPdfRequest, SignPdfResponse } from '@signy/signy';

@Controller()
export class SignyController {
    constructor(private readonly signyService: SignyService) {}
    @MessagePattern(SignyEventType.SignPdf)
    async signPdf(dto: SignPdfRequest): Promise<SignPdfResponse> {
        return this.signyService.signPdf(dto);
    }
}
