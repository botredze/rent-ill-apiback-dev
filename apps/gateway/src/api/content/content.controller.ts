import { Controller, Get } from '@nestjs/common';
import { ApiSecurity, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiErrorResponse } from '@signy/exceptions';
import { ContentService } from './content.service';
import { LegalDocs } from './dto';

@ApiSecurity('X_API_KEY')
@ApiTags('Public')
@Controller('content')
@ApiResponse({
    status: 400,
    description: 'Bad request',
    type: ApiErrorResponse,
})
export class ContentController {
    constructor(private readonly contentService: ContentService) {}

    @Get('legal-docs')
    @ApiResponse({
        status: 200,
        description: 'Legal docs urls',
        type: LegalDocs,
    })
    @ApiOperation({
        summary: 'Get Terms & Conditions links',
    })
    async legalDocs(): Promise<LegalDocs> {
        return this.contentService.getLegalDocs();
    }
}
