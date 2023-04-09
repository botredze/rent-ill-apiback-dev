import { Injectable, Logger } from '@nestjs/common';
import { UploadFileToDriveRequest } from './dto';
import { drive_v3, google, GoogleApis } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class DriveService {
    private logger: Logger;
    private google: GoogleApis;
    private drive: drive_v3.Drive;

    constructor() {
        this.logger = new Logger(DriveService.name);
        this.google = google;
    }

    private initializeDrive(userToken: string): void {
        this.drive = google.drive({
            version: 'v3',
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });
    }

    async createFolder(fullPath: string): Promise<string> {
        const path = fullPath.split('/');
        const foundFolder = await this.drive.files.list({
            q: `mimeType = 'application/vnd.google-apps.folder' and name='${path[0]}'`,
            spaces: 'drive',
            fields: 'files(id, name, trashed, parents)',
        });
        let parentId;
        if (!foundFolder.data.files?.length || foundFolder.data.files[0]?.trashed) {
            const newFolder = await this.drive.files.create({
                fields: 'id',
                requestBody: {
                    name: path[0],
                    mimeType: 'application/vnd.google-apps.folder',
                },
            });
            parentId = newFolder.data.id;
        } else if (foundFolder.data.files?.length && !foundFolder.data.files[0]?.trashed) {
            parentId = foundFolder.data.files[0]?.id;
        }

        if (!parentId) {
            throw Error('Internal Server Error');
        }

        for (const x of path.slice(1)) {
            const foundFolder = await this.drive.files.list({
                q: `mimeType = 'application/vnd.google-apps.folder' and name='${x}'`,
                spaces: 'drive',
                fields: 'files(id, name, trashed, parents)',
            });

            if (!foundFolder.data.files?.length || foundFolder.data.files[0]?.trashed) {
                await this.drive.files
                    .create({
                        fields: 'id',
                        requestBody: {
                            name: x,
                            mimeType: 'application/vnd.google-apps.folder',
                            parents: [parentId],
                        },
                    })
                    .then((data) => {
                        parentId = data.data.id;
                    })
                    .catch((err) => {
                        throw err;
                    });
            } else if (
                foundFolder.data.files?.length &&
                foundFolder.data.files[0]?.id &&
                !foundFolder.data.files[0]?.trashed
            ) {
                parentId = foundFolder.data.files[0].id;
            }
        }
        return parentId;
    }

    async uploadFileToDrive({ fullPath, userToken, file, signerFullName }: UploadFileToDriveRequest): Promise<boolean> {
        try {
            this.initializeDrive(userToken);
            const path = fullPath.split('/');
            const lastParentId = await this.createFolder(fullPath);

            await this.drive.files.create({
                fields: 'id',
                requestBody: {
                    name: `${path[path.length - 1]}.pdf`,
                    parents: [lastParentId],
                    description: `Signed by: ${signerFullName} at: ${new Date().toISOString()}`,
                },
                media: {
                    body: Readable.from(file),
                },
            });
            return true;
        } catch (err) {
            this.logger.error('Drive upload file error:', err);
            throw err;
        }
    }
}
