import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsInt, IsOptional } from 'class-validator';
import { UserIdRequest } from '../../dto';
import { PageInfoRequest } from '@signy/pagination';
import { NotificationMessageInfo } from '.';
import { NotificationInfoType } from '../enums';

export class NotificationIdRequest extends UserIdRequest {
    notificationId: number;
}

export class SetNotificationsReadStatusRequest {
    userId?: number;
    staffId?: number;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    minNotificationId?: number;
}

export class NotificationMessageRequest {
    infoType: NotificationInfoType;
    message?: string;
}

export class CreateNotificationRequest extends NotificationMessageRequest {
    userId?: number;
    staffId?: number;
    submissionId?: number;
    assignmentId?: number;
    title?: string;
    icon?: string;
}

export class PushNotificationMessageRequest extends NotificationIdRequest {
    pushMessage: NotificationMessageInfo;
}

export class GetUserNotificationListRequest extends PageInfoRequest {
    staffId?: number;
    userId?: number;
    sendBirdId?: string;
}

export class SendNotificationRequest {
    userId?: number;
    staffId?: number;
    infoType: NotificationInfoType;
    submissionId?: number;
    assignmentId?: number;
    title?: string;
    icon?: string;
}
