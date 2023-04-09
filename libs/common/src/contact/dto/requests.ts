import { ApiHideProperty, ApiProperty, PartialType } from '@nestjs/swagger';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { SignyContactStatusTypes } from '@signy/common';
import { PageInfoRequest } from '@signy/pagination';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserIdRequest } from '../../dto';
import { GenderTypes } from '../../user/enums';
import { SignyContactImportTypes, UserContactSearchTypes } from '../enums';

export class ImportContactsFromGoogleRequest extends UserIdRequest {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    userToken: string;
}

export class InternalContactCreationRequest extends UserIdRequest {
    email?: string;
    phone?: string;
}
export class GetUserContactsWithFilterRequest extends PageInfoRequest {
    @ApiHideProperty()
    userId: number;

    @ApiHideProperty()
    @IsOptional()
    companyId?: number;

    @ApiHideProperty()
    @IsOptional()
    branchId?: number;

    @ApiProperty({ required: false, enum: UserContactSearchTypes })
    @IsOptional()
    @IsEnum(UserContactSearchTypes)
    searchType?: UserContactSearchTypes;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    id?: number;

    @ApiProperty({ required: false, enum: SignyContactStatusTypes })
    @IsOptional()
    @IsEnum(SignyContactStatusTypes)
    status?: SignyContactStatusTypes;

    @ApiProperty({ required: false, enum: SignyContactImportTypes })
    @IsOptional()
    @IsEnum(SignyContactImportTypes)
    type?: SignyContactImportTypes;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    groupId?: number;
}

export class AddContactToFavouriteRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    contactId: number;
}

export class CreateNewContactRequest extends UserIdRequest {
    @ApiProperty({ required: false, type: 'string', format: 'binary' })
    @IsOptional()
    avatar?: Express.Multer.File;
    @ApiHideProperty()
    uploadedAvatar?: string;
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
    companyId?: number;
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
    branchId?: number;
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
    isFavourite?: boolean;
    @ApiProperty({ required: false, enum: GenderTypes })
    @Transform(({ value }) => {
        return value ? value : undefined;
    })
    @IsOptional()
    @IsEnum(GenderTypes)
    gender?: GenderTypes;
    @ApiProperty({ required: false, type: 'string', example: '1998-12-12' })
    @IsOptional()
    @IsISO8601()
    dob?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    color?: string;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsNumber()
    groupId?: number;
}

export class UpdateContactRequest extends PartialType(CreateNewContactRequest) {
    @ApiProperty({ required: true, type: 'number' })
    @Transform(({ value }) => {
        if (value) {
            return typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
            return undefined;
        }
    })
    @IsNumber()
    contactId: number;
}

export class ChangeStatusOfContactRequest extends AddContactToFavouriteRequest {
    @ApiProperty({ required: true, enum: SignyContactStatusTypes })
    @IsEnum(SignyContactStatusTypes)
    status: SignyContactStatusTypes;
}

export class FindContactRequest {
    email?: string;
    phone?: string;
    whatsapp?: string;
    telegram?: string;
    telegramNick?: string;
}

export class CreateContactCustomGroupRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    name: string;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    color: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    icon?: string;
    @ApiProperty({ required: false, type: ['number'] })
    @IsOptional()
    @IsArray()
    contactIds?: number[];
}

export class ContactGroupIdRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    groupId: number;
}

export class AddContactToGroupRequest extends ContactGroupIdRequest {
    @ApiProperty({ required: true, type: ['number'] })
    @IsArray()
    contactIds: number[];
}

export class DeleteMemberFromGroupRequest extends ContactGroupIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    memberId: number;
}

export class AddContactToDocumentGroupRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentGroupId: number;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    contactId: number;
}

export class DeleteContactFromDocumentGroupRequest extends AddContactToDocumentGroupRequest {}

export class UpdateContactGroupRequest extends ContactGroupIdRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    signOrderQueue?: number;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    name?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    color?: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    icon?: string;
}

export class ImportContactsFromCsvRequest extends UserIdRequest {
    @ApiProperty({ type: 'string', format: 'binary' })
    csv: Express.Multer.File;
}

export class ContactInfoRequest extends UserIdRequest {
    phone: number;
    first_name: string;
    last_name: string;
    email: string;
    whatsapp: number;
    telegram: number;
    telegram_nick: string;
    is_favourite: boolean;
    gender: string;
    avatar: string;
    color: string;
}

export class AddGroupToFavouriteRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    groupId: number;
}

export class ChangeStatusOfContactsBulkRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: ['number'] })
    @IsArray()
    contactIds: number[];

    @ApiProperty({ required: true, enum: SignyContactStatusTypes })
    @IsEnum(SignyContactStatusTypes)
    status: SignyContactStatusTypes;
}
