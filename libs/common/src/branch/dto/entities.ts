import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CompanyBaseInfo } from '../../company/dto';
import { AddressExtraBaseInfo } from '../../dto';
import { StatusType } from '../../enums';

export class BranchBaseInfo {
    @ApiProperty({ required: true, example: 31, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, example: 'Exmp. Name', type: 'string' })
    @IsString()
    name: string;
    @ApiProperty({ required: false, type: () => AddressExtraBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => AddressExtraBaseInfo)
    @IsOptional()
    address?: AddressExtraBaseInfo | null;
    @ApiProperty({ required: false, example: 'Exmp. Comments', type: 'string' })
    @IsString()
    comments?: string | null;
    @ApiProperty({ required: false, type: () => CompanyBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => CompanyBaseInfo)
    @IsOptional()
    company?: CompanyBaseInfo | null;
    @ApiProperty({ required: true, enum: StatusType })
    @IsEnum(StatusType)
    status: StatusType;
}
