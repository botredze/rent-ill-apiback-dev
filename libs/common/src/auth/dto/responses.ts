import { ApiProperty } from '@nestjs/swagger';
import { ExternalUserInfo, SessionUserInfo, UserBaseInfo, UserSettingsInfo } from '.';
import { SubscriptionResponse } from '../../subscription/dto';

export class AuthSessionUserResponse {
    @ApiProperty({ type: () => SessionUserInfo })
    sessionUser: SessionUserInfo;

    @ApiProperty({ required: false, type: () => UserBaseInfo })
    userBaseInfo?: UserBaseInfo;

    @ApiProperty({ required: false, type: () => UserSettingsInfo })
    userSettings?: UserSettingsInfo;

    @ApiProperty({ required: false, type: () => SubscriptionResponse })
    userSubscription?: SubscriptionResponse;
}

export class AuthSuccessResponse extends AuthSessionUserResponse {
    @ApiProperty()
    accessToken: string;
}

export class CheckUserExistsResponse {
    @ApiProperty()
    exists: boolean;
    @ApiProperty()
    isSignatory?: boolean;
    @ApiProperty()
    isPasswordExists?: boolean;
}

export class ResetPasswordOTPResponse {
    @ApiProperty()
    recoveryToken: string;
}

export class CreateStaffProfileResponse {
    userId: number;
    userName: string;
}

export class ImportGoogleContactsResponse {
    contacts: ExternalUserInfo[];
}
