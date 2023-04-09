import { ApiProperty } from '@nestjs/swagger';

export class UserSearchBaseInfo {
    @ApiProperty({ required: true, type: 'number' })
    id: number;
    @ApiProperty({ required: false, type: 'string' })
    email?: string;
    @ApiProperty({ required: false, type: 'string' })
    phone?: string[];
}
