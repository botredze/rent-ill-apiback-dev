import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserBaseInfo } from '../../auth/dto';
import { AddressExtraBaseInfo } from '../../dto';
import { StatusType } from '../../enums';
import { UploadedImageInfo } from '../../upload/dto';
import { CompanyTypes } from '../enums';

export class CompanyBaseInfo {
    @ApiProperty({ required: true, example: 31, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, example: 'Exmp. Name', type: 'string' })
    @IsString()
    name: string;
    @ApiProperty({ required: true, example: 41341462423, type: 'number' })
    @IsNumber()
    @IsOptional()
    nationalCompanyId?: number | null;
    @ApiProperty({ required: false, type: () => UserBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => UserBaseInfo)
    @IsOptional()
    owner?: UserBaseInfo | null;
    @ApiProperty({ required: true, enum: CompanyTypes })
    @IsEnum(CompanyTypes)
    companyType: CompanyTypes;
    @ApiProperty({ required: false, type: () => AddressExtraBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => AddressExtraBaseInfo)
    @IsOptional()
    address?: AddressExtraBaseInfo | null;
    @ApiProperty({ required: true, example: 1000, type: 'number' })
    @IsNumber()
    smsCount: number;
    @ApiProperty({ required: true, example: false, type: 'boolean' })
    @IsBoolean()
    isSmsAutoRenew: boolean;
    @ApiProperty({ required: false, example: 'Exmp. Comments', type: 'string' })
    @IsString()
    comments?: string | null;
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    @ValidateNested({ each: true })
    @Type(() => UploadedImageInfo)
    @IsOptional()
    logo?: UploadedImageInfo | null;
    @ApiProperty({ required: true, enum: StatusType })
    @IsEnum(StatusType)
    status: StatusType;
}
