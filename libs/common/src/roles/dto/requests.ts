import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PermissionTypes } from '../enums';

export class RoleTypesInfo {
    @ApiProperty({ enum: PermissionTypes, example: PermissionTypes.ServiceOrders })
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
}

export class CreateRoleRequest {
    @ApiHideProperty()
    userId: number;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsOptional()
    @IsNotEmpty()
    personId?: number | null;
    @ApiProperty({ required: false, example: 9, type: 'number' })
    @IsOptional()
    companyId?: number | null;
    @ApiProperty({ required: false, example: 9, type: 'number' })
    @IsOptional()
    branchId?: number | null;
    @ApiProperty({ required: true, example: 'Tenant', type: 'string' })
    @IsString()
    name: string;
    @ApiProperty({ required: false, example: 'General Director', type: 'string' })
    @IsOptional()
    @IsString()
    subTypeName?: string | null;
    @ApiProperty({ required: false, type: () => [RoleTypesInfo] })
    @Transform(({ value }) => value)
    @ValidateNested({ each: true })
    @Type(() => RoleTypesInfo)
    type: RoleTypesInfo[];
}

export class GetRoleAndCreateRequest {
    @ApiHideProperty()
    userId: number;
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNotEmpty()
    roleId: number;
    @ApiProperty({ required: false, example: 9, type: 'number' })
    @IsOptional()
    companyId?: number | null;
    @ApiProperty({ required: false, example: 9, type: 'number' })
    @IsOptional()
    branchId?: number | null;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsOptional()
    @IsNotEmpty()
    personId?: number | null;
}
