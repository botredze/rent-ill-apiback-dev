import { Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { JwtAuthGuard } from '../auth/guards';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { uploadConstants } from '@signy/s3';
import { UserPassport } from '../auth/decorators';
import { SessionUserInfo } from '@signy/auth';
import {
    CreateInputForPdfRequest,
    CreateInputForPdfResponse,
    UpdateInputForPdfRequest,
    UpdateInputForPdfResponse,
} from '@signy/document-input';
import 'multer';
import { DocumentInputService } from './document-input.service';
import {
    GetDocumentInputsWithSearchRequest,
    GetDocumentInputsWithSearchResponse,
    RemoveDocumentInputRequest,
} from '@signy/document-input';
import {
    AddContactToAllInputsRequest,
    GetAllDocumentGroupsAndContactsRequest,
    RemoveContactFromInputRequest,
} from '@signy/document';

@ApiTags('Document-input')
@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('document-input')
@UseGuards(JwtAuthGuard)
export class DocumentInputController {
    constructor(private readonly documentInputService: DocumentInputService) {}
    @Post('create-input-for-pdf')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'attachments' }], {
            limits: { fileSize: uploadConstants.maxFileSize, files: uploadConstants.maxFiles },
        })
    )
    @ApiOperation({ summary: 'Create input for PDF' })
    async createInputForPdf(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: CreateInputForPdfRequest,
        @UploadedFiles() attachments?: { attachments: Express.Multer.File[] }
    ): Promise<CreateInputForPdfResponse> {
        return await this.documentInputService.createInputForPdf(user, {
            ...dto,
            attachments: attachments?.attachments,
        });
    }

    @Post('update-input-for-pdf')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'attachments' }], {
            limits: { fileSize: uploadConstants.maxFileSize, files: uploadConstants.maxFiles },
        })
    )
    @ApiOperation({ summary: 'Update input for PDF' })
    async updateInputForPdf(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: UpdateInputForPdfRequest,
        @UploadedFiles() attachments?: { attachments: Express.Multer.File[] }
    ): Promise<UpdateInputForPdfResponse> {
        return await this.documentInputService.updateInputForPdf(user, {
            ...dto,
            attachments: attachments?.attachments,
        });
    }

    @Post('get-inputs-with-filter')
    @ApiOperation({ summary: 'Get inputs with filter' })
    async getInputById(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: GetDocumentInputsWithSearchRequest
    ): Promise<GetDocumentInputsWithSearchResponse> {
        return this.documentInputService.getDocumentInputs({ ...dto, userId: user.id });
    }

    @Post('remove-input')
    @ApiOperation({ summary: 'Remove input' })
    async removeDocumentInput(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: RemoveDocumentInputRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentInputService.removeDocumentInput({ ...dto, userId: user.id });
    }

    @Post('merge-all-recipients')
    @ApiOperation({ summary: 'Add all recipients to all inputs' })
    async mergeAllContactsToInputs(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: GetAllDocumentGroupsAndContactsRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentInputService.mergeAllContactsToInputs({ ...dto, userId: user.id });
    }

    @Post('add-recipient-to-all-inputs')
    @ApiOperation({ summary: 'Add recipient to all inputs' })
    async addContactToAllInputs(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: AddContactToAllInputsRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentInputService.addContactToAllInputs({ ...dto, userId: user.id });
    }

    @Post('remove-recipient')
    @ApiOperation({ summary: 'Remove recipient from all inputs or specific input' })
    async removeContactFromInput(
        @UserPassport() user: SessionUserInfo,
        @Body() dto: RemoveContactFromInputRequest
    ): Promise<ApiSuccessResponse> {
        return this.documentInputService.removeContactFromInput({ ...dto, userId: user.id });
    }
}
