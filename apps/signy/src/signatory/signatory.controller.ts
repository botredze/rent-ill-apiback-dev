import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DocumentIdRequest } from '@signy/document';
import {
    AddSignatoryInputHistoryRequest,
    AddSignatoryRequest,
    CreateSignatoryRequest,
    DeleteSignatoryRequest,
    GetDocumentInputHistoryResponse,
    IsPassCodeExistsRequest,
    SearchSignatoriesWithFilterRequest,
    SearchSignatoryWithFilterResponse,
    SignatoryEventTypes,
    SignOrderBulkUpdateRequest,
    UpdateSignatoryRequest,
    InsertSignatureRequest,
    UploadSignatureResponse,
    DeleteSignatureRequest,
} from '@signy/signatory';
import { ApiSuccessResponse } from '@signy/exceptions';
import { SignatoryService } from './signatory.service';

@Controller()
export class SignatoryController {
    constructor(private readonly signatoryService: SignatoryService) {}

    @MessagePattern(SignatoryEventTypes.CreateSignatory)
    async createSignatory(dto: CreateSignatoryRequest): Promise<ApiSuccessResponse> {
        return await this.signatoryService.createSignatory(dto);
    }

    @MessagePattern(SignatoryEventTypes.UpdateSignatory)
    async updateSignatory(dto: UpdateSignatoryRequest): Promise<ApiSuccessResponse> {
        return await this.signatoryService.updateSignatory(dto);
    }

    @MessagePattern(SignatoryEventTypes.AddSignatoryToDocument)
    async addSignatoryToDocument(dto: AddSignatoryRequest): Promise<ApiSuccessResponse> {
        return await this.signatoryService.addSignatoryToDocument(dto);
    }

    @MessagePattern(SignatoryEventTypes.SearchSignatoriesWithFilter)
    async searchSignatoriesWithFilter(
        dto: SearchSignatoriesWithFilterRequest
    ): Promise<SearchSignatoryWithFilterResponse> {
        return await this.signatoryService.searchSignatoriesWithFilter(dto);
    }

    @MessagePattern(SignatoryEventTypes.SignatoryAddInputHistory)
    async addInputHistory(dto: AddSignatoryInputHistoryRequest): Promise<ApiSuccessResponse> {
        return await this.signatoryService.addInputHistory(dto);
    }

    @MessagePattern(SignatoryEventTypes.IsPassCodeExists)
    async isPassCodeExists(dto: IsPassCodeExistsRequest): Promise<boolean> {
        return await this.signatoryService.isPassCodeExists(dto);
    }

    @MessagePattern(SignatoryEventTypes.GetDocumentInputHistory)
    async getDocumentInputHistory(dto: DocumentIdRequest): Promise<GetDocumentInputHistoryResponse> {
        return await this.signatoryService.getDocumentInputHistory(dto);
    }

    @MessagePattern(SignatoryEventTypes.DeleteSignatory)
    async deleteSignatory(dto: DeleteSignatoryRequest): Promise<ApiSuccessResponse> {
        return await this.signatoryService.deleteSignatory(dto);
    }

    @MessagePattern(SignatoryEventTypes.SignOrderBulkUpdate)
    async signOrderBulkUpdate(dto: SignOrderBulkUpdateRequest): Promise<ApiSuccessResponse> {
        return await this.signatoryService.signOrderBulkUpdate(dto);
    }

    @MessagePattern(SignatoryEventTypes.UploadSignature)
    async uploadSignature(dto: InsertSignatureRequest): Promise<UploadSignatureResponse> {
        return await this.signatoryService.uploadSignature(dto);
    }

    @MessagePattern(SignatoryEventTypes.DeleteSignature)
    async deleteSignature(dto: DeleteSignatureRequest): Promise<ApiSuccessResponse> {
        return await this.signatoryService.deleteSignature(dto);
    }
}
