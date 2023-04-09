import { ApiProperty } from '@nestjs/swagger';
import { SignyCustomGroupsBaseInfo } from '../../contact/dto';
import { SignyContactImportTypes } from '../../contact/enums';
import { SignyContactStatusTypes } from '../../enums';
import { UploadedFileInfo, UploadedImageInfo } from '../../upload/dto';
import { GenderTypes } from '../../user/enums';
import { ReadStatusTypes, SignatoryRoleTypes, SignatureTypes, SigningStatusTypes } from '../enums';

export class SignatoryBaseInfo {
    @ApiProperty({ type: 'number' })
    id: number;
    @ApiProperty({ type: 'number' })
    contactId?: number;
    @ApiProperty({ type: 'number' })
    documentId: number;
    @ApiProperty({ type: 'number' })
    tempUserId?: number;
    @ApiProperty({ type: 'number' })
    signOrderQueue?: number | null;
    @ApiProperty({ type: 'string' })
    name?: string;
    @ApiProperty({ type: 'string' })
    email?: string;
    @ApiProperty({ type: 'string' })
    phone?: string;
    @ApiProperty({ type: 'string' })
    whatsapp?: string;
    @ApiProperty({ type: 'string' })
    telegram?: string;
    @ApiProperty({ type: 'string' })
    telegramNick?: string;
    @ApiProperty({ type: 'boolean' })
    is2faOn: boolean;
    @ApiProperty({ type: 'boolean' })
    is2faVerified: boolean;
    @ApiProperty({ type: 'boolean' })
    isPasswordOn: boolean;
    @ApiProperty({ enum: ReadStatusTypes })
    readStatus: ReadStatusTypes;
    @ApiProperty({ type: 'string' })
    passCode?: string;
    @ApiProperty({ type: 'boolean' })
    isSelfieWithIdOn: boolean;
    @ApiProperty({ type: () => [UploadedImageInfo] })
    drawnSignFile?: UploadedImageInfo[] | null;
    @ApiProperty({ type: 'string' })
    digitalSignature?: string;
    @ApiProperty({ type: () => UploadedFileInfo })
    sslFiles?: UploadedFileInfo | null;
    @ApiProperty({ type: 'boolean' })
    isVideoRecordOn?: boolean;
    @ApiProperty({ type: 'string' })
    videoPhrase?: string;
    @ApiProperty({ type: 'string' })
    nationalId?: string | null;
    @ApiProperty({ type: 'string' })
    color: string;
    @ApiProperty({ type: 'string' })
    dateOfSign?: Date | string;
    @ApiProperty({ type: 'boolean' })
    isVisible: boolean;
    @ApiProperty({ enum: SignatoryRoleTypes })
    roles: SignatoryRoleTypes;
    @ApiProperty({ enum: SignatureTypes })
    signatureType: SignatureTypes;
    @ApiProperty({ enum: SigningStatusTypes })
    signingStatus: SigningStatusTypes;
    @ApiProperty({ type: 'boolean' })
    isMe?: boolean;
}

export class SignyBaseInfo {
    @ApiProperty({ type: 'number' })
    id: number;
    @ApiProperty({ enum: SignyContactImportTypes })
    type: SignyContactImportTypes;
    @ApiProperty({ type: 'string' })
    fullName?: string;
    @ApiProperty({ type: 'string' })
    email?: string;
    @ApiProperty({ type: 'string' })
    phone?: string;
    @ApiProperty({ type: 'string' })
    whatsapp?: string;
    @ApiProperty({ type: 'string' })
    telegram?: string;
    @ApiProperty({ type: 'string' })
    telegramNick?: string;
    @ApiProperty({ type: 'boolean' })
    isFavourite: boolean;
    @ApiProperty({ type: 'string' })
    avatar?: string;
    @ApiProperty({ enum: GenderTypes })
    gender?: GenderTypes;
    @ApiProperty({ type: 'string' })
    dob?: string;
    @ApiProperty({ type: 'string' })
    color: string;
    @ApiProperty({ required: false, type: () => SignatoryBaseInfo })
    signatory?: SignatoryBaseInfo;
    @ApiProperty({ required: false, type: () => [SignyCustomGroupsBaseInfo] })
    groups?: SignyCustomGroupsBaseInfo[];
    @ApiProperty({ required: true, enum: SignyContactStatusTypes })
    status: SignyContactStatusTypes;
}
