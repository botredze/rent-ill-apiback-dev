import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsNumber, IsDate } from 'class-validator';
import { NotificationInfoType } from '../enums';

export class NotificationBaseInfo {
    @ApiProperty({ type: 'integer' })
    @IsNumber()
    id: number;

    @ApiProperty({})
    @IsDate()
    date: Date;

    @ApiProperty({ required: false, enum: NotificationInfoType })
    type?: NotificationInfoType;

    @ApiProperty({ required: false, type: 'integer' })
    assignmentId?: number;

    @ApiProperty({ required: false, type: 'integer' })
    submissionId?: number;

    @ApiProperty({ type: 'boolean' })
    @IsBoolean()
    unread: boolean;

    @ApiProperty({ type: 'string', required: false })
    @IsString()
    message?: string;

    @ApiProperty({ type: 'string', required: false })
    icon?: string;
}

export class NotificationMessageInfo {
    @ApiProperty({ type: 'string' })
    @IsString()
    title: string;
    @ApiProperty({ type: 'string' })
    @IsString()
    message: string;
}

export class UserSettingsInfo {
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

export class FcmTokensInfo {
    @ApiProperty({ type: 'integer' })
    @IsNumber()
    id: number;
    @ApiProperty()
    token?: string | null;
}

export class NotificationExtraInfo extends NotificationBaseInfo {
    @ApiProperty({ required: false, type: 'integer' })
    channelId?: number;
    @ApiProperty({ type: 'string', required: false })
    chatUrl?: string;
    @ApiProperty({ type: 'string', required: false })
    chatTitle?: string;
}
