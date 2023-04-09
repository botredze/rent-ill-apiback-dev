import { Inject, Injectable, Logger } from '@nestjs/common';
import { SubscriptionStatusType, UserIdRequest } from '@signy/common';
import {
    AccessTypes,
    CheckAccessRequest,
    CouponRequest,
    CouponResponse,
    SetUserSubscriptionPlanRequest,
    SubscriptionBaseInfo,
    SubscriptionResponse,
    SubscriptionsPlansResponse,
} from '@signy/subscription';
import { Coupon, SubscriptionPlan, User, UserAnalytic, UserCoupon, UserSubscription } from '@signy/db';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { IapService } from '@signy/iap';
import dayjs from 'dayjs';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DocumentEventType, GetUserDocumentsCountResponse } from '@signy/document';

@Injectable()
export class SubscriptionService {
    private logger: Logger;

    constructor(@Inject('SUBSCRIPTION_SERVICE') private natsClient: ClientProxy, private iapService: IapService) {
        this.logger = new Logger(SubscriptionService.name);
    }

    async getUserWithSubscriptionById({ userId }: UserIdRequest): Promise<User> {
        const user = await User.query()
            .modify('active')
            .withGraphJoined('[subscription.[subscriptionPlan]]')
            .findOne({ 'users.id': userId });

        if (!user) {
            throw ServiceRpcException(ApiEC.UserNotFound);
        }

        return user;
    }

    async updateAnalytics(
        analytics: UserAnalytic,
        subscription: SubscriptionBaseInfo
    ): Promise<{ analytics: UserAnalytic; isSubscriptionUpdated: boolean }> {
        const timeDiffInMonth = dayjs().diff(dayjs(subscription.startDate), 'M');
        let isSubscriptionUpdated = false;
        if (timeDiffInMonth && subscription.plan.features) {
            const features = subscription.plan.features;
            const { documentsCount } = await lastValueFrom(
                this.natsClient.send<GetUserDocumentsCountResponse, UserIdRequest>(
                    DocumentEventType.GetUserDocumentsCount,
                    {
                        userId: analytics.user_id,
                    }
                )
            );
            analytics = await analytics.$query().patchAndFetch({
                documents_count:
                    features.documentsCount > documentsCount ? features.documentsCount - documentsCount : 0,
            });

            isSubscriptionUpdated = true;
        }
        return { analytics, isSubscriptionUpdated };
    }

