import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SignyBaseInfo } from '../../signy/dto';

export class SignyCustomGroupsBaseInfo {
    @ApiProperty({ type: 'number' })
    id: number;

    @ApiProperty({ type: 'boolean' })
    isSignOrderExists: boolean;

    @ApiProperty({ type: 'number' })
    signOrderQueue?: number;

    @ApiProperty({ type: 'string' })
    name: string;

    @ApiProperty({ type: 'string' })
    color: string;

    @ApiProperty({ type: 'boolean' })
    isCustom: boolean;

    @ApiProperty({ type: 'boolean' })
    isFavourite: boolean;

    @ApiProperty({ required: false, type: 'string' })
    icon?: string;

    @ApiProperty({ type: 'number' })
    participatorsCount: number;

    @ApiProperty({ required: false, type: () => [SignyBaseInfo] })
    @Type(() => SignyBaseInfo)
    contacts?: SignyBaseInfo[] | undefined;

    @ApiProperty({ required: false, type: 'string' })
    createdAt: string;
}
