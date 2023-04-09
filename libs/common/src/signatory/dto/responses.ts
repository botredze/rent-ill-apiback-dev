import { ApiProperty } from '@nestjs/swagger';
import { PageInfoResponse } from '@signy/pagination';
import { Type } from 'class-transformer';
import { SignatoryBaseInfo } from '../../signy/dto';
import { UploadedImageInfo } from '../../upload/dto';
import { InputHistoryBaseInfo } from './entities';

export class SearchSignatoryWithFilterResponse {
    @ApiProperty({ required: false, type: () => SignatoryBaseInfo })
    @Type(() => SignatoryBaseInfo)
    signatories?: SignatoryBaseInfo[];
    @ApiProperty({ required: false, type: () => PageInfoResponse })
    @Type(() => PageInfoResponse)
    pageInfo: PageInfoResponse;
}

export class GetDocumentInputHistoryResponse {
    @ApiProperty({ required: false, type: () => InputHistoryBaseInfo })
    @Type(() => InputHistoryBaseInfo)
    history?: InputHistoryBaseInfo[];
}

export class UploadSignatureResponse {
    @ApiProperty({ required: true, type: () => UploadedImageInfo })
    @Type(() => UploadedImageInfo)
    signature: UploadedImageInfo;
}
