import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CoordsInfo } from '../../dto';

export class EditAddressRequest {
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNumber()
    @IsNotEmpty()
    addressId: number;
    @ApiProperty({ required: false, example: 'Turkey', type: 'string' })
    @IsOptional()
    @IsString()
    country?: string;
    @ApiProperty({ required: false, example: 'Istanbul', type: 'string' })
    @IsOptional()
    @IsString()
    city?: string;
    @ApiProperty({ required: false, example: 'Bebek', type: 'string' })
    @IsOptional()
    @IsString()
    area?: string;
    @ApiProperty({ required: false, example: 'Exmp. Street', type: 'string' })
    @IsOptional()
    @IsString()
    street?: string;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsOptional()
    @IsNumber()
    apartment?: number;
    @ApiProperty({ required: false, example: 'Exmp. Entry', type: 'string' })
    @IsOptional()
    @IsString()
    entry?: string | null;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsOptional()
    @IsNumber()
    building?: number | null;
    @ApiProperty({ required: false, example: '12413', type: 'string' })
    @IsOptional()
    @IsString()
    zipCode?: string;
    @ApiProperty({ required: false, type: () => CoordsInfo })
    @IsOptional()
    @ValidateNested({ each: false })
    @Type(() => CoordsInfo)
    @IsOptional()
    coords?: CoordsInfo | null;
}
