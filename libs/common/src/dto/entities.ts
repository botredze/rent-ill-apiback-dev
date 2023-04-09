import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsLatitude,
    IsLongitude,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    ValidateNested,
} from 'class-validator';
import { SocialMediaType } from '../enums';

export class CoordsInfo {
    @ApiProperty({ type: 'number', format: 'float' })
    @IsLatitude()
    @Min(1)
    latitude?: number | null;

    @ApiProperty({ type: 'number', format: 'float' })
    @IsLongitude()
    @Min(1)
    longitude?: number | null;
}

export class SocialMediaInfo {
    @ApiProperty({ enum: SocialMediaType })
    @IsEnum(SocialMediaType)
    type: SocialMediaType;
    @ApiProperty({
        required: false,
        type: 'string',
        example: 'https://www.example.com/example',
    })
    @IsOptional()
    @IsUrl()
    linkToIcon?: string;
    @ApiProperty({
        required: false,
        type: 'string',
        example: 'https://www.instagram.com/example',
    })
    @IsOptional()
    @IsUrl()
    linkToProfile?: string;
}

export class FcmTokenInfo {
    id: number;
    token?: string;
}

export class AddressBaseInfo {
    @ApiProperty({ required: true, example: 'Turkey', type: 'string' })
    @IsString()
    country: string;
    @ApiProperty({ required: true, example: 'Istanbul', type: 'string' })
    @IsString()
    city: string;
    @ApiProperty({ required: true, example: 'Bebek', type: 'string' })
    @IsString()
    area: string;
    @ApiProperty({ required: true, example: 'Exmp. Street', type: 'string' })
    @IsString()
    street: string;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsNumber()
    apartment?: number;
    @ApiProperty({ required: false, example: 'Exmp. Entry', type: 'string' })
    @IsString()
    @IsOptional()
    entry?: string | null;
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsNumber()
    @IsOptional()
    building?: number | null;
    @ApiProperty({ required: true, example: '12413', type: 'string' })
    @IsString()
    zipCode: string;
    @ApiProperty({ required: false, type: () => CoordsInfo })
    @ValidateNested({ each: true })
    @Type(() => CoordsInfo)
    @IsOptional()
    coords?: CoordsInfo | null;
}

export class AddressExtraBaseInfo extends AddressBaseInfo {
    @ApiProperty({ required: false, example: 22, type: 'number' })
    @IsNumber()
    id: number;
}
