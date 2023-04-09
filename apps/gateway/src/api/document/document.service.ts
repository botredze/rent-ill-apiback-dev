import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    AddDocumentToGroupRequest,
    AddGroupToFavouriteRequest,
    ChangeDocumentStepTypeRequest,
    ChangeStatusOfDocumentRequest,
    ChangeStatusOfDocumentsBulkRequest,
    CheckPassCodeRequest,
    CheckPassCodeResponse,
    CreateCustomGroupRequest,
    CreateDocumentCustomGroupResponse,
    CreateDocumentFromTemplateRequest,
    DeleteGroupRequest,
    DocumentEventType,
    DocumentIdRequest,
    GetAllDocumentGroupsAndContactsRequest,
    GetAllUserDocumentGroups,
    GetAllUserDocuments,
    GetDocumentByIdResponse,
    GetUserDocumentsRequest,
    InsertDocumentRequest,
    UpdateDocumentFilesRequest,
    UpdateDocumentSettingsRequest,
    UpdateGroupRequest,
    UploadDocumentRequest,
    UploadDocumentResponse,
} from '@signy/document';
import { lastValueFrom } from 'rxjs';
import { S3Service } from '@signy/s3';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { SignyDocumentStatusTypes, UserIdRequest } from '@signy/common';
import { AccessTypes, CheckAccessRequest, SubscriptionEventTypes } from '@signy/subscription';

@Injectable()
export class DocumentService {
    private logger: Logger;
    constructor(@Inject('GATEWAY_DOCUMENT_PUBLISHER') private natsClient: ClientProxy, private s3Service: S3Service) {
        this.logger = new Logger(DocumentService.name);
    }

