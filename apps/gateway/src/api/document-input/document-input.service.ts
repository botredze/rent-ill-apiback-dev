import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SessionUserInfo } from '@signy/auth';
import {
    AddContactToAllInputsRequest,
    GetAllDocumentGroupsAndContactsRequest,
    RemoveContactFromInputRequest,
} from '@signy/document';
import {
    CreateInputForPdfRequest,
    CreateInputForPdfResponse,
    DocmentInputEventType,
    GetDocumentInputsWithSearchRequest,
    GetDocumentInputsWithSearchResponse,
    RemoveDocumentInputRequest,
    SignyInputTypes,
    UpdateInputForPdfRequest,
    UpdateInputForPdfResponse,
} from '@signy/document-input';
import { UploadedFileInfo } from '@signy/upload';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { S3Service, uploadFolders } from '@signy/s3';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class DocumentInputService {
    private logger: Logger;
    constructor(
        @Inject('GATEWAY_DOCUMENT_INPUT_PUBLISHER') private natsClient: ClientProxy,
        private s3Service: S3Service
    ) {
        this.logger = new Logger(DocumentInputService.name);
    }

    async createInputForPdf(user: SessionUserInfo, dto: CreateInputForPdfRequest): Promise<CreateInputForPdfResponse> {
        const uploadedAttachments: UploadedFileInfo[] = [];
        if (dto?.attachments?.length) {
            if (
                dto.type === SignyInputTypes.Attachment ||
                dto.type === SignyInputTypes.Signature ||
                dto.type === SignyInputTypes.Initials
            ) {
                if (!dto?.attachments[0]?.buffer?.length) {
                    throw ServiceRpcException(ApiEC.WrongInput);
                }

                for (const x of dto.attachments) {
                    const uploaded = await this.s3Service.uploadFile({
                        stream: x.buffer,
                        mimetype: x.mimetype,
                        folder: uploadFolders.inputAttachments,
                    });
                    if (uploaded) {
                        uploadedAttachments.push(uploaded);
                    }
                }
            }
            delete dto.attachments;
        }
        return await lastValueFrom(
            this.natsClient.send<CreateInputForPdfResponse, CreateInputForPdfRequest>(
                DocmentInputEventType.CreateInputForPdf,
                {
                    ...dto,
                    userId: user.id,
                    uploadedAttachments: uploadedAttachments?.length ? uploadedAttachments : undefined,
                }
            )
        );
    }

    async updateInputForPdf(user: SessionUserInfo, dto: UpdateInputForPdfRequest): Promise<UpdateInputForPdfResponse> {
        const uploadedAttachments: UploadedFileInfo[] = [];
        if (dto?.attachments?.length) {
            if (!dto?.attachments[0]?.buffer?.length) {
                throw ServiceRpcException(ApiEC.WrongInput);
            }

            for (const x of dto.attachments) {
                const uploaded = await this.s3Service.uploadFile({
                    stream: x.buffer,
                    mimetype: x.mimetype,
                    folder: uploadFolders.inputAttachments,
                });
                if (uploaded) {
                    uploadedAttachments.push(uploaded);
                }
            }
            delete dto.attachments;
        }
        return await lastValueFrom(
            this.natsClient.send<UpdateInputForPdfResponse, UpdateInputForPdfRequest>(
                DocmentInputEventType.UpdateInputForPdf,
                {
                    ...dto,
                    userId: user.id,
                    uploadedAttachments: uploadedAttachments?.length ? uploadedAttachments : undefined,
                }
            )
        );
    }

    async getDocumentInputs(dto: GetDocumentInputsWithSearchRequest): Promise<GetDocumentInputsWithSearchResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetDocumentInputsWithSearchResponse, GetDocumentInputsWithSearchRequest>(
                DocmentInputEventType.GetDocumentInputs,
                {
                    ...dto,
                }
            )
        );
    }

    async removeDocumentInput(dto: RemoveDocumentInputRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, RemoveDocumentInputRequest>(
                DocmentInputEventType.RemoveDocumentInput,
                {
                    ...dto,
                }
            )
        );
    }

    async mergeAllContactsToInputs(dto: GetAllDocumentGroupsAndContactsRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, GetAllDocumentGroupsAndContactsRequest>(
                DocmentInputEventType.MergeAllContactsToInputs,
                {
                    ...dto,
                }
            )
        );
    }

    async addContactToAllInputs(dto: AddContactToAllInputsRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddContactToAllInputsRequest>(
                DocmentInputEventType.AddContactToAllInputs,
                {
                    ...dto,
                }
            )
        );
    }

    async removeContactFromInput(dto: RemoveContactFromInputRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, RemoveContactFromInputRequest>(
                DocmentInputEventType.RemoveContactFromInput,
                {
                    ...dto,
                }
            )
        );
    }
}
