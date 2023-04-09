import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CouponBaseInfo, SubscriptionBaseInfo, SubscriptionPlanInfo, UserAnalyticBaseInfo } from './entities';

export class SubscriptionsPlansResponse {
    @ApiProperty({ required: true, type: () => [SubscriptionPlanInfo] })
    @Type(() => SubscriptionPlanInfo)
    list: SubscriptionPlanInfo[];
}

export class SubscriptionResponse {
    @ApiProperty({ required: true, type: () => SubscriptionBaseInfo })
    @Type(() => SubscriptionBaseInfo)
    subscription: SubscriptionBaseInfo;
    @ApiProperty({ required: true, type: () => UserAnalyticBaseInfo })
    @Type(() => UserAnalyticBaseInfo)
    userAnalytic: UserAnalyticBaseInfo;
}

export class CouponResponse {
    @ApiProperty({ required: true, type: () => CouponBaseInfo })
    @Type(() => CouponBaseInfo)
    coupon: CouponBaseInfo;
}
