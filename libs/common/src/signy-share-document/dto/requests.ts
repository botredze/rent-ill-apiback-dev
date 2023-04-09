import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsNumber } from 'class-validator';
import { UserIdRequest } from '../../dto';
import { SignyShareDocumentTypes, SignySharedUserChannelTypes } from '../enums';

export class GenerateShareLinkForSignatoryRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    signatoryId: number;
}
export class SignyGenerateShareRequest extends UserIdRequest {
    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;
}

export class SignatoryInfo {
    @ApiProperty({ required: true, type: 'number' })
    @Transform(({ value }) => {
        return typeof value === 'string' ? parseInt(value, 10) : value;
    })
    @IsNumber()
    id: number;
    @ApiProperty({ required: true })
    @IsArray()
    type: SignySharedUserChannelTypes[];
}

export class SignyShareDocumentRequest extends UserIdRequest {
    @ApiProperty({ required: true, enum: SignyShareDocumentTypes })
    @IsEnum(SignyShareDocumentTypes)
    shareType: SignyShareDocumentTypes;

    @ApiProperty({ required: true, type: 'number' })
    @IsNumber()
    documentId: number;

    @ApiProperty({ required: true, type: [SignatoryInfo] })
    @Transform(({ value }) => {
        return value;
    })
    @IsArray()
    signatories: SignatoryInfo[];
}

export class SignyScheduleShareRequest extends SignyShareDocumentRequest {
    @ApiProperty({ required: true, type: 'string' })
    @IsNotEmpty()
    @IsISO8601()
    scheduleDate: Date;
}
