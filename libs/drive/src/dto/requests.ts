export class UserTokenRequest {
    userToken: string;
}

export class UploadFileToDriveRequest extends UserTokenRequest {
    fullPath: string;
    file: Buffer;
    signerFullName?: string;
}
