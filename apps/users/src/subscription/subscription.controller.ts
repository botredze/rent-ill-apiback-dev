import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserIdRequest } from '@signy/common';
import {
    CouponRequest,
    CouponResponse,
    SetUserSubscriptionPlanRequest,
    SubscriptionResponse,
    SubscriptionsPlansResponse,
    SubscriptionEventTypes,
    CheckAccessRequest,
} from '@signy/subscription';
import { ApiSuccessResponse } from '@signy/exceptions';
import { SubscriptionService } from './subscription.service';

@Controller()
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @MessagePattern(SubscriptionEventTypes.GetSubscriptionsPlans)
    async getSubscriptionsPlans(): Promise<SubscriptionsPlansResponse> {
        return this.subscriptionService.getSubscriptionsPlans();
    }

    @MessagePattern(SubscriptionEventTypes.GetUserSubscription)
    async getUserSubscription(dto: UserIdRequest): Promise<SubscriptionResponse> {
        return this.subscriptionService.getUserSubscription(dto);
    }

    @MessagePattern(SubscriptionEventTypes.SetUserSubscription)
    async setUserSubscription(dto: SetUserSubscriptionPlanRequest): Promise<SubscriptionResponse> {
        return this.subscriptionService.setUserSubscription(dto);
    }

    @MessagePattern(SubscriptionEventTypes.CancelUserSubscription)
    async cancelUserSubscription(dto: UserIdRequest): Promise<ApiSuccessResponse> {
        return this.subscriptionService.cancelUserSubscription(dto);
    }

    @MessagePattern(SubscriptionEventTypes.CheckUserCoupon)
    async checkUserCoupon(dto: CouponRequest): Promise<CouponResponse> {
        return this.subscriptionService.checkUserCoupon(dto);
    }

    @MessagePattern(SubscriptionEventTypes.CheckAccess)
    async checkAccess(dto: CheckAccessRequest): Promise<ApiSuccessResponse> {
        return this.subscriptionService.checkAccess(dto);
    }
}
