import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileInfo {
    @ApiProperty({ required: false })
    mimetype?: string;

    @ApiProperty()
    fileUrl: string;

    // Internal use
    fileKey?: string;
}
