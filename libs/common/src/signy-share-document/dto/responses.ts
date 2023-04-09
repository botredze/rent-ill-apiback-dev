import { ApiProperty } from '@nestjs/swagger';

export class SignyGenerateShareResponse {
    @ApiProperty({ required: true, type: 'string' })
    link: string;
    @ApiProperty({ required: true, type: 'string', format: 'base64' })
    qrCodeUrl: string;
}

export class GenerateShareLinkForSignatoryResponse {
    @ApiProperty({ required: true, type: 'string' })
    link: string;
}
