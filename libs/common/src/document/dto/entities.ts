import { ApiProperty } from '@nestjs/swagger';
import { UploadedFileInfo, UploadedImageInfo } from '../../upload/dto';
import { SignyDocumentStepTypes } from '../enums';
import { InputLocationTypes, NotificationLanguageTypes, SignyDocumentStatusTypes, ThemeTypes } from '../../enums';
import { SignatoryBaseInfo } from '../../signy/dto';
import { ReadStatusTypes, SigningStatusTypes } from '../../signy/enums';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SignyDocumentSettingsInfo {
    @ApiProperty({ required: false, type: 'string' })
    expirationDate?: string;
    @ApiProperty({ required: false, type: 'string' })
    remindersSchedule?: string;
    @ApiProperty({ required: true, type: 'boolean' })
    notifyMe: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    isRequiredForEveryone: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    isSignOrderExists: boolean;
    @ApiProperty({ required: true, enum: NotificationLanguageTypes })
    @IsEnum(NotificationLanguageTypes)
    notificationLang: NotificationLanguageTypes;
    @ApiProperty({ required: true, type: 'boolean' })
    isShowSignatureOn: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    isVerifySignatureOn: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    isBrandingExists: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    isSameDocumentSign: boolean;
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    brandLogo?: UploadedImageInfo | null;
    @ApiProperty({ required: true, type: 'boolean' })
    horizontalStack: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    isOneQuestionOnTheScreen: boolean;
    @ApiProperty({ required: false, type: 'string' })
    backgroundColor?: string;
    @ApiProperty({ required: false, type: 'number' })
    brightnessPercentage?: number;
    @ApiProperty({ required: false, type: 'number' })
    blurPercentage?: number;
    @ApiProperty({ required: false, type: 'number' })
    stepLevel?: number;
    @ApiProperty({ required: true, type: 'boolean' })
    isAllowReturnToPreviousScreen: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    sendProgressToMembers: boolean;
    @ApiProperty({ required: true, enum: InputLocationTypes })
    @IsEnum(InputLocationTypes)
    inputLocation: InputLocationTypes;
    @ApiProperty({ required: true, enum: ThemeTypes })
    theme: ThemeTypes;
    @ApiProperty({ required: true, type: 'boolean' })
    isPassCodeExists: boolean;
    @ApiProperty({ required: false, type: 'string' })
    passCode?: string;
    @ApiProperty({ required: true, type: 'boolean' })
    isPrivate: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    isDriveSyncOn: boolean;
    @ApiProperty({ required: false, type: 'string' })
    driveOriginalFilePath?: string;
    @ApiProperty({ required: false, type: 'string' })
    driveSignedFilePath?: string;
    @ApiProperty({ required: true, type: 'boolean' })
    isEditable: boolean;
}

export class SignyDocumentBaseInfo {
    @ApiProperty({ type: 'number' })
    id: number;
    @ApiProperty({ type: 'boolean' })
    isTemplate: boolean;
    @ApiProperty({ type: 'boolean' })
    isForm: boolean;
    @ApiProperty({ enum: SignyDocumentStepTypes })
    stepType: SignyDocumentStepTypes;
    @ApiProperty({ type: () => UploadedFileInfo })
    originalFile: UploadedFileInfo;
    @ApiProperty({ type: () => [UploadedFileInfo] })
    file?: UploadedFileInfo[];
    @ApiProperty({ type: 'string' })
    name?: string;
    @ApiProperty({ type: 'number' })
    size?: number;
    @ApiProperty({ type: 'string' })
    uploadDate: Date | string;
    @ApiProperty({ type: 'object' })
    extraData?: object;
    @ApiProperty({ type: () => [UploadedFileInfo] })
    attachments?: UploadedFileInfo[] | null;
    @ApiProperty({ type: 'number' })
    stepLevel: number;
    @ApiProperty({ type: () => SignyDocumentSettingsInfo })
    settings: SignyDocumentSettingsInfo;
    @ApiProperty({ required: false, type: () => [SignyDocumentCustomGroupsBaseInfo] })
    @Type(() => SignyDocumentCustomGroupsBaseInfo)
    groups?: SignyDocumentCustomGroupsBaseInfo[];
    @ApiProperty({ enum: SignyDocumentStatusTypes })
    status: SignyDocumentStatusTypes;
}

export class SignyDocumentExtraInfo extends SignyDocumentBaseInfo {
    @ApiProperty({ required: false, enum: SigningStatusTypes })
    @IsEnum(SigningStatusTypes)
    documentSigningStatus: SigningStatusTypes;
    @ApiProperty({ required: false, enum: ReadStatusTypes })
    @IsEnum(ReadStatusTypes)
    documentVieweStatus: ReadStatusTypes;
    @ApiProperty({ type: () => [SignatoryBaseInfo] })
    @Type(() => SignatoryBaseInfo)
    signatories?: SignatoryBaseInfo[];
}

export class SignyDocumentCustomGroupsBaseInfo {
    @ApiProperty({ type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ type: 'string' })
    @IsString()
    title: string;
    @ApiProperty({ type: 'string' })
    @IsString()
    color: string;
    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    isFavourite: boolean;
}
