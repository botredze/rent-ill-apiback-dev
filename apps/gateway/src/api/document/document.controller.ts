import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { JwtAuthGuard } from '../auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { pdfFileFilter, uploadConstants } from '@signy/s3';
import { UserPassport } from '../auth/decorators';
import { SessionUserInfo } from '@signy/auth';
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
    DocumentIdRequest,
    GetAllDocumentGroupsAndContactsRequest,
    GetAllUserDocumentGroups,
    GetAllUserDocuments,
    GetDocumentByIdResponse,
    GetUserDocumentsRequest,
    UpdateDocumentSettingsRequest,
    UpdateGroupRequest,
    UploadDocumentRequest,
    UploadDocumentResponse,
} from '@signy/document';
import 'multer';
import { DocumentService } from './document.service';
@ApiTags('Document')
@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('document')
@UseGuards(JwtAuthGuard)
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post('upload-document')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('pdf', { limits: { fileSize: uploadConstants.maxFileSize }, fileFilter: pdfFileFilter })
    )
    @ApiOperation({ summary: 'Upload Document' })
    async uploadDocument(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UploadDocumentRequest,
        @UploadedFile() pdf: Express.Multer.File
    ): Promise<UploadDocumentResponse> {
        return this.documentService.uploadDocument({ ...dto, pdf, userId });
    }

    @Post('change-status-of-document')
    @ApiOperation({ summary: 'Change status of document to active, deleted, archived' })
    async changeStatusOfDocument(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: ChangeStatusOfDocumentRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentService.changeStatusOfDocument({ ...dto, userId: user.id });
    }

    @Post('get-document-by-id')
    @ApiOperation({ summary: 'Get doucment and document setting by id' })
    async getDocumentById(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: DocumentIdRequest
    ): Promise<GetDocumentByIdResponse> {
        return this.documentService.getDocumentById({ ...dto, userId });
    }

    @Post('change-document-step-type')
    @ApiOperation({ summary: 'Change document step type' })
    async changeDocumentStepType(@Body() dto: ChangeDocumentStepTypeRequest): Promise<ApiSuccessResponse> {
        return this.documentService.changeDocumentStepType({ ...dto });
    }

    @Post('get-user-documents-with-filter')
    @ApiOperation({ summary: 'Get all user documents with filters' })
    async getUserDocuments(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: GetUserDocumentsRequest
    ): Promise<GetAllUserDocuments> {
        return this.documentService.getUserDocuments({ ...dto, userId });
    }

    @Post('create-custom-group')
    @ApiOperation({ summary: 'Create custom group' })
    async createCustomGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CreateCustomGroupRequest
    ): Promise<CreateDocumentCustomGroupResponse> {
        return this.documentService.createCustomGroup({ ...dto, userId });
    }

    @Post('delete-group')
    @ApiOperation({ summary: 'Delete group' })
    async deleteGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: DeleteGroupRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentService.deleteGroup({ ...dto, userId });
    }

    @Post('update-group')
    @ApiOperation({ summary: 'Update group' })
    async updateGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UpdateGroupRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentService.updateGroup({ ...dto, userId });
    }

    @Post('check-pass-code')
    @ApiOperation({ summary: 'Check pass code for truthness' })
    async checkPassCode(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CheckPassCodeRequest
    ): Promise<CheckPassCodeResponse> {
        return this.documentService.checkPassCode({ ...dto, userId });
    }

    @Post('update-settings')
    @ApiOperation({ summary: 'Update settings of document' })
    async updateDocumentSettings(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UpdateDocumentSettingsRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentService.updateDocumentSettings({ ...dto, userId });
    }

    @Post('add-document-to-group')
    @ApiOperation({ summary: 'Add document to group' })
    async addDocumentToGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: AddDocumentToGroupRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentService.addDocumentToGroup({ ...dto, userId });
    }

    @Post('change-bulk-statuses')
    @ApiOperation({ summary: 'Change bulk statuses of documents' })
    async changeStatusOfDocumentsBulk(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: ChangeStatusOfDocumentsBulkRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentService.changeStatusOfDocumentsBulk({ ...dto, userId });
    }

    @Post('add-group-to-favourite')
    @ApiOperation({ summary: 'Add group to favourite' })
    async addGroupToFavourite(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: AddGroupToFavouriteRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentService.addGroupToFavourite({ ...dto, userId });
    }

    @Get('all-document-groups')
    @ApiOperation({ summary: 'Get all user document groups' })
    async getAllUserDocumentGroups(@UserPassport() { id: userId }: SessionUserInfo): Promise<GetAllUserDocumentGroups> {
        return this.documentService.getAllUserDocumentGroups({ userId });
    }

    @Get('get-sent-documents')
    @ApiOperation({ summary: 'Get all shared documents' })
    async getSentDocuments(@UserPassport() { id: userId }: SessionUserInfo): Promise<GetAllUserDocuments> {
        return this.documentService.getSentDocuments({ userId });
    }

    @Get('get-received-documents')
    @ApiOperation({ summary: 'Get all received documents' })
    async getRecievedDocuments(@UserPassport() { id: userId }: SessionUserInfo): Promise<GetAllUserDocuments> {
        return this.documentService.getRecievedDocuments({ userId });
    }

    @Post('check-if-pass-code-exists')
    @ApiOperation({ summary: 'Check if document has a passCode' })
    async checkIfPassCodeExixsts(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: GetAllDocumentGroupsAndContactsRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentService.checkIfPassCodeExixsts({ ...dto, userId });
    }

    @Post('create-document-from-template')
    @ApiOperation({ summary: 'Create new document from templates' })
    async createDocumentFromTemplate(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CreateDocumentFromTemplateRequest
    ): Promise<UploadDocumentResponse> {
        return this.documentService.createDocumentFromTemplate({ ...dto, userId });
    }

    @Post('create-template-from-document')
    @ApiOperation({ summary: 'Create new template from document' })
    async createTemplateFromDocument(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: GetAllDocumentGroupsAndContactsRequest
    ): Promise<UploadDocumentResponse> {
        return this.documentService.createTemplateFromDocument({ ...dto, userId });
    }
}
