import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EditAddressRequest } from '../../address';
import { AddressBaseInfo, CoordsInfo, UserIdRequest } from '../../dto';
import { UploadedImageInfo } from '../../upload/dto';
import { CompanyTypes } from '../enums';
import { Express } from 'express';
import 'multer';
import { GenderTypes } from '../../user/enums';
export class CompanyIdRequest {
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNotEmpty()
    companyId: number;
}

export class CreateCompanyRequest extends UserIdRequest {
    @ApiProperty({ required: true, example: 'Exmp. Name', type: 'string' })
    @IsString()
    title: string;
    @ApiProperty({ required: false, example: 12435313, type: 'number' })
    @IsOptional()
    @IsNumber()
    companyNationalId?: number;
    @ApiProperty({ required: false, example: 1, type: 'number' })
    @IsOptional()
    @IsNumber()
    documentId?: number;
    @ApiProperty({ required: true, enum: CompanyTypes })
    @IsEnum(CompanyTypes)
    companyType: CompanyTypes;
    @ApiProperty({ required: false, example: 'Exmp. Comment', type: 'string' })
    @IsString()
    @IsOptional()
    comments?: string;
    @ApiProperty({ required: true, type: () => AddressBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => AddressBaseInfo)
    address: AddressBaseInfo;
}

export class GetCompanyByIdRequest extends UserIdRequest {
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNotEmpty()
    companyId: number;
}

export class EditCompanyRequest extends GetCompanyByIdRequest {
    @ApiProperty({ required: false, example: 'Exmp. Name', type: 'string' })
    @IsOptional()
    @IsString()
    title?: string;
    @ApiProperty({ required: false, example: 12435313, type: 'number' })
    @IsOptional()
    @IsNumber()
    companyNationalId?: number;
    @ApiProperty({ required: false, enum: CompanyTypes })
    @IsOptional()
    @IsEnum(CompanyTypes)
    companyType?: CompanyTypes;
    @ApiProperty({ required: false, example: 'Exmp. Comment', type: 'string' })
    @IsOptional()
    @IsString()
    @IsOptional()
    comments?: string;
    @ApiProperty({ required: false, type: () => EditAddressRequest })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => EditAddressRequest)
    address?: EditAddressRequest;
}

export class UploadCompanyLogoRequest extends GetCompanyByIdRequest {
    @ApiProperty({ type: 'string', format: 'binary' })
    logo: Express.Multer.File;
}

export class SetComponyLogoRequest extends GetCompanyByIdRequest {
    @ApiProperty({ required: true, type: () => UploadedImageInfo })
    uploadedImage?: UploadedImageInfo;
}

export class InviteCompanyMemberRequest extends GetCompanyByIdRequest {
    email: string;
}

export class InviteMemberRequest extends UserIdRequest {
    @ApiProperty({ required: false, example: 'Exmp. Name', type: 'string' })
    @IsOptional()
    @IsString()
    name?: string | null;
    @ApiProperty({ required: false, example: 'Exmp. LastName', type: 'string' })
    @IsOptional()
    @IsString()
    lastName?: string | null;
    @ApiProperty({ required: false, format: 'YYYY-MM-DD', example: '1994-08-19' })
    @IsOptional()
    @IsString()
    dob?: string;
    @ApiProperty({ required: false, enum: GenderTypes })
    @IsOptional()
    @IsEnum(GenderTypes)
    gender?: GenderTypes;
    @ApiProperty({ required: false, example: 'Exmp. Email', type: 'string' })
    @IsOptional()
    @IsString()
    email?: string | null;
    @ApiProperty({ required: false, example: 'Exmp. Phone', type: 'string' })
    @IsOptional()
    @IsString()
    phone?: string | null;
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNotEmpty()
    roleId: number;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsOptional()
    @IsNotEmpty()
    personId?: number | null;
    @ApiProperty({ required: false, example: 'Exmp. National Id', type: 'string' })
    @IsOptional()
    @IsString()
    userNationalId?: string | null;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsOptional()
    @IsNotEmpty()
    companyId?: number | null;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsOptional()
    @IsNotEmpty()
    branchId?: number | null;
    @ApiProperty({ required: false, example: 'Exmp. Location', type: 'string' })
    @IsOptional()
    @IsString()
    userLocation?: string | null;
    @ApiProperty({ required: false, type: () => CoordsInfo })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CoordsInfo)
    coords?: CoordsInfo;
    @ApiProperty({ required: false, example: 'Exmp. message', type: 'string' })
    @IsOptional()
    @IsString()
    invitationMessage?: string | null;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsBoolean()
    existingUser: boolean;
}
