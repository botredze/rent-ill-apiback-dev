export enum SubscriptionEventTypes {
    GetSubscriptionsPlans = 'GET_SUBSCRIPTIONS_PLANS',
    GetUserSubscription = 'GET_USER_SUBSCRIPTIONS',
    SetUserSubscription = 'SET_USER_SUBSCRIPTIONS',
    CancelUserSubscription = 'CANCEL_USER_SUBSCRIPTIONS',
    CheckUserCoupon = 'CHECK_USER_COUPON',
    CheckAccess = 'CHECK_ACCESS',
}

export enum AccessTypes {
    DOCUMENT = 'DOCUMENT',
    SMS = 'SMS',
    STORAGE = 'STORAGE',
    TEMPLATE = 'TEMPLATE',
    USERS = 'USERS',
}
