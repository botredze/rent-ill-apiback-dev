import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SignyDocumentInputSettingsExtraBaseInfo, SignyInputOptionListInfo } from '../../document-input/dto';
import { UploadedFileInfo } from '../../upload/dto';

export class InputHistoryBaseInfo {
    @ApiProperty({ type: 'number' })
    id: number;
    @ApiProperty({ type: 'string' })
    value?: string;
    @ApiProperty({ required: false, type: () => [SignyInputOptionListInfo] })
    @Type(() => SignyInputOptionListInfo)
    valueJson?: SignyInputOptionListInfo[];
    @ApiProperty({ required: false, type: () => [UploadedFileInfo] })
    @Type(() => UploadedFileInfo)
    attachment?: UploadedFileInfo[];
    @ApiProperty({ required: false, type: () => SignyDocumentInputSettingsExtraBaseInfo })
    @Type(() => SignyDocumentInputSettingsExtraBaseInfo)
    input?: SignyDocumentInputSettingsExtraBaseInfo;
}
