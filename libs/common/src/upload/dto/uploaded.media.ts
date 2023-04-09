import { ApiProperty } from '@nestjs/swagger';
import { UploadedThumbnailInfo } from '.';

export class UploadedMediaInfo extends UploadedThumbnailInfo {
    @ApiProperty({ required: false })
    mimetype?: string;
    @ApiProperty({ required: false })
    mediaUrl?: string;
    mediaKey?: string;
    @ApiProperty({ required: false, type: 'number' })
    duration?: number;
}
