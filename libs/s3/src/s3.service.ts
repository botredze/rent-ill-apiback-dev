import sharp from 'sharp';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { uploadConstants, uploadFolders } from './upload.constants';
import { S3FileRequest, S3FileResponse, UploadFileRequest, UploadImageRequest } from './dto';
import { UploadedImageInfo, UploadedFileInfo, UploadedThumbnailInfo } from '@signy/upload';

@Injectable()
export class S3Service {
    private s3Client: S3;
    private bucket: string;
    private logger: Logger;
    private downloadHost: string;

    constructor(private configService: ConfigService) {
        this.bucket = this.configService.get<string>('AWS_S3_BUCKET', '');
        this.downloadHost = this.configService.get<string>('AWS_DOWNLOAD_HOST', '');
        const s3Config = {
            credentials: {
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
            },
            region: this.configService.get<string>('AWS_REGION', ''),
        };

        this.s3Client = new S3({ ...s3Config, endpoint: this.configService.get<string>('AWS_S3_ENDPOINT', '') });
        this.logger = new Logger(S3Service.name);
    }

    async uploadImage({
        stream,
        mimetype,
        imageFolder = uploadFolders.userAvatars,
        userId,
    }: UploadImageRequest): Promise<UploadedImageInfo | undefined> {
        return new Promise((resolve, reject) => {
            this.s3Client.upload(
                {
                    Body: stream,
                    Key: !userId ? `${imageFolder}/${uuid()}` : `${imageFolder}/${userId}/${uuid()}`,
                    ContentType: mimetype,
                    Bucket: this.bucket,
                    ACL: 'public-read',
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err: any, data: S3FileResponse) => {
                    if (err) {
                        this.logger.error(err.message);
                        reject(err);
                    } else {
                        resolve({ mimetype, imageUrl: `${this.downloadHost}/${data.Key}`, imageKey: data.Key });
                    }
                }
            );
        });
    }

    async resizeImage({ url, key }: S3FileRequest, submission?: boolean): Promise<UploadedThumbnailInfo> {
        if (!url && !key) {
            return {};
        }
        const imagePath = key || new URL(url || '').pathname.replace(`/${this.bucket}/`, '').replace(/^\/|\/$/g, '');

        const thumbPathArr = imagePath.split('/');

        thumbPathArr[thumbPathArr.length - 2] = uploadFolders.thumbnails;

        const thumbPath = thumbPathArr.join('/');

        const getParams = {
            Bucket: this.bucket,
            Key: imagePath,
        };

        const putParams = {
            Bucket: this.bucket,
            Key: thumbPath,
        };

        const thumbnailSize = submission
            ? { width: uploadConstants.submissionThumbnailWidth, height: uploadConstants.submissionThumbnailHeight }
            : { width: uploadConstants.thumbnailWidth, height: uploadConstants.thumbnailHeight };

        const thumbnailUrl = await this.s3Client
            .getObject(getParams)
            .promise()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((data: any) =>
                sharp(data.Body)
                    .rotate()
                    .jpeg({ quality: 75, progressive: true })
                    .resize(thumbnailSize.width, thumbnailSize.height, {
                        fit: 'cover',
                        withoutEnlargement: true,
                    })
                    .toBuffer()
            )
            .then((Body) =>
                this.s3Client
                    .putObject({
                        Body,
                        Bucket: this.bucket,
                        ACL: 'public-read',
                        ContentType: 'image/jpeg',
                        Key: thumbPath,
                    })
                    .promise()
            )
            .then((thumbnail: S3.PutObjectOutput): string | void => {
                if (!thumbnail) {
                    return;
                }
                const thumbnailUrl = new URL(this.s3Client.getSignedUrl('getObject', putParams));
                return thumbnailUrl.origin + thumbnailUrl.pathname;
            })
            .catch((err) => this.logger.error(err.message));

        return thumbnailUrl ? { thumbnailUrl, thumbnailKey: thumbPath } : {};
    }

    async getFile({ url, key }: S3FileRequest): Promise<Buffer | undefined> {
        if (!url && !key) {
            return;
        }
        const getParams = {
            Bucket: this.bucket,
            Key: key ? key : new URL(url || '').pathname.replace(`/${this.bucket}/`, '').replace(/^\/|\/$/g, ''),
        };

        return new Promise((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.s3Client.getObject(getParams, (err: any, data: any) => {
                if (err) {
                    this.logger.error(err.message);
                    reject();
                } else {
                    resolve(data?.Body);
                }
            });
        });
    }

    async getFileSize({ url, key }: S3FileRequest): Promise<number> {
        if (!url && !key) {
            return 0;
        }
        return new Promise((resolve, reject) => {
            this.s3Client.headObject(
                { Key: key || new URL(url || '').pathname.substr(1) || '', Bucket: this.bucket },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err: any, data: any) => {
                    if (err) {
                        this.logger.error(err.message);
                        reject(0);
                    } else {
                        resolve(data.ContentLength);
                    }
                }
            );
        });
    }

    async deleteFile({ url, key }: S3FileRequest): Promise<boolean> {
        if (!url && !key) {
            return false;
        }
        return new Promise((resolve, reject) => {
            this.s3Client.deleteObjects(
                {
                    Bucket: this.bucket,
                    Delete: {
                        Objects: [
                            {
                                Key: key || new URL(url ? url.replace(/"/g, '') : '').pathname.substr(1),
                            },
                        ],
                        Quiet: false,
                    },
                },
                (err, data) => {
                    if (err) {
                        this.logger.error(err.message);
                        reject(false);
                    } else {
                        resolve(!!data);
                    }
                }
            );
        });
    }

    async uploadFile({
        stream,
        mimetype,
        folder = uploadFolders.pdfFiles,
        key,
        fullKey,
    }: UploadFileRequest): Promise<UploadedFileInfo | undefined> {
        return new Promise((resolve, reject) => {
            this.s3Client.upload(
                {
                    Body: stream,
                    Key: fullKey
                        ? fullKey
                        : key
                        ? `${folder}/${key}/${uuid()}-signed.pdf`
                        : `${folder}/${uuid()}/original.pdf`,
                    ContentType: mimetype,
                    Bucket: this.bucket,
                    ACL: 'public-read',
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err: any, data: S3FileResponse) => {
                    if (err) {
                        this.logger.error(err.message);
                        reject(err);
                    } else {
                        //data.Location
                        resolve({ mimetype, fileUrl: `${this.downloadHost}/${data.Key}`, fileKey: data.Key });
                    }
                }
            );
        });
    }

    async uploadTemplateFile({
        stream,
        mimetype,
        folder = uploadFolders.signyEmailTemplates,
        key,
    }: UploadFileRequest): Promise<UploadedFileInfo | undefined> {
        return new Promise((resolve, reject) => {
            this.s3Client.upload(
                {
                    Body: stream,
                    Key: key ? `${key}/${uuid()}` : `${folder}/${uuid()}`,
                    ContentType: mimetype,
                    Bucket: this.bucket,
                    ACL: 'public-read',
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err: any, data: S3FileResponse) => {
                    if (err) {
                        this.logger.error(err.message);
                        reject(err);
                    } else {
                        resolve({ mimetype, fileUrl: data.Location, fileKey: data.Key });
                    }
                }
            );
        });
    }
}
