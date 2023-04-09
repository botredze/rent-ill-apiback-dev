import { ApiProperty } from '@nestjs/swagger';

export class LegalDocs {
    @ApiProperty()
    termsAndConditions: string;

    @ApiProperty()
    privacyPolicy: string;
}
