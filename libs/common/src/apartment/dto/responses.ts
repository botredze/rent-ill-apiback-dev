import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApartmentExtraBaseInfo } from './entities';

export class CreateApartmentResponse {
    @ApiProperty({ required: true, type: () => ApartmentExtraBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => ApartmentExtraBaseInfo)
    apartment: ApartmentExtraBaseInfo;
}

export class GetApartmentByIdResponse extends CreateApartmentResponse {}
