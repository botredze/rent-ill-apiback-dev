import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserIdRequest } from '../../dto';
import { UploadedFileInfo, UploadedImageInfo } from '../../upload/dto';

export class GetEmailTemplateWithPermissionRequest {
    @ApiHideProperty()
    userId?: number;
    @ApiProperty({ required: true, nullable: false, type: 'number' })
    @IsNumber()
    emailTemplateId: number;
}

export class GetSmsTemplateWithPermissionRequest {
    @ApiHideProperty()
    userId?: number;
    @ApiProperty({ required: true, nullable: false, type: 'number' })
    @IsNumber()
    smsTemplateId: number;
}

export class CreateEmailTemplateRequest extends UserIdRequest {
    @ApiProperty({ required: false, nullable: true, type: 'number' })
    @IsOptional()
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value === null ? null : value;
    })
    emailTemplateId?: number;
    @ApiProperty({ required: true, type: 'string' })
    @Transform(({ value }) => {
        return decodeURIComponent(value);
    })
    @IsString()
    template: string;
}

export class CreateSmsTemplateRequest extends UserIdRequest {
    @ApiProperty({ required: false, nullable: true, type: 'number' })
    @IsOptional()
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value === null ? null : value;
    })
    smsTemplateId?: number;
    @ApiProperty({ required: true, type: 'string' })
    @Transform(({ value }) => {
        return decodeURIComponent(value);
    })
    @IsString()
    message: string;
}

export class UploadTemplateFilesToS3Request extends UserIdRequest {
    @ApiProperty({ required: false, nullable: true, type: 'number' })
    @IsOptional()
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value === null ? null : value;
    })
    emailTemplateId?: number;
    @ApiProperty({ required: true, type: ['string'], format: 'binary' })
    @Transform(({ value }) => {
        const parsed = JSON.parse(value.match(/^\[*\]$/) ? value : `[${value}]`);
        return value?.length && Array.isArray(parsed) ? parsed : undefined;
    })
    @ValidateNested({ each: true })
    files?: Express.Multer.File[];

    @ApiHideProperty()
    uploadedFiles: UploadedFileInfo[];
}

export class UploadSignyCompanyLogoRequest extends UserIdRequest {
    @ApiProperty({ required: true, nullable: false, type: 'number' })
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value;
    })
    @IsNumber()
    emailTemplateId: number;

    @ApiProperty({ required: true, type: 'string', format: 'binary' })
    logo?: Express.Multer.File;

    @ApiHideProperty()
    uploadedLogo: UploadedImageInfo;
}

export class SignySendEmailRequest extends UserIdRequest {
    @ApiProperty({ required: true, nullable: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    emailTemplateId: number;
    @ApiProperty({ required: true, type: ['number'] })
    @IsArray()
    signatoriesIds: number[];
}

export class SignySendSmsRequest extends UserIdRequest {
    @ApiProperty({ required: true, nullable: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    smsTemplateId: number;
    @ApiProperty({ required: true, type: ['number'] })
    @IsArray()
    signatoriesIds: number[];
}
