import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { SignyCustomGroupsBaseInfo } from '../../contact/dto';
import { InputHistoryBaseInfo } from '../../signatory/dto';
import { SignyBaseInfo } from '../../signy/dto';
import { UploadedFileInfo } from '../../upload/dto';
import { SignyInputDateFormatTypes, SignyInputFloatTypes, SignyInputTypes, SignyInputValidationTypes } from '../enums';

export class SignyInputOptionListInfo {
    id: number;
    value: string;
}

export class SignyDocumentInputSettingsBaseInfo {
    @ApiProperty({ required: true, type: 'number' })
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value;
    })
    @IsNumber()
    @IsNotEmpty()
    id: number;
    @ApiProperty({ required: false, type: ['string'], format: 'binary' })
    @Transform(({ value }) => {
        const parsed = JSON.parse(value.match(/^\[*\]$/) ? value : `[${value}]`);
        return value?.length && Array.isArray(parsed) ? parsed : undefined;
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    attachments?: Express.Multer.File[];
    @ApiHideProperty()
    uploadedAttachments?: UploadedFileInfo[];
    @ApiProperty({ required: false, type: 'number' })
    @IsNotEmpty()
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsNumber()
    documentId: number;
    @ApiProperty({ required: true, enum: SignyInputTypes })
    @IsNotEmpty()
    @IsEnum(SignyInputTypes)
    type: SignyInputTypes;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isRequiredOn?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isSelectCheckmarkOn?: boolean;
    @ApiProperty({ required: false, type: ['number'] })
    @Transform(({ value }) => {
        const parsed = JSON.parse(value.match(/^\[*\]$/) ? value : `[${value}]`);
        return value?.length && Array.isArray(parsed) ? parsed : undefined;
    })
    @IsOptional()
    @IsArray()
    contactRecipients?: number[];
    @ApiProperty({ required: false, type: ['number'] })
    @Transform(({ value }) => {
        const parsed = JSON.parse(value.match(/^\[*\]$/) ? value : `[${value}]`);
        return value?.length && Array.isArray(parsed) ? parsed : undefined;
    })
    @IsOptional()
    @IsArray()
    groupRecipients?: number[];
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    placeholder?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    hint?: string;
    @ApiProperty({ required: false, type: ['string'] })
    @Transform(({ value }) => {
        return JSON.parse(value.match(/^\[*\]$/) ? value : `[${value}]`) || undefined;
    })
    @IsOptional()
    @IsArray()
    signatureColor?: string[];
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    fieldId?: string;
    @ApiProperty({ required: false, enum: SignyInputValidationTypes })
    @Transform(({ value }) => {
        return value ? value : undefined;
    })
    @IsOptional()
    @IsEnum(SignyInputValidationTypes)
    validationType?: SignyInputValidationTypes;
    @ApiProperty({ required: false, type: 'number' })
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsNumber()
    validationMin?: number;
    @ApiProperty({ required: false, type: 'number' })
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsNumber()
    validationMax?: number;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    textFont?: string;
    @ApiProperty({ required: false, type: 'number' })
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsNumber()
    textSize?: number;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    textColor?: string;
    @ApiProperty({ required: false, type: 'number' })
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsNumber()
    textDistance?: number;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isUnderlineOn?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isItalicOn?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isBoldOn?: boolean;
    @ApiProperty({ required: false, enum: SignyInputFloatTypes })
    @Transform(({ value }) => {
        return value ? value : undefined;
    })
    @IsOptional()
    @IsEnum(SignyInputFloatTypes)
    float?: SignyInputFloatTypes;
    @ApiProperty({ required: false, type: () => [SignyInputOptionListInfo] })
    @Transform(({ value }) => {
        const parsed = JSON.parse(value.match(/^\[*\]$/) ? value : `[${value}]`);
        return value?.length && Array.isArray(parsed) ? parsed : undefined;
    })
    @IsOptional()
    @IsArray()
    optionsListData?: SignyInputOptionListInfo[];
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isShowLabelsOn?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isTime?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isDate?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isDuration?: boolean;
    @ApiProperty({ required: false, enum: SignyInputDateFormatTypes })
    @Transform(({ value }) => {
        return value ? value : undefined;
    })
    @IsOptional()
    @IsEnum(SignyInputDateFormatTypes)
    dateFormat: SignyInputDateFormatTypes;
    @ApiProperty({ required: false, type: 'number' })
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsNumber()
    rangeCount?: number;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isRangeZero?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isRangeOne?: boolean;
    @ApiProperty({ required: false, type: 'number' })
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsNumber()
    inputOrder?: number;
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
}

export class SignyDocumentInputSettingsExtraBaseInfo extends SignyDocumentInputSettingsBaseInfo {
    @ApiProperty({ required: true, type: () => [UploadedFileInfo] })
    @Type(() => UploadedFileInfo)
    allAttachments?: UploadedFileInfo[];

    @ApiProperty({ required: false, type: 'boolean' })
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        } else {
            return undefined;
        }
    })
    @IsOptional()
    @IsBoolean()
    isEditAvailable?: boolean;
    @ApiProperty({ type: 'object' })
    extraData?: object;
    @ApiProperty({ required: false, type: () => [SignyBaseInfo] })
    @Type(() => SignyBaseInfo)
    contacts?: SignyBaseInfo[];
    @ApiProperty({ required: false, type: () => [SignyCustomGroupsBaseInfo] })
    @Type(() => SignyCustomGroupsBaseInfo)
    groups?: SignyCustomGroupsBaseInfo[];
    @ApiProperty({ required: false, type: () => InputHistoryBaseInfo })
    @Type(() => InputHistoryBaseInfo)
    history?: InputHistoryBaseInfo;
}
