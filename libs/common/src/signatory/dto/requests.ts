import { ApiHideProperty, ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageInfoRequest } from '@signy/pagination';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SignyInputOptionListInfo } from '../../document-input/dto';
import { DocumentIdRequest } from '../../document/dto';
import { UserIdRequest } from '../../dto';
import { ReadStatusTypes, SignatoryRoleTypes, SignatureTypes, SigningStatusTypes } from '../../signy/enums';
import { UploadedFileInfo, UploadedImageInfo } from '../../upload/dto';
import { SignatoriesSearchTypes } from '../enums';

export class AddSignatoryRequest extends DocumentIdRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    inputId?: number;
    @ApiProperty({ required: false, type: ['number'] })
    @IsOptional()
    @IsArray()
    userIds?: number[];
}

export class CreateSignatoryRequest extends OmitType(DocumentIdRequest, ['signatoryId']) {
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    contactId?: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    groupId?: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    signOrderQueue?: number | null;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    existingUserId?: number;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    firstName?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    lastName?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    email?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    phone?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    whatsapp?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    telegram?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    telegramNick?: string;
    @ApiProperty({ required: false, enum: SignatoryRoleTypes })
    @IsOptional()
    @IsEnum(SignatoryRoleTypes)
    role?: SignatoryRoleTypes;
    @ApiProperty({ required: false, type: 'boolean', default: false })
    @IsOptional()
    @IsBoolean()
    is2faOn?: boolean;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    passCode?: string;
    @ApiProperty({ required: false, type: 'boolean', default: false })
    @IsOptional()
    @IsBoolean()
    isSelfieWithIdOn?: boolean;
    @ApiProperty({ required: false, type: 'boolean', default: false })
    @IsOptional()
    @IsBoolean()
    isVideoRecordOn?: boolean;
    @ApiProperty({ required: false, enum: SignatureTypes })
    @IsOptional()
    @IsEnum(SignatureTypes)
    signatureType?: SignatureTypes;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    color?: string;
    @ApiHideProperty()
    ownerId?: number;
}

export class UpdateSignatoryRequest extends PartialType(CreateSignatoryRequest) {
    @ApiProperty({ required: false, type: 'number' })
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value;
    })
    @IsOptional()
    @IsNumber()
    signatoryId?: number;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    nationalId?: string;

    @ApiProperty({ required: false, type: 'boolean', default: true })
    @IsOptional()
    @IsBoolean()
    isVisible: boolean;

    @ApiProperty({ required: false, enum: SigningStatusTypes })
    @IsOptional()
    @IsEnum(SigningStatusTypes)
    signingStatus: SigningStatusTypes;

    @ApiProperty({ required: false, enum: ReadStatusTypes })
    @IsOptional()
    @IsEnum(ReadStatusTypes)
    readStatus: ReadStatusTypes;
}

export class SearchSignatoriesWithFilterRequest extends PageInfoRequest {
    @ApiHideProperty()
    userId: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    id?: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    documentId?: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    contactId?: number;
    @ApiProperty({ required: false, enum: SignatureTypes })
    @IsOptional()
    @IsEnum(SignatureTypes)
    signatureType?: SignatureTypes;
    @ApiProperty({ required: false, enum: SigningStatusTypes })
    @IsOptional()
    @IsEnum(SigningStatusTypes)
    signingStatus?: SigningStatusTypes;
    @ApiProperty({ required: false, enum: SignatoryRoleTypes })
    @IsOptional()
    @IsEnum(SignatoryRoleTypes)
    roles?: SignatoryRoleTypes;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    search?: string;
    @ApiProperty({ required: false, enum: SignatoriesSearchTypes })
    @IsOptional()
    @IsEnum(SignatoriesSearchTypes)
    searchType?: SignatoriesSearchTypes;
}

export class AddSignatoryInputHistoryRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    inputSettingsId: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    signatoryId?: number;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    value?: string;
    @ApiProperty({ required: false, type: () => [SignyInputOptionListInfo] })
    @IsOptional()
    valueJson?: SignyInputOptionListInfo[];
    @ApiProperty({ required: false, type: () => [UploadedFileInfo] })
    @IsOptional()
    attachments?: UploadedFileInfo[];
}

export class IsPassCodeExistsRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    signatoryId?: number;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    phone?: string;
}

export class DeleteSignatoryRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    signatoryId: number;
}

export class SignOrderBulkUpdateRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    signOrderQueue: number;
}

export class UploadSignatureRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'string', format: 'binary' })
    signature: Express.Multer.File;

    @ApiProperty({ required: true, type: 'number' })
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value;
    })
    @IsNumber()
    signatoryId: number;
}

export class InsertSignatureRequest {
    signatoryId: number;
    uploadedSignature: UploadedImageInfo;
}

export class DeleteSignatureRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    signatoryId: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    signatureIndex?: number;
}
