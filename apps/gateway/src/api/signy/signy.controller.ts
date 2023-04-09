import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SignyService } from './signy.service';
import { ApiBadRequestResponse, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from '@signy/exceptions';
import { JwtAuthGuard } from '../auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { pdfFileFilter, uploadConstants } from '@signy/s3';
import { UserPassport } from '../auth/decorators';
import { SessionUserInfo } from '@signy/auth';
import { PdfRequest, SignPdfResponse } from '@signy/signy';
import 'multer';
@ApiTags('Signy')
@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('signy')
@UseGuards(JwtAuthGuard)
export class SignyController {
    constructor(private readonly signyService: SignyService) {}
    @Post('sign-pdf')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('pdf', { limits: { fileSize: uploadConstants.maxFileSize }, fileFilter: pdfFileFilter })
    )
    @ApiOperation({ summary: 'Sign Pdf file' })
    async signPdf(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: PdfRequest,
        @UploadedFile() pdf: Express.Multer.File
    ): Promise<SignPdfResponse> {
        return await this.signyService.signPdf({ ...dto, pdf, userId });
    }
}
