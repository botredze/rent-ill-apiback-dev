import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserIdRequest } from '@signy/common';
import {
    DocumentEventType,
    UploadDocumentResponse,
    InsertDocumentRequest,
    ChangeStatusOfDocumentRequest,
    GetDocumentByIdResponse,
    DocumentIdRequest,
    ChangeDocumentStepTypeRequest,
    GetAllUserDocuments,
    GetUserDocumentsRequest,
    UpdateDocumentFilesRequest,
    CreateDocumentCustomGroupResponse,
    CreateCustomGroupRequest,
    DeleteGroupRequest,
    UpdateGroupRequest,
    CheckPassCodeRequest,
    UpdateDocumentSettingsRequest,
    GetAllDocumentGroupsAndContactsRequest,
    GetDocumentGrroupsAndContactsResponse,
    AddDocumentToGroupRequest,
    ChangeStatusOfDocumentsBulkRequest,
    AddGroupToFavouriteRequest,
    GetAllUserDocumentGroups,
    CheckPassCodeResponse,
    CreateDocumentFromTemplateRequest,
    GetUserDocumentsCountResponse,
} from '@signy/document';
import { SignyDocument } from '@signy/db';
import { ApiSuccessResponse } from '@signy/exceptions';
import { DocumentService } from './document.service';

@Controller()
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}
    @MessagePattern(DocumentEventType.UploadDocument)
    async uploadDocument(dto: InsertDocumentRequest): Promise<UploadDocumentResponse> {
        return this.documentService.uploadDocument(dto);
    }

    @MessagePattern(DocumentEventType.ChangeStatusOfDocument)
    async changeStatusOfDocument(dto: ChangeStatusOfDocumentRequest): Promise<ApiSuccessResponse> {
        return this.documentService.changeStatusOfDocument(dto);
    }

    @MessagePattern(DocumentEventType.GetDocumentById)
    async getDocumentById(dto: DocumentIdRequest): Promise<GetDocumentByIdResponse> {
        return this.documentService.getDocumentById(dto);
    }

    @MessagePattern(DocumentEventType.ChangeDocumentStepType)
    async changeDocumentStepType(dto: ChangeDocumentStepTypeRequest): Promise<ApiSuccessResponse> {
        return this.documentService.changeDocumentStepType(dto);
    }

    @MessagePattern(DocumentEventType.GetUserDocuments)
    async getUserDocuments(dto: GetUserDocumentsRequest): Promise<GetAllUserDocuments> {
        return this.documentService.getUserDocuments(dto);
    }

    @MessagePattern(DocumentEventType.GetDocumentWithPermission)
    async getDocumentWithPermission(dto: DocumentIdRequest): Promise<SignyDocument> {
        return this.documentService.getDocumentWithPermission(dto);
    }

    @MessagePattern(DocumentEventType.GetIsSameDocumentSign)
    async getIsSameDocumentSign(dto: number): Promise<boolean> {
        return this.documentService.getIsSameDocumentSign(dto);
    }

    @MessagePattern(DocumentEventType.UpdateDocumentFiles)
    async updateDocumentFiles(dto: UpdateDocumentFilesRequest): Promise<ApiSuccessResponse> {
        return this.documentService.updateDocumentFiles(dto);
    }

    @MessagePattern(DocumentEventType.CreateDocumentCustomGroup)
    async createCustomGroup(dto: CreateCustomGroupRequest): Promise<CreateDocumentCustomGroupResponse> {
        return this.documentService.createCustomGroup(dto);
    }

    @MessagePattern(DocumentEventType.DeleteDocumentGroup)
    async deleteGroup(dto: DeleteGroupRequest): Promise<ApiSuccessResponse> {
        return this.documentService.deleteGroup(dto);
    }

    @MessagePattern(DocumentEventType.UpdateDocumentGroup)
    async updateGroup(dto: UpdateGroupRequest): Promise<ApiSuccessResponse> {
        return this.documentService.updateGroup(dto);
    }

    @MessagePattern(DocumentEventType.CheckPassCode)
    async checkPassCode(dto: CheckPassCodeRequest): Promise<CheckPassCodeResponse> {
        return this.documentService.checkPassCode(dto);
    }

    @MessagePattern(DocumentEventType.UpdateDocumentSettings)
    async updateDocumentSettings(dto: UpdateDocumentSettingsRequest): Promise<ApiSuccessResponse> {
        return this.documentService.updateDocumentSettings(dto);
    }

    @MessagePattern(DocumentEventType.GetAllDocumentGroupsAndContacts)
    async getAllDocumentGroupsAndContacts(
        dto: GetAllDocumentGroupsAndContactsRequest
    ): Promise<GetDocumentGrroupsAndContactsResponse> {
        return this.documentService.getAllDocumentGroupsAndContacts(dto);
    }

    @MessagePattern(DocumentEventType.AddDocumentToGroup)
    async addDocumentToGroup(dto: AddDocumentToGroupRequest): Promise<ApiSuccessResponse> {
        return this.documentService.addDocumentToGroup(dto);
    }

    @MessagePattern(DocumentEventType.ChangeStatusOfDocumentsBulk)
    async changeStatusOfDocumentsBulk(dto: ChangeStatusOfDocumentsBulkRequest): Promise<ApiSuccessResponse> {
        return this.documentService.changeStatusOfDocumentsBulk(dto);
    }

    @MessagePattern(DocumentEventType.AddGroupToFavourite)
    async addGroupToFavourite(dto: AddGroupToFavouriteRequest): Promise<ApiSuccessResponse> {
        return this.documentService.addGroupToFavourite(dto);
    }

    @MessagePattern(DocumentEventType.GetAllUserDocumentGroups)
    async getAllUserDocumentGroups(dto: UserIdRequest): Promise<GetAllUserDocumentGroups> {
        return this.documentService.getAllUserDocumentGroups(dto);
    }

    @MessagePattern(DocumentEventType.GetSentDocuments)
    async getSentDocuments(dto: UserIdRequest): Promise<GetAllUserDocuments> {
        return this.documentService.getSentDocuments(dto);
    }

    @MessagePattern(DocumentEventType.GetRecievedDocuments)
    async getRecievedDocuments(dto: UserIdRequest): Promise<GetAllUserDocuments> {
        return this.documentService.getRecievedDocuments(dto);
    }

    @MessagePattern(DocumentEventType.CheckIfPassCodeExixsts)
    async checkIfPassCodeExixsts(dto: GetAllDocumentGroupsAndContactsRequest): Promise<ApiSuccessResponse> {
        return this.documentService.checkIfPassCodeExixsts(dto);
    }

    @MessagePattern(DocumentEventType.CreateDocumentFromTemplate)
    async createDocumentFromTemplateRequest(dto: CreateDocumentFromTemplateRequest): Promise<UploadDocumentResponse> {
        return this.documentService.createDocumentFromTemplateRequest(dto);
    }

    @MessagePattern(DocumentEventType.CreateTemplateFromDocument)
    async createTemplateFromDocument(dto: GetAllDocumentGroupsAndContactsRequest): Promise<UploadDocumentResponse> {
        return this.documentService.createTemplateFromDocument(dto);
    }

    @MessagePattern(DocumentEventType.GetUserDocumentsCount)
    async getUserDocumentsCount(dto: UserIdRequest): Promise<GetUserDocumentsCountResponse> {
        return this.documentService.getUserDocumentsCount(dto);
    }
}
