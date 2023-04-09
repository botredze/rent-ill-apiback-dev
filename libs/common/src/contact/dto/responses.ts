import { ApiProperty } from '@nestjs/swagger';
import { PageInfoResponse } from '@signy/pagination';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { SignyBaseInfo } from '../../signy/dto';
import { SignyCustomGroupsBaseInfo } from './entities';

export class GetGroupsWithSearchResponse {
    @ApiProperty({ required: false, type: 'number' })
    id?: number;
    @ApiProperty({ required: false, type: 'string' })
    name?: string;
}
export class GetUserContactsResponse {
    @ApiProperty({ required: false, type: () => [SignyBaseInfo] })
    @Type(() => SignyBaseInfo)
    contacts?: SignyBaseInfo[];
    @ApiProperty({ required: false, type: () => [GetGroupsWithSearchResponse] })
    groups?: GetGroupsWithSearchResponse[];
    @ApiProperty()
    pageInfo: PageInfoResponse;
}

export class CreateContactCustomGroupResponse {
    @ApiProperty({ required: true, type: () => GetGroupsWithSearchResponse })
    @Type(() => GetGroupsWithSearchResponse)
    group: GetGroupsWithSearchResponse;
}

export class GetCsvExampleResponse {
    @ApiProperty({ type: 'string' })
    @IsString()
    url: string;
}

export class UpdateContactResponse {
    @ApiProperty({ required: true, type: () => SignyBaseInfo })
    @Type(() => SignyBaseInfo)
    contact: SignyBaseInfo;
}

export class GetGroupsWithContactsResponse {
    @ApiProperty({ required: true, type: () => [SignyCustomGroupsBaseInfo] })
    @Type(() => SignyCustomGroupsBaseInfo)
    groups: SignyCustomGroupsBaseInfo[];
}
