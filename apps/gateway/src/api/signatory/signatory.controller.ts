import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SessionUserInfo } from '@signy/auth';
import { DocumentIdRequest } from '@signy/document';
import {
    AddSignatoryInputHistoryRequest,
    AddSignatoryRequest,
    CreateSignatoryRequest,
    DeleteSignatoryRequest,
    DeleteSignatureRequest,
    GetDocumentInputHistoryResponse,
    IsPassCodeExistsRequest,
    SearchSignatoriesWithFilterRequest,
    SearchSignatoryWithFilterResponse,
    SignOrderBulkUpdateRequest,
    UpdateSignatoryRequest,
    UploadSignatureRequest,
    UploadSignatureResponse,
} from '@signy/signatory';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { imageFileFilter, uploadConstants } from '@signy/s3';
import { UserPassport } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { SignatoryService } from './signatory.service';

@ApiTags('Signatory')
@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('signatory')
@UseGuards(JwtAuthGuard)
export class SignatoryController {
    constructor(private readonly signatoryService: SignatoryService) {}
    @Post('create-signatory')
    @ApiOperation({ summary: 'Create signatory' })
    async createSignatory(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: CreateSignatoryRequest
    ): Promise<ApiSuccessResponse> {
        return this.signatoryService.createSignatory({ ...dto, userId: user.id });
    }

    @Post('update-signatory')
    @ApiOperation({ summary: 'Update signatory' })
    async updateSignatory(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: UpdateSignatoryRequest
    ): Promise<ApiSuccessResponse> {
        return this.signatoryService.updateSignatory({ ...dto, userId: user.id });
    }

    @Post('add-document-signatory')
    @ApiOperation({ summary: 'Add signatory to the document' })
    async addSignatoryToDocument(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: AddSignatoryRequest
    ): Promise<ApiSuccessResponse> {
        return this.signatoryService.addSignatoryToDocument({ ...dto, userId: user.id });
    }

    @Post('search-with-filter')
    @ApiOperation({ summary: 'Search signatories with filter and pagination' })
    async searchSignatoriesWithFilter(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: SearchSignatoriesWithFilterRequest
    ): Promise<SearchSignatoryWithFilterResponse> {
        return this.signatoryService.searchSignatoriesWithFilter({ ...dto, userId: user.id });
    }

    @Post('add-input-history')
    @ApiOperation({ summary: 'Add input history for signatory' })
    async addInputHistory(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: AddSignatoryInputHistoryRequest
    ): Promise<ApiSuccessResponse> {
        return this.signatoryService.addInputHistory({ ...dto, userId: user.id });
    }

    @Post('is-pass-code-exists')
    @ApiOperation({ summary: 'Check if signatory needs to provide passCode' })
    async isPassCodeExists(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: IsPassCodeExistsRequest
    ): Promise<boolean> {
        return this.signatoryService.isPassCodeExists({ ...dto });
    }

    @Post('get-document-input-history')
    @ApiOperation({ summary: 'Get document input history' })
    async getDocumentInputHistory(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: DocumentIdRequest
    ): Promise<GetDocumentInputHistoryResponse> {
        return this.signatoryService.getDocumentInputHistory({ ...dto });
    }

    @Post('delete-signatory')
    @ApiOperation({ summary: 'Delete signatory' })
    async deleteSignatory(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: DeleteSignatoryRequest
    ): Promise<ApiSuccessResponse> {
        return this.signatoryService.deleteSignatory({ ...dto, userId });
    }

    @Post('sign-order-bulk-update')
    @ApiOperation({ summary: 'Sign order bulk update' })
    async signOrderBulkUpdate(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SignOrderBulkUpdateRequest
    ): Promise<ApiSuccessResponse> {
        return this.signatoryService.signOrderBulkUpdate({ ...dto, userId });
    }

    @Post('upload-signature')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('signature', { limits: { fileSize: uploadConstants.maxFileSize }, fileFilter: imageFileFilter })
    )
    @ApiOperation({ summary: 'Upload signature' })
    async uploadSignature(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UploadSignatureRequest,
        @UploadedFile() signature: Express.Multer.File
    ): Promise<UploadSignatureResponse> {
        return this.signatoryService.uploadSignature({ ...dto, signature, userId });
    }

    @Post('delete-signature')
    @ApiOperation({ summary: 'Delete specific signature or all signatures' })
    async deleteSignature(@Body() dto: DeleteSignatureRequest): Promise<ApiSuccessResponse> {
        return this.signatoryService.deleteSignature({ ...dto });
    }
}
