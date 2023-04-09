import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SignyDocumentInputSettingsExtraBaseInfo } from './entities';

export class CreateInputForPdfResponse {
    @ApiProperty({ required: true, type: () => SignyDocumentInputSettingsExtraBaseInfo })
    @Type(() => SignyDocumentInputSettingsExtraBaseInfo)
    input: SignyDocumentInputSettingsExtraBaseInfo;
}

export class UpdateInputForPdfResponse extends CreateInputForPdfResponse {}

export class GetDocumentInputsWithSearchResponse {
    @ApiProperty({ required: false, type: () => [SignyDocumentInputSettingsExtraBaseInfo] })
    @Type(() => SignyDocumentInputSettingsExtraBaseInfo)
    inputs?: SignyDocumentInputSettingsExtraBaseInfo[] | undefined;
}
