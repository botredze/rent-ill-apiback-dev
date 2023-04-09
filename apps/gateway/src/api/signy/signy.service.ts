import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { commonConstants } from '@signy/common';
import { PdfRequest, SignPdfRequest, SignPdfResponse, SignyEventType } from '@signy/signy';
import { UploadedFileInfo } from '@signy/upload';
import { ApiEC, ServiceRpcException } from '@signy/exceptions';
import { S3Service } from '@signy/s3';
import { lastValueFrom } from 'rxjs';
import { DocumentService } from '../document/document.service';
import { SignyDocumentSignatories } from '@signy/db';

@Injectable()
export class SignyService {
    private logger: Logger;
    constructor(
        @Inject('GATEWAY_SIGNY_PUBLISHER') private natsClient: ClientProxy,
        private s3Service: S3Service,
        private documentService: DocumentService
    ) {
        this.logger = new Logger(SignyService.name);
    }

    async signPdf({ pdf, documentId, userId, signatoryId }: PdfRequest): Promise<SignPdfResponse> {
        if (!pdf?.buffer?.length || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        //TODO refactore after mvp
        const signatory = await SignyDocumentSignatories.query().modify('active').findById(signatoryId);

        if (!signatory) {
            throw ServiceRpcException(ApiEC.SignatoryNotFound);
        }

        const foundDocument = await this.documentService.getDocumentById({ userId, documentId, signatoryId });

        let uploadedFile: UploadedFileInfo | undefined;
        if (foundDocument.document?.settings.isSameDocumentSign) {
            uploadedFile = await this.s3Service.uploadFile({
                stream: pdf.buffer,
                mimetype: pdf.mimetype,
                fullKey:
                    foundDocument?.document?.file?.length && foundDocument?.document?.file[0]?.fileKey
                        ? foundDocument?.document?.file[0]?.fileKey
                        : undefined,
            });
        } else {
            uploadedFile = await this.s3Service.uploadFile({
                stream: pdf.buffer,
                mimetype: pdf.mimetype,
                key: foundDocument?.document?.originalFile?.fileKey
                    ? foundDocument?.document?.originalFile?.fileKey.substring(
                          0,
                          foundDocument?.document?.originalFile?.fileKey.lastIndexOf('/')
                      )
                    : undefined,
            });
        }
        if (!uploadedFile?.fileUrl) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        const signedPdf = await lastValueFrom(
            this.natsClient.send<SignPdfResponse, SignPdfRequest>(SignyEventType.SignPdf, {
                pdfKey: uploadedFile.fileKey,
                pdfUrl: uploadedFile.fileUrl,
                userId: userId,
                mimetype: pdf?.mimetype,
                documentId,
                signatoryId,
                isLastSignatory: foundDocument.isLastSignatory || false,
                isDriveSyncOn: foundDocument.isDriveSyncOn || false,
                pdfName: foundDocument.document?.name || pdf?.filename,
                driveSignedFilePath:
                    foundDocument.document?.settings.driveSignedFilePath || commonConstants.defaultDriveSignedFilePath,
            })
        );
        const files: UploadedFileInfo[] = foundDocument?.document?.file?.length
            ? // eslint-disable-next-line no-unsafe-optional-chaining
              [...new Set([...foundDocument.document.file, signedPdf.signedPdf])]
            : [signedPdf.signedPdf];

        await this.documentService.updateDocumentFiles({ documentId, files });

        return {
            signedPdf: signedPdf.signedPdf,
            documentBaseInfo: foundDocument?.document,
        };
    }
}
