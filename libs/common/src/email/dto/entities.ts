import { UploadedFileInfo } from '../../upload/dto';

export class EmailLocalsParams {
    fullName?: string | null;
    otpCode?: string;
    link?: string;
    messageBody?: string;
    signerName?: string;
    messages?: {
        fieldName: string | undefined;
        value: string | UploadedFileInfo[] | string[] | null | undefined;
        type: string;
        timeStamp: string;
    }[];
    fileUrl?: string;
}

export class ExtraLocalParams extends EmailLocalsParams {
    email: string;
}
