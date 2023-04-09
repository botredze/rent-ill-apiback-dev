import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@signy/exceptions';
import { PageInfoResponse } from '@signy/pagination';
import { UploadedImageInfo } from '../../upload';
import { UserSearchBaseInfo } from './entities';

export class CheckPasswordResponse {
    @ApiProperty()
    isMatch: boolean;
}

export class DeleteUserAccountResponse extends ApiSuccessResponse {
    @ApiProperty({ description: 'If this parameter is true client app should force user to re-login' })
    isForceLogout: boolean;

    avatar?: UploadedImageInfo | null;
}

export class SearchUsersResponse {
    @ApiProperty({ type: () => [UserSearchBaseInfo] })
    list: UserSearchBaseInfo[];
    @ApiProperty({ type: () => PageInfoResponse })
    pageInfo: PageInfoResponse;
}
