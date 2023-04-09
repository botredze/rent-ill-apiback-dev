import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
    SignyGenerateShareResponse,
    ShareEventTypes,
    SignyGenerateShareRequest,
    SignyShareDocumentRequest,
    SignyScheduleShareRequest,
    GenerateShareLinkForSignatoryRequest,
    GenerateShareLinkForSignatoryResponse,
} from '@signy/signy-share-document';
import { ApiSuccessResponse } from '@signy/exceptions';
import { ShareService } from './share.service';

@Controller()
export class ShareController {
    constructor(private readonly shareService: ShareService) {}

    @MessagePattern(ShareEventTypes.GenerateShare)
    async generateShare(dto: SignyGenerateShareRequest): Promise<SignyGenerateShareResponse> {
        return await this.shareService.generateShare(dto);
    }

    @MessagePattern(ShareEventTypes.GenerateShareLinkForSignatory)
    async generateShareLinkForSignatory(
        dto: GenerateShareLinkForSignatoryRequest
    ): Promise<GenerateShareLinkForSignatoryResponse> {
        return await this.shareService.generateShareLinkForSignatory(dto);
    }

    @MessagePattern(ShareEventTypes.ShareDocument)
    async shareDocument(dto: SignyShareDocumentRequest): Promise<ApiSuccessResponse> {
        return await this.shareService.shareDocument(dto);
    }

    @MessagePattern(ShareEventTypes.ScheduleShare)
    async scheduleShare(dto: SignyScheduleShareRequest): Promise<ApiSuccessResponse> {
        return await this.shareService.scheduleShare(dto);
    }
}
