import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionPlan, User, UserSubscription } from '@signy/db';
import { ApiEC, ServiceRpcException } from '@signy/exceptions';
import dayjs from 'dayjs';

@Injectable()
export class IapService {
    private logger: Logger;

    constructor() {
        this.logger = new Logger(IapService.name);
    }

    async getTrialPlan(): Promise<SubscriptionPlan> {
        const trial = await SubscriptionPlan.query().withGraphJoined('feature').modify('limited').first();

        if (!trial) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return trial;
    }

    async createOrReturnSubcription(user: User): Promise<UserSubscription> {
        let subscription = await UserSubscription.query()
            .withGraphJoined('subscriptionPlan.[feature]')
            .findOne({ user_id: user.id });
        if (!subscription) {
            subscription = await this.setTrialSubscriptionPlan(user);
        }
        return subscription;
    }

    async setTrialSubscriptionPlan(user: User): Promise<UserSubscription> {
        const trialPlan = await this.getTrialPlan();
        if (!trialPlan) {
            this.logger.error({
                name: 'createOrReturnSubcription',
                userId: user.id,
                error: 'Trial subscription plan not exists',
            });
        }
        const subscription = await UserSubscription.query()
            .insertAndFetch({
                user_id: user.id,
                plan_id: trialPlan.id,
                start_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            .onConflict()
            .merge();
        subscription.subscriptionPlan = trialPlan;
        return subscription;
    }
}
