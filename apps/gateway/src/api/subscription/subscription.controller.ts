import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, UserPassport } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import {
    CouponRequest,
    CouponResponse,
    SetUserSubscriptionPlanRequest,
    SubscriptionResponse,
    SubscriptionsPlansResponse,
} from '@signy/subscription';
import { SubscriptionService } from './subscription.service';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { SessionUserInfo } from '@signy/auth';
import { RolesType } from '@signy/common';

@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiTags('Subscriptions')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @Get('subscriptions-plans')
    @Roles(RolesType.Guest)
    @ApiOperation({ summary: 'Get in-APP subscriptions plan' })
    async getSubscriptionsPlans(): Promise<SubscriptionsPlansResponse> {
        return this.subscriptionService.getSubscriptionsPlans();
    }

    @Get('user-subscription')
    @ApiOperation({ summary: "Get user's subscription" })
    async getUserSubscription(@UserPassport() { id: userId }: SessionUserInfo): Promise<SubscriptionResponse> {
        return this.subscriptionService.getUserSubscription({ userId });
    }

    @Post('user-subscription')
    @ApiOperation({ summary: "Set user's subscription" })
    async setUserSubscription(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: SetUserSubscriptionPlanRequest
    ): Promise<SubscriptionResponse> {
        return this.subscriptionService.setUserSubscription({ ...dto, userId });
    }

    @Delete('user-subscription')
    @ApiOperation({ summary: "Cancel user's subscription" })
    async cancelUserSubscription(@UserPassport() { id: userId }: SessionUserInfo): Promise<ApiSuccessResponse> {
        return this.subscriptionService.cancelUserSubscription({ userId });
    }

    @Post('check-user-coupon')
    @ApiOperation({ summary: "Check user's coupon" })
    async checkUserCoupon(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CouponRequest
    ): Promise<CouponResponse> {
        return this.subscriptionService.checkUserCoupon({ ...dto, userId });
    }
}
