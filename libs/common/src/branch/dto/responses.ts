import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { BranchBaseInfo } from './entities';

export class CreateBranchResponse {
    @ApiProperty({ required: true, type: () => BranchBaseInfo })
    @ValidateNested({ each: true })
    @Type(() => BranchBaseInfo)
    branch: BranchBaseInfo;
}

export class GetBranchResponse {
    @ApiProperty({ required: false, type: () => BranchBaseInfo })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => BranchBaseInfo)
    branch?: BranchBaseInfo | null;
}
