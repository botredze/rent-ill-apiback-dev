import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, MaxLength, IsNotEmpty } from 'class-validator';
import { PageInfoRequest } from '@signy/pagination';
import { CoordsInfo } from '.';
import { commonConstants } from '../common.constants';

export class UserIdRequest {
    @ApiHideProperty()
    userId: number;
}

export class IdsRequest {
    ids: number[];
}

export class UserWithCoordsRequest extends CoordsInfo {
    userId: number;
}

export class UserIdPageInfoRequest extends PageInfoRequest {
    userId: number;
}

export class ContactSupportRequest {
    @ApiProperty()
    @IsString()
    @MaxLength(commonConstants.maxSupportMessageLength)
    message: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    @MaxLength(commonConstants.maxEmailLength)
    replyTo?: string;
}

export class SearchBaseInfoRequest extends PageInfoRequest {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(commonConstants.maxStringInputLength)
    search?: string;

    // eslint-disable-next-line @typescript-eslint/ban-types
    filter?: Function;
}
