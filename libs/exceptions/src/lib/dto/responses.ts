import { ApiProperty } from '@nestjs/swagger';
import { ApiEC } from '../enums';

export class ApiErrorResponse {
    @ApiProperty({ description: 'Message for error alert' })
    message: string;

    @ApiProperty({ required: false, description: 'Title for error alert' })
    title?: string;

    @ApiProperty({
        type: 'integer',
        description: Object.entries(ApiEC)
            .filter((x) => !isNaN(parseInt(x[0], 10)))
            .map((x) => `${x[0]}: ${x[1]}`)
            .join('<br>'),
    })
    errorCode: number;

    @ApiProperty({ description: 'If this parameter is true client app should force user to re-login' })
    isForceLogout: boolean;

    @ApiProperty({ description: 'If this parameter is true client app should redirect user to subscription screen' })
    isSusbcriptionError: boolean;
}

export class ApiSuccessResponse {
    @ApiProperty()
    ok: boolean;
}
