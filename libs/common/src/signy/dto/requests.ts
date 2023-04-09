import { ApiProperty } from '@nestjs/swagger';
import { UserIdRequest } from '../../dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PdfRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value;
    })
    @IsNumber()
    documentId: number;
    @ApiProperty({ type: 'string', format: 'binary' })
    pdf: Express.Multer.File;
    @ApiProperty({ required: true, type: 'number' })
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value;
    })
    @IsNumber()
    signatoryId: number;
}

export class SignPdfRequest extends UserIdRequest {
    pdfUrl: string;
    pdfKey?: string;
    pdfName?: string;
    mimetype: string;
    documentId: number;
    signatoryId: number;
    isLastSignatory: boolean;
    isDriveSyncOn: boolean;
    driveSignedFilePath?: string;
}
export class CheckIfSignatureExistsRequest extends UserIdRequest {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    pdfUrl: string;
}
