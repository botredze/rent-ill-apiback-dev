import { ApiProperty } from '@nestjs/swagger';
import { SmsTypes } from '@signy/sms';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { UploadedFileInfo, UploadedImageInfo } from '../../upload/dto';

export class EmailTemplateBaseInfo {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    template: string;
    @ApiProperty({ required: false, type: () => [UploadedFileInfo] })
    files?: UploadedFileInfo[] | null;
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    companyLogo?: UploadedImageInfo | null;
}

export class SmsBaseInfo {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    message: string;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    originator: string;
    @ApiProperty({ required: true, enum: [SmsTypes] })
    @IsEnum(SmsTypes)
    type: SmsTypes;
}
