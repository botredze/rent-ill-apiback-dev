import { ApiProperty } from '@nestjs/swagger';
import { FcmTokensInfo, NotificationExtraInfo, UserSettingsInfo } from '.';
import { PageInfoResponse } from '@signy/pagination';
import { IsBoolean } from 'class-validator';

export class NotificationsListResponse {
    @ApiProperty({ type: () => [NotificationExtraInfo] })
    list: NotificationExtraInfo[];

    @ApiProperty({ type: () => PageInfoResponse })
    pageInfo: PageInfoResponse;
}

export class NotificationBaseResponse {
    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    isMessagesOn: boolean;
    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    isNewAssignmentOn: boolean;
    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    isSubmissionUpdatesOn: boolean;
}

export class FcmTokensResponse {
    @ApiProperty({ type: () => [FcmTokensInfo] })
    fcmTokens: FcmTokensInfo[];
}

export class NotificationResponse {
    @ApiProperty({ type: () => UserSettingsInfo })
    notification: UserSettingsInfo;
}
