import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SessionUserInfo } from '@signy/auth';
import {
    SignyGenerateShareResponse,
    SignyGenerateShareRequest,
    SignyShareDocumentRequest,
    SignyScheduleShareRequest,
    GenerateShareLinkForSignatoryResponse,
    GenerateShareLinkForSignatoryRequest,
} from '@signy/signy-share-document';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { UserPassport } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { SignyShareService } from './signy.share.service';

@ApiTags('Signy-share')
@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('signy-share')
@UseGuards(JwtAuthGuard)
export class SignyShareController {
    constructor(private readonly signyShareService: SignyShareService) {}

    @Post('generate-share-links')
    @ApiOperation({ summary: 'Generate share links (url, Qr Code)' })
    async generateShare(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SignyGenerateShareRequest
    ): Promise<SignyGenerateShareResponse> {
        return this.signyShareService.generateShare({ ...dto, userId });
    }

    @Post('generate-share-link-for-signatory')
    @ApiOperation({ summary: 'Generate share link individually for signatory' })
    async generateShareLinkForSignatory(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: GenerateShareLinkForSignatoryRequest
    ): Promise<GenerateShareLinkForSignatoryResponse> {
        return this.signyShareService.generateShareLinkForSignatory({ ...dto, userId });
    }

    @Post('share-document')
    @ApiOperation({ summary: 'Share document' })
    async shareDocument(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SignyShareDocumentRequest
    ): Promise<ApiSuccessResponse> {
        return this.signyShareService.shareDocument({ ...dto, userId });
    }

    @Post('schedule-share')
    @ApiOperation({ summary: 'Schedule share' })
    async scheduleShare(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SignyScheduleShareRequest
    ): Promise<ApiSuccessResponse> {
        return this.signyShareService.scheduleShare({ ...dto, userId });
    }
}