    async getUserAnalytic(
        { userId }: UserIdRequest,
        subscription: SubscriptionBaseInfo
    ): Promise<{ analytics: UserAnalytic; isSubscriptionUpdated: boolean }> {
        let userAnalytic = await UserAnalytic.query().modify('active').findOne({ user_id: userId });

        if (!userAnalytic) {
            userAnalytic = await UserAnalytic.query().insertAndFetch({
                documents_count: subscription.plan.features?.documentsCount || 0,
                sms_count: subscription.plan.features?.smsCount || 0,
                storage_capacity_used: subscription.plan.features?.storageCapacity || 0,
                templates_count: subscription.plan.features?.templatesCount || 0,
                users_count: subscription.plan.features?.usersCount || 0,
                user_id: userId,
            });
        }

        if (!userAnalytic) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }
        return await this.updateAnalytics(userAnalytic, subscription);
    }

    async getSubscriptionsPlans(): Promise<SubscriptionsPlansResponse> {
        const list = await SubscriptionPlan.query().modify('ordered').withGraphJoined('feature');
        return {
            list: list.map((x) => x.toSubscriptionPlanInfoDTO()),
        };
    }

    async getUserSubscription({ userId }: UserIdRequest): Promise<SubscriptionResponse> {
        const user = await this.getUserWithSubscriptionById({ userId });
        const subscription = await this.iapService.createOrReturnSubcription(user);
        if (!subscription) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        const userAnalytic = await this.getUserAnalytic({ userId }, subscription.toSubscriptionBaseInfoDTO());

        if (userAnalytic.isSubscriptionUpdated) {
            await subscription.$query().patchAndFetch({
                start_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                end_date: subscription?.end_date ? dayjs().add(1, 'M').format('YYYY-MM-DD HH:mm:ss') : undefined,
            });
        }

        return {
            subscription: subscription.toSubscriptionBaseInfoDTO(),
            userAnalytic: userAnalytic.analytics.toUserAnalyticBaseInfo(),
        };
    }

    async setUserSubscription({
        planId,
        code,
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        token,
    }: SetUserSubscriptionPlanRequest): Promise<SubscriptionResponse> {
        const user = await this.getUserWithSubscriptionById({ userId });

        if (user?.subscription?.plan_id === planId) {
            return await this.getUserSubscription({ userId });
        }

        const plan = await SubscriptionPlan.query().modify('active').findById(planId);

        if (!plan || plan.is_limited) {
            throw ServiceRpcException(ApiEC.SubscriptionPlanNotFound);
        }

        const coupon = code ? await Coupon.query().modify('active').findOne({ coupon: code }) : undefined;

        if (code && !coupon) {
            throw ServiceRpcException(ApiEC.CouponNotFound);
        }

        const discount = coupon ? (coupon.is_percent ? (plan.cost * coupon.amount) / 100 : coupon.amount) : 0;

        this.logger.debug({ name: 'setUserSubscription', planId, code, cost: plan.cost, discount });

        if (user.isFullAccess && user?.subscription?.subscriptionPlan) {
            await user.subscription.$query().patchAndFetch({
                plan_id: plan.id,
                start_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                status: SubscriptionStatusType.Trialing,
            });
        } else if (user?.subscription) {
            await user.subscription.$query().patchAndFetch({
                user_id: user.id,
                plan_id: plan.id,
                start_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                status: SubscriptionStatusType.Trialing,
            });
        } else {
            const userSubscription = await UserSubscription.query().findOne({ user_id: user.id });

            if (userSubscription) {
                await userSubscription.$query().patchAndFetch({
                    user_id: user.id,
                    plan_id: plan.id,
                    start_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    status: SubscriptionStatusType.Trialing,
                });
            } else {
                await UserSubscription.query().insertAndFetch({
                    user_id: user.id,
                    plan_id: plan.id,
                    start_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    status: SubscriptionStatusType.Trialing,
                });
            }
        }

        return await this.getUserSubscription({ userId });
    }

    async cancelUserSubscription({ userId }: UserIdRequest): Promise<ApiSuccessResponse> {
        const user = await this.getUserWithSubscriptionById({ userId });
        if (!user?.subscription) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        if (!user?.subscription) {
            return { ok: true };
        }

        await user.subscription.$query().patchAndFetch({ end_date: dayjs().format('YYYY-MM-DD HH:mm:ss') });

        return { ok: true };
    }

    async checkUserCoupon({ coupon, planId = null, userId }: CouponRequest): Promise<CouponResponse> {
        const user = await this.getUserWithSubscriptionById({ userId });
        const result = await Coupon.query()
            .modify('active')
            .withGraphJoined('subscriptionPlan(active)')
            .findOne({ coupon, plan_id: planId })
            .whereNotIn(
                `${Coupon.tableName}.id`,
                UserCoupon.query().modify('used').select('coupon_id').where({ user_id: user.id })
            );

        if (!result) {
            throw ServiceRpcException(ApiEC.CouponNotFound);
        }

        return { coupon: result.toCouponBaseInfoDTO() };
    }

    async checkAccess({ type, userId, size }: CheckAccessRequest): Promise<ApiSuccessResponse> {
        const userSubscription = await this.getUserSubscription({ userId });
        if (!userSubscription.subscription.plan.features) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        size = size ? size : 1;

        if (type === AccessTypes.DOCUMENT && !userSubscription.userAnalytic.documentsCount) {
            throw ServiceRpcException(ApiEC.UpgradePlanForDocuments);
        } else if (type === AccessTypes.SMS && !userSubscription.userAnalytic.smsCount) {
            throw ServiceRpcException(ApiEC.UpgradePlanForSms);
        } else if (type === AccessTypes.STORAGE && userSubscription.userAnalytic.storageCapacityUser - size <= -1) {
            throw ServiceRpcException(ApiEC.UpgradePlanForStorage);
        } else if (type === AccessTypes.TEMPLATE && !userSubscription.userAnalytic.templatesCount) {
            throw ServiceRpcException(ApiEC.UpgradePlanForTemplates);
        } else if (type === AccessTypes.USERS && !userSubscription.userAnalytic.usersCount) {
            return { ok: false };
        }

        return { ok: true };
    }
}
