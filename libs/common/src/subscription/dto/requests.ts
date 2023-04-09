import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { UserIdRequest } from '../../dto';
import { AccessTypes } from '../enums';

export class SetUserSubscriptionPlanRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsInt()
    @IsPositive()
    planId: number;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    code?: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    token?: string;
}

export class CouponRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    @IsNotEmpty()
    coupon: string;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsInt()
    @IsPositive()
    planId?: number | null;
}

export class CheckAccessRequest extends UserIdRequest {
    @ApiHideProperty()
    type: AccessTypes;
    @ApiHideProperty()
    size?: number;
}
