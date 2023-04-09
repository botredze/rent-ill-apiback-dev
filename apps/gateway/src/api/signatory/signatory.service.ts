import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DocumentIdRequest } from '@signy/document';
import {
    AddSignatoryInputHistoryRequest,
    AddSignatoryRequest,
    CreateSignatoryRequest,
    DeleteSignatoryRequest,
    DeleteSignatureRequest,
    GetDocumentInputHistoryResponse,
    InsertSignatureRequest,
    IsPassCodeExistsRequest,
    SearchSignatoriesWithFilterRequest,
    SearchSignatoryWithFilterResponse,
    SignatoryEventTypes,
    SignOrderBulkUpdateRequest,
    UpdateSignatoryRequest,
    UploadSignatureRequest,
    UploadSignatureResponse,
} from '@signy/signatory';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { S3Service, uploadFolders } from '@signy/s3';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SignatoryService {
    private logger: Logger;
    constructor(@Inject('GATEWAY_SIGNATORY_PUBLISHER') private natsClient: ClientProxy, private s3Service: S3Service) {
        this.logger = new Logger(SignatoryService.name);
    }

    async createSignatory(dto: CreateSignatoryRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, CreateSignatoryRequest>(SignatoryEventTypes.CreateSignatory, {
                ...dto,
            })
        );
    }

    async updateSignatory(dto: UpdateSignatoryRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, UpdateSignatoryRequest>(SignatoryEventTypes.UpdateSignatory, {
                ...dto,
            })
        );
    }

    async addSignatoryToDocument(dto: AddSignatoryRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddSignatoryRequest>(SignatoryEventTypes.AddSignatoryToDocument, {
                ...dto,
            })
        );
    }

    async searchSignatoriesWithFilter(
        dto: SearchSignatoriesWithFilterRequest
    ): Promise<SearchSignatoryWithFilterResponse> {
        return await lastValueFrom(
            this.natsClient.send<SearchSignatoryWithFilterResponse, SearchSignatoriesWithFilterRequest>(
                SignatoryEventTypes.SearchSignatoriesWithFilter,
                {
                    ...dto,
                }
            )
        );
    }

    async addInputHistory(dto: AddSignatoryInputHistoryRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddSignatoryInputHistoryRequest>(
                SignatoryEventTypes.SignatoryAddInputHistory,
                {
                    ...dto,
                }
            )
        );
    }

    async isPassCodeExists(dto: IsPassCodeExistsRequest): Promise<boolean> {
        return await lastValueFrom(
            this.natsClient.send<boolean, IsPassCodeExistsRequest>(SignatoryEventTypes.IsPassCodeExists, {
                ...dto,
            })
        );
    }

    async getDocumentInputHistory(dto: DocumentIdRequest): Promise<GetDocumentInputHistoryResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetDocumentInputHistoryResponse, DocumentIdRequest>(
                SignatoryEventTypes.GetDocumentInputHistory,
                {
                    ...dto,
                }
            )
        );
    }

    async deleteSignatory(dto: DeleteSignatoryRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, DeleteSignatoryRequest>(SignatoryEventTypes.DeleteSignatory, {
                ...dto,
            })
        );
    }

    async signOrderBulkUpdate(dto: SignOrderBulkUpdateRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, SignOrderBulkUpdateRequest>(
                SignatoryEventTypes.SignOrderBulkUpdate,
                {
                    ...dto,
                }
            )
        );
    }

    async uploadSignature(dto: UploadSignatureRequest): Promise<UploadSignatureResponse> {
        if (!dto?.signature?.buffer?.length || !dto?.userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const uploadedImage = await this.s3Service.uploadImage({
            stream: dto.signature.buffer,
            mimetype: dto.signature.mimetype,
            imageFolder: uploadFolders.signySignatures,
            userId: dto.userId,
        });
        if (!uploadedImage?.imageUrl) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return await lastValueFrom(
            this.natsClient.send<UploadSignatureResponse, InsertSignatureRequest>(SignatoryEventTypes.UploadSignature, {
                signatoryId: dto.signatoryId,
                uploadedSignature: uploadedImage,
            })
        );
    }

    async deleteSignature(dto: DeleteSignatureRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, DeleteSignatureRequest>(SignatoryEventTypes.DeleteSignature, {
                ...dto,
            })
        );
    }
}
