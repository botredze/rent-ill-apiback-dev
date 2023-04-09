export enum ShareEventTypes {
    GenerateShare = 'GENERATE_SHARE',
    ShareDocument = 'SHARE_DOCUMENT',
    ScheduleShare = 'SCHEDULE_SHARE',
    GenerateShareLinkForSignatory = 'GENERATE_SHARE_LINK_FOR_SIGNATURY',
}

export enum SignyShareDocumentTypes {
    AnyOne = 'ANY_ONE',
    ListedUsers = 'LISTED_USERS',
}

export enum SignySharedUserChannelTypes {
    Email = 'EMAIL',
    Phone = 'PHONE',
    Whatsapp = 'WHATSAPP',
    Telegram = 'TELEGRAM',
}
