import { ApiHideProperty, ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { UserIdRequest } from '../../dto';
import { SignyInputTypes } from '../enums';
import { SignyDocumentInputSettingsBaseInfo } from './entities';

export class CreateInputForPdfRequest extends OmitType(SignyDocumentInputSettingsBaseInfo, ['id'] as const) {
    @ApiHideProperty()
    userId: number;
}

export class UpdateInputForPdfRequest extends OmitType(SignyDocumentInputSettingsBaseInfo, [
    'documentId',
    'type',
] as const) {
    @ApiHideProperty()
    userId: number;
}

export class InputDbRequest extends IntersectionType(UpdateInputForPdfRequest, CreateInputForPdfRequest) {}

export class InputIdRequest extends UserIdRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsNumber()
    inputId: number;
}

export class RemoveDocumentInputRequest extends InputIdRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsNumber()
    inputId: number;
}

export class GetDocumentInputsWithSearchRequest extends UserIdRequest {
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    documentId?: number;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    inputId?: number;
    @ApiProperty({ required: false, enum: SignyInputTypes })
    @IsOptional()
    @IsEnum(SignyInputTypes)
    type?: SignyInputTypes;
    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    @IsNumber()
    signatoryId?: number;
}
