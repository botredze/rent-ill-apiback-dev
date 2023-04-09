import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ManipulateType } from 'dayjs';
import { SubscriptionStatusType } from '../../enums';

export class FeatureBaseInfo {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    name: string;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    hint?: string;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    usersCount: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    contactsCount: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    documentsCount: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    templatesCount: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    mailsCount: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    smsCount: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    storageCapacity: number;
}
export class SubscriptionPlanInfo {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    title: string;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    description?: string;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    cost: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    term?: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    discountPercantage?: number;
    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    termType?: string | ManipulateType;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isLimited: boolean;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isSmsPlan: boolean;
    @ApiProperty({ required: true, type: () => FeatureBaseInfo })
    @Type(() => FeatureBaseInfo)
    features?: FeatureBaseInfo;
}

export class SubscriptionBaseInfo {
    @ApiProperty({ required: true, type: () => SubscriptionPlanInfo })
    @Type(() => SubscriptionPlanInfo)
    plan: SubscriptionPlanInfo;
    @ApiProperty({ type: 'string', format: 'date' })
    @IsString()
    startDate: string;
    @ApiProperty({ required: false, type: 'string', format: 'date' })
    @IsOptional()
    @IsString()
    endDate?: string;
    @ApiProperty({ enum: SubscriptionStatusType })
    @IsEnum(SubscriptionStatusType)
    status: SubscriptionStatusType;
}
export class CouponBaseInfo {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    coupon: string;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    amount: number;
    @ApiProperty({ required: true, type: 'boolean' })
    @IsBoolean()
    isPercent: boolean;
    @ApiProperty({ required: false, type: () => SubscriptionPlanInfo })
    @IsOptional()
    @Type(() => SubscriptionPlanInfo)
    subscriptionPlan?: SubscriptionPlanInfo;
}

export class CreateSubscriptionRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    price?: number;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    term: number;
    @ApiProperty({ required: true, type: 'string' })
    @IsString()
    termType: string;
}

export class UserAnalyticBaseInfo {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true, type: 'number', default: 0 })
    @IsNumber()
    documentsCount: number;
    @ApiProperty({ required: true, type: 'number', default: 0 })
    @IsNumber()
    usersCount: number;
    @ApiProperty({ required: true, type: 'number', default: 0 })
    @IsNumber()
    smsCount: number;
    @ApiProperty({ required: true, type: 'number', default: 0 })
    @IsNumber()
    templatesCount: number;
    @ApiProperty({ required: true, type: 'number', default: 0, description: 'Storage amount used by user in bytes' })
    @IsNumber()
    storageCapacityUser: number;
}
