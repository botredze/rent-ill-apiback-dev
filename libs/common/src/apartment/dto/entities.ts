import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BuildingBaseInfoResponse } from '../../building/dto';
import { ApartmentTypes, ManagementStatusTypes, ParkingTypes, RentAsTypes, TenancyStatusTypes } from '../enums';

export class ApartmentBaseInfo {
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
    @ApiProperty({ required: true, enum: ApartmentTypes })
    @IsEnum(ApartmentTypes)
    apartmentType: ApartmentTypes;
    @ApiProperty({ required: true, enum: RentAsTypes })
    @IsEnum(RentAsTypes)
    rentAs: RentAsTypes;
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
    @ApiProperty({ required: true, enum: TenancyStatusTypes })
    @IsEnum(TenancyStatusTypes)
    tenancyStatus: TenancyStatusTypes;
    @ApiProperty({ required: true, enum: ManagementStatusTypes })
    @IsEnum(ManagementStatusTypes)
    managementStatus: ManagementStatusTypes;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isManagementExists: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isElevatorExists: boolean;
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
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isCommunaleActive: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isRenovated: boolean;
    @ApiProperty({ required: false, type: 'string', example: '2022-10-13' })
    @IsOptional()
    @IsString()
    startRenovationDate?: Date | string | null;
    @ApiProperty({ required: false, type: 'string', example: '2022-10-13' })
    @IsOptional()
    @IsString()
    endRenovationDate?: Date | string | null;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isFurnished: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    inHouseShelter: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isAirConditionerExists: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isAccessibility: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isGratings: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isPandoraDoors: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isSmokingAllowed: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isOpticalFiberInternetExists: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isAnimalsAllowed: boolean;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    fornitureStatus: string;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    countOfResponsibles: number;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    countOfFollowers: number;
}

export class ApartmentExtraBaseInfo extends ApartmentBaseInfo {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: false, type: () => BuildingBaseInfoResponse })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => BuildingBaseInfoResponse)
    building?: BuildingBaseInfoResponse | null;
}
