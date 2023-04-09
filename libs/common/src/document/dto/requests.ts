import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { SignyDocumentStepTypes } from '../enums';
import { Transform, Type } from 'class-transformer';
import { SignyDocumentStatusTypes } from '../../enums';
import { UserIdRequest } from '../../dto';
import 'multer';
import { PageInfoRequest } from '@signy/pagination';
import { UploadedFileInfo } from '../../upload/dto';
import { SignyDocumentSettingsInfo } from './entities';
import { SigningStatusTypes } from '../../signy/enums';

export class InsertDocumentRequest extends UserIdRequest {
    name?: string;
    size?: number;
    uploadDate?: string;
    extraData?: object;
    pdfUrl: string;
    pdfKey?: string;
    mimetype: string;
    isTemplate?: boolean;
}

export class UploadDocumentRequest extends UserIdRequest {
    @ApiProperty({ type: 'string', format: 'binary' })
    pdf: Express.Multer.File;
    @ApiProperty({ required: false, type: 'object' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value) {
            return JSON.parse(value);
        }
        return undefined;
    })
    @IsObject()
    extraData?: object;
    @ApiProperty({ required: false, type: 'boolean', default: false })
    @IsOptional()
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsBoolean()
    isTemplate?: boolean;
}
export class DocumentIdRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value;
    })
    @IsNumber()
    documentId: number;

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
    email?: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    passCode?: string;
}

export class ChangeStatusOfDocumentRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
    @ApiProperty({ required: true, enum: SignyDocumentStatusTypes })
    @IsEnum(SignyDocumentStatusTypes)
    status: SignyDocumentStatusTypes;
}

export class ChangeDocumentStepTypeRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
    @ApiProperty({ required: true, enum: SignyDocumentStepTypes })
    @IsEnum(SignyDocumentStepTypes)
    stepType: SignyDocumentStepTypes;
}

export class GetUserDocumentsRequest extends PageInfoRequest {
    userId: number;
    @ApiProperty({ required: false, enum: SignyDocumentStatusTypes })
    @IsOptional()
    @IsEnum(SignyDocumentStatusTypes)
    status?: SignyDocumentStatusTypes;
    @ApiProperty({ required: false, enum: SigningStatusTypes })
    @IsOptional()
    @Transform(({ value }) => {
        return value ? value : undefined;
    })
    @IsEnum(SigningStatusTypes)
    signingStatus?: SigningStatusTypes;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    groupId?: number;
    @ApiProperty({ required: false, type: 'boolean', default: false })
    @IsOptional()
    @IsBoolean()
    isTemplate?: boolean;
}

export class UpdateDocumentRequest extends DocumentIdRequest {}

export class GetDocumentWithPermissionRequest extends UserIdRequest {
    documentId: number;
}

export class UpdateDocumentFilesRequest {
    documentId: number;
    files: UploadedFileInfo[];
}

export class CreateCustomGroupRequest extends UserIdRequest {
    @ApiProperty({ required: false, type: ['number'] })
    @IsOptional()
    @IsArray()
    documentIds?: number[];
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    title: string;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    color: string;
}
export class GroupIdRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    groupId: number;
}
export class DeleteGroupRequest extends GroupIdRequest {}

export class UpdateGroupRequest extends GroupIdRequest {
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    title?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    color?: string;
}

export class CheckPassCodeRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    passCode: string;
}

export class UpdateDocumentSettingsRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
    @ApiProperty({ required: true, type: () => SignyDocumentSettingsInfo })
    @IsNotEmpty()
    @Type(() => SignyDocumentSettingsInfo)
    settings: SignyDocumentSettingsInfo;
}

export class GetAllDocumentGroupsAndContactsRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
}

export class AddContactToAllInputsRequest extends GetAllDocumentGroupsAndContactsRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    contactId?: number;
}

export class RemoveContactFromInputRequest extends AddContactToAllInputsRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    inputId?: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    groupId?: number;
}

export class AddDocumentToGroupRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    groupId: number;
}

export class ChangeStatusOfDocumentsBulkRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: ['number'] })
    @IsArray()
    documentIds: number[];
    @ApiProperty({ required: true, enum: SignyDocumentStatusTypes })
    @IsEnum(SignyDocumentStatusTypes)
    status: SignyDocumentStatusTypes;
}

export class AddGroupToFavouriteRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    groupId: number;
}

export class GetSentDocumentsRequest extends PageInfoRequest {
    userId: number;
}

export class CreateDocumentFromTemplateRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    templateId: number;
    @ApiProperty({ required: false, type: 'object' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value) {
            return JSON.parse(value);
        }
        return undefined;
    })
    @IsObject()
    extraData?: object;
    @ApiProperty({ required: false, type: 'boolean', default: false })
    @IsOptional()
    @IsBoolean()
    isTemplate?: boolean;
}
