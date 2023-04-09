import { ApiProperty } from '@nestjs/swagger';
import { UploadedThumbnailInfo } from '.';

export class UploadedVideoInfo extends UploadedThumbnailInfo {
    @ApiProperty({ required: false })
    mimetype?: string;
    @ApiProperty()
    videoUrl: string;
    @ApiProperty({ required: false, type: 'number' })
    duration?: number;
    videoKey?: string;
}
