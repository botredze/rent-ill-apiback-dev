import { S3 } from 'aws-sdk';
import { IsString, IsOptional } from 'class-validator';

export class S3FileRequest {
    @IsString()
    @IsOptional()
    url?: string;

    @IsString()
    @IsOptional()
    key?: string;
}

export class UploadFileRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream: S3.Body;
    mimetype: string;
    folder?: string;
    key?: string;
    fullKey?: string;
}

export class UploadImageRequest {
    stream: S3.Body;
    mimetype?: string;
    imageFolder?: string;
    userId?: number;
}
