import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EditAddressRequest } from '../../address';
import { GetCompanyByIdRequest } from '../../company/dto';
import { AddressBaseInfo, UserIdRequest } from '../../dto';

export class BranchIdRequest {
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNotEmpty()
    branchId: number;
}

export class GetBranchByIdRequest extends UserIdRequest {
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNotEmpty()
    branchId: number;
}

export class CreateBranchRequest extends GetCompanyByIdRequest {
    @ApiProperty({ required: true, example: 'Exmp. Name', type: 'string' })
    @IsString()
    title: string;
    @ApiProperty({ required: false, example: 'Exmp. Comment', type: 'string' })
    @IsString()
    @IsOptional()
    comments?: string;
    @ApiProperty({ required: true, type: () => AddressBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => AddressBaseInfo)
    address: AddressBaseInfo;
}

export class EditBranchRequest extends GetBranchByIdRequest {
    @ApiProperty({ required: false, example: 'Exmp. Name', type: 'string' })
    @IsOptional()
    @IsString()
    title?: string;
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
