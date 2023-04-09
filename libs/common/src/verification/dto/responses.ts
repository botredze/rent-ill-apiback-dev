import { ApiProperty } from '@nestjs/swagger';

export class OtpCodeResponse {
    @ApiProperty()
    isSent: boolean;

    @ApiProperty({ type: 'integer' })
    timeout: number;
}
