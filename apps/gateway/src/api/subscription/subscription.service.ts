import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
    CouponRequest,
    CouponResponse,
    SetUserSubscriptionPlanRequest,
    SubscriptionEventTypes,
    SubscriptionResponse,
    SubscriptionsPlansResponse,
} from '@signy/subscription';
import { UserIdRequest } from '@signy/common';
import { ApiSuccessResponse } from '@signy/exceptions';

@Injectable()
export class SubscriptionService {
    constructor(@Inject('GATEWAY_SUBSCRIPTION_PUBLISHER') private natsClient: ClientProxy) {}

    async getSubscriptionsPlans(): Promise<SubscriptionsPlansResponse> {
        return await lastValueFrom(
            // eslint-disable-next-line @typescript-eslint/ban-types
            this.natsClient.send<SubscriptionsPlansResponse, {}>(SubscriptionEventTypes.GetSubscriptionsPlans, {})
        );
    }

    async getUserSubscription(dto: UserIdRequest): Promise<SubscriptionResponse> {
        return await lastValueFrom(
            this.natsClient.send<SubscriptionResponse, UserIdRequest>(SubscriptionEventTypes.GetUserSubscription, dto)
        );
    }

    async setUserSubscription(dto: SetUserSubscriptionPlanRequest): Promise<SubscriptionResponse> {
        return await lastValueFrom(
            this.natsClient.send<SubscriptionResponse, SetUserSubscriptionPlanRequest>(
                SubscriptionEventTypes.SetUserSubscription,
                dto
            )
        );
    }

    async cancelUserSubscription(dto: UserIdRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, UserIdRequest>(SubscriptionEventTypes.CancelUserSubscription, dto)
        );
    }

    async checkUserCoupon(dto: CouponRequest): Promise<CouponResponse> {
        return await lastValueFrom(
            this.natsClient.send<CouponResponse, CouponRequest>(SubscriptionEventTypes.CheckUserCoupon, dto)
        );
    }
}
