import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SignyDocumentExtraInfo } from '../../document/dto';
import { UploadedFileInfo } from '../../upload/dto';

export class SignPdfResponse {
    @ApiProperty({ type: 'string' })
    signedPdf: UploadedFileInfo;
    @ApiProperty({ required: false, type: () => SignyDocumentExtraInfo })
    @Type(() => SignyDocumentExtraInfo)
    documentBaseInfo?: SignyDocumentExtraInfo | null;
}
