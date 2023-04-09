import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserIdRequest } from '../../dto';
import { ApartmentTypes, ManagementStatusTypes, ParkingTypes, RentAsTypes, TenancyStatusTypes } from '../enums';
import { ApartmentBaseInfo } from './entities';

export class CreateApartmentRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: () => ApartmentBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => ApartmentBaseInfo)
    apartmentData: ApartmentBaseInfo;
}

export class GetApartmentByIdRequest extends UserIdRequest {
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNumber()
    apartmentId: number;
}

export class EditPartmentRequest {
    @ApiProperty({ required: true, example: 22, type: 'number' })
    @IsNumber()
    apartmentId: number;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    buildingId?: number | null;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    name?: string | null;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    apartmentIdAtAuthority?: string | null;
    @ApiProperty({ required: false, enum: ApartmentTypes })
    @IsOptional()
    @IsEnum(ApartmentTypes)
    apartmentType?: ApartmentTypes;
    @ApiProperty({ required: false, enum: RentAsTypes })
    @IsOptional()
    @IsEnum(RentAsTypes)
    rentAs?: RentAsTypes;
    @ApiProperty({ required: false, type: 'string', example: '2022-10-13' })
    @IsOptional()
    @IsString()
    lastAquareDate?: string | null;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    unitsCount?: number | null;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    roomsCount?: number | null;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    suitesCount?: number | null;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    toiletsCount?: number | null;
    @ApiProperty({ required: false, enum: TenancyStatusTypes })
    @IsOptional()
    @IsEnum(TenancyStatusTypes)
    tenancyStatus?: TenancyStatusTypes;
    @ApiProperty({ required: false, enum: ManagementStatusTypes })
    @IsOptional()
    @IsEnum(ManagementStatusTypes)
    managementStatus?: ManagementStatusTypes;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isManagementExists?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isElevatorExists?: boolean;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    elevatorsCount?: number | null;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    balcony?: string | null;
    @ApiProperty({ required: false, enum: ParkingTypes })
    @IsOptional()
    @IsEnum(ParkingTypes)
    parkingType?: ParkingTypes | null;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    backyard?: number | null;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    frontyard?: number | null;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    description?: string | null;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    floor?: number | null;
    @ApiProperty({ required: false, type: 'number', example: 10 })
    @IsOptional()
    @IsNumber()
    totalFloors?: number | null;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isCommunaleActive?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isRenovated?: boolean;
    @ApiProperty({ required: false, type: 'string', example: '2022-10-13' })
    @IsOptional()
    @IsString()
    startRenovationDate?: Date | string | null;
    @ApiProperty({ required: false, type: 'string', example: '2022-10-13' })
    @IsOptional()
    @IsString()
    endRenovationDate?: Date | string | null;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isFurnished?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    inHouseShelter?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isAirConditionerExists?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isAccessibility?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isGratings?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isPandoraDoors?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isSmokingAllowed?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isOpticalFiberInternetExists?: boolean;
    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isAnimalsAllowed?: boolean;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    fornitureStatus?: string | null;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    countOfResponsibles?: number | null;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    countOfFollowers?: number | null;
}
