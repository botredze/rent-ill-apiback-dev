export enum NotificationType {
    Info = 'INFO',
}

export enum NotificationInfoType {
    NewMessage = 'NEW_MESSAGE',
}

export enum NotificationEventType {
    sendNewNotification = 'SEND_NEW_NOTIFICATION',
    getUserNotificationsList = 'GET_USER_NOTIFICATIONS_LIST',
    setNotificationsReadStatus = 'SET_NOTIFICATIONS_READ_STATUS',
    deleteAllNotifications = 'DELETE_ALL_NOTIFICATIONS',
    checkUserNotifications = 'CHECK_USER_NOTIFICATIONS',
}
