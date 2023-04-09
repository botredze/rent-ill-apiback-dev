import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiEC, ApiException } from '@signy/exceptions';
import 'multer';
export const uploadConstants = {
    maxFileSize: 100000000, // in bytes
    maxFieldSize: 10000000, // in bytes
    maxFiles: 5,
    minThumbnailSize: 5000,
    thumbnailWidth: 200,
    thumbnailHeight: 200,
    submissionThumbnailWidth: 500,
    submissionThumbnailHeight: 500,
    mimetypes: ['image/png', 'image/jpeg'],
    defaultPdfMimetype: 'application/pdf',
};

export const uploadFolders = {
    userAvatars: 'avatars',
    contactAvatars: 'contact-avatars',
    companyLogos: 'company-logos',
    thumbnails: 'thumbnails',
    signedPdfFiles: 'signed-pdf-files',
    pdfFiles: 'pdf-files',
    inputAttachments: 'input-attachments',
    signyEmailTemplates: 'signy-email-templates',
    signyCompanyLogos: 'signy-company-logos',
    signyQrCodes: 'signy-qr-codes',
    signySignatures: 'signy-signatures',
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const imageFileFilter = (req: Express.Request, file: Express.Multer.File, cb: Function) => {
    if (file.mimetype.toLocaleLowerCase() === 'application/octet-stream' && file.originalname.match(/\.(jpe?g)$/i)) {
        file.mimetype = 'image/jpeg';
    }

    if (file.mimetype.toLocaleLowerCase() === 'application/octet-stream' && file.originalname.match(/\.png$/i)) {
        file.mimetype = 'image/png';
    }

    if (uploadConstants.mimetypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiException(ApiEC.WrongImageFormat), false);
    }
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const pdfFileFilter = (req: Express.Request, file: Express.Multer.File, cb: Function) => {
    if (file.mimetype.toLocaleLowerCase() === 'application/pdf' && file.originalname.match(/\.(pdf)$/i)) {
        file.mimetype = 'application/pdf';
        file.filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, true);
    } else {
        cb(new ApiException(ApiEC.WrongInput), false);
    }
};

export const uploadFileParams: MulterOptions = {
    limits: { fileSize: uploadConstants.maxFileSize },
    fileFilter: imageFileFilter,
};
