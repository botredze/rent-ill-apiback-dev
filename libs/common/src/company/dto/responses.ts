import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { UploadedImageInfo } from '../../upload/dto';
import { CompanyBaseInfo } from './entities';

export class CreateCompanyResponse {
    @ApiProperty({ required: true, type: () => CompanyBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => CompanyBaseInfo)
    company: CompanyBaseInfo;
}

export class GetCompanyResponse {
    @ApiProperty({ required: false, type: () => CompanyBaseInfo })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CompanyBaseInfo)
    company?: CompanyBaseInfo | null;
}

export class CheckLogoExistanceInfo {
    @ApiHideProperty()
    exists: boolean;
    @ApiHideProperty()
    companyLogo?: UploadedImageInfo | null;
}

export class SetCompanyLogoResponse {
    @ApiProperty({ required: false, type: () => UploadedImageInfo })
    uploadedImage?: UploadedImageInfo;
    @ApiHideProperty()
    logoExists?: CheckLogoExistanceInfo;
}
