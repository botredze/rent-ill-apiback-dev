import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { RoleBaseInfo } from './entities';

export class CreateRoleResponse {
    @ApiProperty({
        required: true,
        type: () => RoleBaseInfo,
    })
    @Type(() => RoleBaseInfo)
    role: RoleBaseInfo;
}

export class ListCompanyRolesResponse {
    @ApiProperty({
        required: false,
        type: () => [RoleBaseInfo],
    })
    @IsArray()
    roles?: RoleBaseInfo[] | null;
}