    async uploadDocument(dto: UploadDocumentRequest): Promise<UploadDocumentResponse> {
        if (!dto?.pdf?.buffer?.length || !dto?.userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        if (dto?.isTemplate) {
            await lastValueFrom(
                this.natsClient.send<ApiSuccessResponse, CheckAccessRequest>(SubscriptionEventTypes.CheckAccess, {
                    userId: dto.userId,
                    type: AccessTypes.TEMPLATE,
                })
            );
        } else {
            await lastValueFrom(
                this.natsClient.send<ApiSuccessResponse, CheckAccessRequest>(SubscriptionEventTypes.CheckAccess, {
                    userId: dto.userId,
                    type: AccessTypes.DOCUMENT,
                })
            );
        }
        await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, CheckAccessRequest>(SubscriptionEventTypes.CheckAccess, {
                userId: dto.userId,
                type: AccessTypes.STORAGE,
                size: dto.pdf.size,
            })
        );

        const uploadedFile = await this.s3Service.uploadFile({
            stream: dto.pdf.buffer,
            mimetype: dto.pdf.mimetype,
            key: dto.pdf.filename,
        });
        if (!uploadedFile?.fileUrl) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }
        return await lastValueFrom(
            this.natsClient.send<UploadDocumentResponse, InsertDocumentRequest>(DocumentEventType.UploadDocument, {
                pdfKey: uploadedFile?.fileKey,
                pdfUrl: uploadedFile.fileUrl,
                userId: dto.userId,
                mimetype: dto?.pdf?.mimetype,
                extraData: dto?.extraData,
                name: dto?.pdf?.filename,
                size: dto?.pdf?.size,
                isTemplate: dto?.isTemplate,
                uploadDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            })
        );
    }

    async changeStatusOfDocument(dto: ChangeStatusOfDocumentRequest): Promise<ApiSuccessResponse> {
        if (dto.status === SignyDocumentStatusTypes.Active) {
            await lastValueFrom(
                this.natsClient.send<ApiSuccessResponse, CheckAccessRequest>(SubscriptionEventTypes.CheckAccess, {
                    userId: dto.userId,
                    type: AccessTypes.TEMPLATE,
                })
            );
            await lastValueFrom(
                this.natsClient.send<ApiSuccessResponse, CheckAccessRequest>(SubscriptionEventTypes.CheckAccess, {
                    userId: dto.userId,
                    type: AccessTypes.DOCUMENT,
                })
            );
        }

        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, ChangeStatusOfDocumentRequest>(
                DocumentEventType.ChangeStatusOfDocument,
                {
                    ...dto,
                }
            )
        );
    }

    async getDocumentById(dto: DocumentIdRequest): Promise<GetDocumentByIdResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetDocumentByIdResponse, DocumentIdRequest>(DocumentEventType.GetDocumentById, {
                ...dto,
            })
        );
    }

    async changeDocumentStepType(dto: ChangeDocumentStepTypeRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, ChangeDocumentStepTypeRequest>(
                DocumentEventType.ChangeDocumentStepType,
                {
                    ...dto,
                }
            )
        );
    }

    async getUserDocuments(dto: GetUserDocumentsRequest): Promise<GetAllUserDocuments> {
        return await lastValueFrom(
            this.natsClient.send<GetAllUserDocuments, GetUserDocumentsRequest>(DocumentEventType.GetUserDocuments, {
                ...dto,
            })
        );
    }

    async getDocumentWithPermission(dto: number): Promise<boolean> {
        return await lastValueFrom(this.natsClient.send<boolean, number>(DocumentEventType.GetIsSameDocumentSign, dto));
    }

    async updateDocumentFiles(dto: UpdateDocumentFilesRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, UpdateDocumentFilesRequest>(
                DocumentEventType.UpdateDocumentFiles,
                {
                    ...dto,
                }
            )
        );
    }

    async createCustomGroup(dto: CreateCustomGroupRequest): Promise<CreateDocumentCustomGroupResponse> {
        return await lastValueFrom(
            this.natsClient.send<CreateDocumentCustomGroupResponse, CreateCustomGroupRequest>(
                DocumentEventType.CreateDocumentCustomGroup,
                {
                    ...dto,
                }
            )
        );
    }

    async deleteGroup(dto: DeleteGroupRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, DeleteGroupRequest>(DocumentEventType.DeleteDocumentGroup, {
                ...dto,
            })
        );
    }

    async updateGroup(dto: UpdateGroupRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, UpdateGroupRequest>(DocumentEventType.UpdateDocumentGroup, {
                ...dto,
            })
        );
    }

    async checkPassCode(dto: CheckPassCodeRequest): Promise<CheckPassCodeResponse> {
        return await lastValueFrom(
            this.natsClient.send<CheckPassCodeResponse, CheckPassCodeRequest>(DocumentEventType.CheckPassCode, {
                ...dto,
            })
        );
    }

    async updateDocumentSettings(dto: UpdateDocumentSettingsRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, UpdateDocumentSettingsRequest>(
                DocumentEventType.UpdateDocumentSettings,
                {
                    ...dto,
                }
            )
        );
    }

    async addDocumentToGroup(dto: AddDocumentToGroupRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddDocumentToGroupRequest>(DocumentEventType.AddDocumentToGroup, {
                ...dto,
            })
        );
    }

    async changeStatusOfDocumentsBulk(dto: ChangeStatusOfDocumentsBulkRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, ChangeStatusOfDocumentsBulkRequest>(
                DocumentEventType.ChangeStatusOfDocumentsBulk,
                {
                    ...dto,
                }
            )
        );
    }

    async addGroupToFavourite(dto: AddGroupToFavouriteRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddGroupToFavouriteRequest>(
                DocumentEventType.AddGroupToFavourite,
                {
                    ...dto,
                }
            )
        );
    }

    async getAllUserDocumentGroups(dto: UserIdRequest): Promise<GetAllUserDocumentGroups> {
        return await lastValueFrom(
            this.natsClient.send<GetAllUserDocumentGroups, UserIdRequest>(DocumentEventType.GetAllUserDocumentGroups, {
                ...dto,
            })
        );
    }

    async getSentDocuments(dto: UserIdRequest): Promise<GetAllUserDocuments> {
        return await lastValueFrom(
            this.natsClient.send<GetAllUserDocuments, UserIdRequest>(DocumentEventType.GetSentDocuments, dto)
        );
    }

    async getRecievedDocuments(dto: UserIdRequest): Promise<GetAllUserDocuments> {
        return await lastValueFrom(
            this.natsClient.send<GetAllUserDocuments, UserIdRequest>(DocumentEventType.GetRecievedDocuments, dto)
        );
    }

    async checkIfPassCodeExixsts(dto: GetAllDocumentGroupsAndContactsRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, GetAllDocumentGroupsAndContactsRequest>(
                DocumentEventType.CheckIfPassCodeExixsts,
                dto
            )
        );
    }

    async createDocumentFromTemplate(dto: CreateDocumentFromTemplateRequest): Promise<UploadDocumentResponse> {
        await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, CheckAccessRequest>(SubscriptionEventTypes.CheckAccess, {
                userId: dto.userId,
                type: AccessTypes.DOCUMENT,
            })
        );
        return await lastValueFrom(
            this.natsClient.send<UploadDocumentResponse, CreateDocumentFromTemplateRequest>(
                DocumentEventType.CreateDocumentFromTemplate,
                dto
            )
        );
    }

    async createTemplateFromDocument(dto: GetAllDocumentGroupsAndContactsRequest): Promise<UploadDocumentResponse> {
        await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, CheckAccessRequest>(SubscriptionEventTypes.CheckAccess, {
                userId: dto.userId,
                type: AccessTypes.TEMPLATE,
            })
        );
        return await lastValueFrom(
            this.natsClient.send<UploadDocumentResponse, GetAllDocumentGroupsAndContactsRequest>(
                DocumentEventType.CreateTemplateFromDocument,
                dto
            )
        );
    }
}
