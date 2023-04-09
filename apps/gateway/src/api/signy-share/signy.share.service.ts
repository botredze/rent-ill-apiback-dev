import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SignyShareService {
    private logger: Logger;
    constructor(@Inject('GATEWAY_SIGNY_SHARE_PUBLISHER') private natsClient: ClientProxy) {
        this.logger = new Logger(SignyShareService.name);
    }

    async generateShare(dto: SignyGenerateShareRequest): Promise<SignyGenerateShareResponse> {
        return await lastValueFrom(
            this.natsClient.send<SignyGenerateShareResponse, SignyGenerateShareRequest>(
                ShareEventTypes.GenerateShare,
                dto
            )
        );
    }

    async shareDocument(dto: SignyShareDocumentRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, SignyShareDocumentRequest>(ShareEventTypes.ShareDocument, dto)
        );
    }

    async scheduleShare(dto: SignyScheduleShareRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, SignyScheduleShareRequest>(ShareEventTypes.ScheduleShare, dto)
        );
    }

    async generateShareLinkForSignatory(
        dto: GenerateShareLinkForSignatoryRequest
    ): Promise<GenerateShareLinkForSignatoryResponse> {
        return await lastValueFrom(
            this.natsClient.send<GenerateShareLinkForSignatoryResponse, GenerateShareLinkForSignatoryRequest>(
                ShareEventTypes.GenerateShareLinkForSignatory,
                dto
            )
        );
    }
}
