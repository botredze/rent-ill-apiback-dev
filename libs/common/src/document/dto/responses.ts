import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { PageInfoResponse } from '@signy/pagination';
import { Type } from 'class-transformer';
import { CompanyBaseInfo } from '../../company/dto';
import { SignyCustomGroupsBaseInfo } from '../../contact/dto';
import { SignyBaseInfo } from '../../signy/dto';
import { SignyDocumentBaseInfo, SignyDocumentCustomGroupsBaseInfo, SignyDocumentExtraInfo } from './entities';

export class UploadDocumentResponse {
    @ApiProperty({ required: true, type: () => SignyDocumentBaseInfo })
    @Type(() => SignyDocumentBaseInfo)
    document: SignyDocumentBaseInfo;
    @ApiProperty({ required: true, type: () => [SignyDocumentCustomGroupsBaseInfo] })
    @Type(() => SignyDocumentCustomGroupsBaseInfo)
    groups: SignyDocumentCustomGroupsBaseInfo[];
}

export class GetDocumentByIdResponse {
    @ApiProperty({ required: false, type: () => SignyDocumentExtraInfo })
    @Type(() => SignyDocumentExtraInfo)
    document?: SignyDocumentExtraInfo | null;
    @ApiProperty({ required: false, type: () => CompanyBaseInfo })
    @Type(() => CompanyBaseInfo)
    company?: CompanyBaseInfo;
    @ApiHideProperty()
    isLastSignatory?: boolean;
    @ApiHideProperty()
    isDriveSyncOn?: boolean;
}

export class GetAllUserDocuments {
    @ApiProperty({ required: false, type: () => [SignyDocumentExtraInfo] })
    @Type(() => SignyDocumentExtraInfo)
    document?: SignyDocumentExtraInfo[] | null;
    @ApiProperty({ required: false, type: () => PageInfoResponse })
    @Type(() => PageInfoResponse)
    pageInfo: PageInfoResponse;
}

export class CreateDocumentCustomGroupResponse {
    @ApiProperty({ required: true, type: () => SignyDocumentCustomGroupsBaseInfo })
    @Type(() => SignyDocumentCustomGroupsBaseInfo)
    group: SignyDocumentCustomGroupsBaseInfo;
}

export class GetDocumentGrroupsAndContactsResponse {
    @ApiProperty({ required: false, type: () => [SignyBaseInfo] })
    @Type(() => SignyBaseInfo)
    contacts?: SignyBaseInfo[];
    @ApiProperty({ required: false, type: () => [SignyCustomGroupsBaseInfo] })
    @Type(() => SignyCustomGroupsBaseInfo)
    groups?: SignyCustomGroupsBaseInfo[];
}

export class GetAllUserDocumentGroups {
    @ApiProperty({ required: false, type: () => [SignyDocumentCustomGroupsBaseInfo] })
    @Type(() => SignyDocumentCustomGroupsBaseInfo)
    groups: SignyDocumentCustomGroupsBaseInfo[];
}

export class CheckPassCodeResponse {
    @ApiProperty({ required: true, type: 'string' })
    isPassed: boolean;
    @ApiProperty({ required: true, type: 'string' })
    isOwner: boolean;
}

export class GetUserDocumentsCountResponse {
    documentsCount: number;
}
