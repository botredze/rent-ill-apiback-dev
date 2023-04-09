import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserBaseInfo } from '../../auth/dto';
import { BranchBaseInfo } from '../../branch/dto';
import { CompanyBaseInfo } from '../../company/dto';
import { StatusType } from '../../enums';
import { PermissionTypes } from '../enums';

export class PermissionActionsBaseInfo {
    @ApiProperty({ required: true, example: 31, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, enum: PermissionTypes })
    @IsEnum(PermissionTypes)
    type: PermissionTypes;
    @ApiProperty({ required: true, example: false, type: 'boolean' })
    @IsBoolean()
    create: boolean;
    @ApiProperty({ required: true, example: false, type: 'boolean' })
    @IsBoolean()
    read: boolean;
    @ApiProperty({ required: true, example: false, type: 'boolean' })
    @IsBoolean()
    write: boolean;
    @ApiProperty({ required: true, example: false, type: 'boolean' })
    @IsBoolean()
    update: boolean;
    @ApiProperty({ required: true, example: false, type: 'boolean' })
    @IsBoolean()
    delete: boolean;
    @ApiProperty({ required: true, example: false, type: 'boolean' })
    @IsBoolean()
    reports: boolean;
    @ApiProperty({ required: true, enum: StatusType })
    @IsEnum(StatusType)
    status: StatusType;
}

export class RoleBaseInfo {
    @ApiProperty({ required: true, example: 31, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, example: 'Tenant', type: 'string' })
    @IsString()
    name: string;
    @ApiProperty({ required: false, example: 'General Director', type: 'string' })
    @IsOptional()
    @IsString()
    subTypeName?: string | null;
    @ApiProperty({ required: true, enum: StatusType })
    @IsEnum(StatusType)
    status: StatusType;

    @ApiProperty({
        required: false,
        type: () => UserBaseInfo,
    })
    @IsOptional()
    @Type(() => UserBaseInfo)
    user?: UserBaseInfo | null;

    @ApiProperty({
        required: false,
        type: () => CompanyBaseInfo,
    })
    @IsOptional()
    @Type(() => CompanyBaseInfo)
    company?: CompanyBaseInfo | null;

    @ApiProperty({
        required: false,
        type: () => BranchBaseInfo,
    })
    @IsOptional()
    @Type(() => BranchBaseInfo)
    branch?: BranchBaseInfo | null;
    @ApiProperty({
        required: false,
        type: () => [PermissionActionsBaseInfo],
    })
    @IsOptional()
    permissionActions?: PermissionActionsBaseInfo[] | null;
}
