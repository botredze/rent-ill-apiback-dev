import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UploadedFileInfo, UploadedImageInfo } from '../../upload/dto';
import { EmailTemplateBaseInfo, SmsBaseInfo } from './entities';

export class UploadTemplateFilesToS3Response {
    @ApiProperty({ required: true, type: 'number' })
    templateId: number;
    @ApiProperty({ type: () => [UploadedFileInfo] })
    @Type(() => UploadedFileInfo)
    files: UploadedFileInfo[];
}

export class CreateTemplateResponse {
    @ApiProperty({ type: () => EmailTemplateBaseInfo })
    @Type(() => EmailTemplateBaseInfo)
    template: EmailTemplateBaseInfo;
}

export class UploadSignyCompanyLogoResponse extends CreateTemplateResponse {
    @ApiHideProperty()
    oldLogo?: UploadedImageInfo;
}

export class GetSignyEmailTemplateByIdResponse extends CreateTemplateResponse {}

export class CreateSmsTemplateResponse {
    @ApiProperty({ type: () => SmsBaseInfo })
    @Type(() => SmsBaseInfo)
    template: SmsBaseInfo;
}

export class GetSignySmsTemplateByIdResponse extends CreateSmsTemplateResponse {}
