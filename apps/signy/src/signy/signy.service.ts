import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ESignService } from '@signy/e-sign';
import { SigningStatusTypes, SignPdfRequest, SignPdfResponse } from '@signy/signy';
import { ApiEC, ServiceRpcException } from '@signy/exceptions';
import { S3Service } from '@signy/s3';
import {
    SignyDocument,
    SignyDocumentAudit,
    SignyDocumentInputHistory,
    SignyDocumentInputSettings,
    SignyDocumentSignatories,
    User,
} from '@signy/db';
import { ActionTypes } from '@signy/document';
import { DriveService } from '@signy/drive';
import { lastValueFrom } from 'rxjs';
import { EmailEventType, EmailType, SendEmailRequest, SendEmailResponse } from '@signy/email';
@Injectable()
export class SignyService {
    private logger: Logger;
    constructor(
        @Inject('SIGNY_SERVICE') private natsClient: ClientProxy,
        private eSignService: ESignService,
        private s3Service: S3Service,
        private driveService: DriveService
    ) {
        this.logger = new Logger(SignyService.name);
    }

    async signPdf({
        pdfUrl,
        pdfKey,
        userId,
        pdfName,
        mimetype,
        documentId,
        signatoryId,
        isLastSignatory,
        isDriveSyncOn,
        driveSignedFilePath,
    }: SignPdfRequest): Promise<SignPdfResponse> {
        if (!pdfUrl || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const user = await User.query().withGraphJoined('profile').findById(userId);

        const uploadedFile = await this.s3Service.getFile({ key: pdfKey, url: pdfUrl });

        if (!uploadedFile?.buffer) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }
        const certificate = await this.s3Service.getFile({ key: 'certificates/certificate.p12' });
        if (!certificate?.buffer) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }
        const signedPdf = await this.eSignService.signPdf({ pdf: uploadedFile, certificate });

        const uploadedSignedFile = await this.s3Service.uploadFile({
            stream: signedPdf.data,
            mimetype,
            fullKey: pdfKey,
        });
        if (!uploadedSignedFile?.fileUrl) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        await SignyDocumentAudit.query().insert({
            action_type: ActionTypes.Signing,
            document_id: documentId,
            signatory_id: signatoryId,
            user_id: userId,
        });

        if (isLastSignatory) {
            await SignyDocumentAudit.query().insert({
                action_type: ActionTypes.Completed,
                document_id: documentId,
                signatory_id: signatoryId,
                user_id: userId,
            });
        }
        if (isDriveSyncOn && user?.drive_token) {
            await this.driveService.uploadFileToDrive({
                file: uploadedFile,
                fullPath: `${driveSignedFilePath}/${pdfName?.split('.')[0]}-${
                    user.profile?.fullName
                }-${new Date().toISOString()}-signed`,
                userToken: user.drive_token,
                signerFullName: user.profile?.fullName,
            });
        }
        await SignyDocumentSignatories.query()
            .modify('active')
            .patchAndFetchById(signatoryId, { signing_status: SigningStatusTypes.Signed });

        const creator = await SignyDocument.query()
            .modify('active')
            .withGraphJoined('creator.[profile]')
            .findById(documentId);

        if (user?.email || user?.ext_user_email) {
            const email = user?.email ? user.email : user.ext_user_email;
            if (!email) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }

            const history = (
                await SignyDocumentInputHistory.query()
                    .withGraphJoined('documentInputs')
                    .modify('active')
                    .where('signatory_id', signatoryId)
                    .whereIn(
                        'input_settings_id',
                        SignyDocumentInputSettings.query()
                            .select('id')
                            .modify('active')
                            .where({ document_id: documentId })
                    )
            ).map((x) => {
                const value = x?.value
                    ? x.value
                    : x?.value_json
                    ? JSON.stringify(x.value_json)
                    : x?.attachments?.length
                    ? x.attachments.map((y) => y.fileUrl)
                    : 'undefined';

                const fieldName = x?.documentInputs?.placeholder || x?.documentInputs?.field_id;

                return {
                    fieldName: `${fieldName}`,
                    value,
                    type: x.documentInputs.type,
                    timeStamp: x.created_at,
                };
            });

            if (creator?.creator?.email || creator?.creator?.ext_user_email) {
                const creatorEmail = creator?.creator?.email || creator?.creator?.ext_user_email;

                if (!creatorEmail) {
                    throw ServiceRpcException(ApiEC.InternalServerError);
                }
                await lastValueFrom(
                    this.natsClient.send<SendEmailResponse, SendEmailRequest>(EmailEventType.SendEmail, {
                        emailType: EmailType.DocumentOwnerAudit,
                        to: creatorEmail,
                        locals: {
                            signerName: user?.profile?.fullName || email,
                            fullName: creator?.creator?.profile?.fullName,
                            messages: history,
                            fileUrl: pdfUrl,
                        },
                    })
                );
            }

            await lastValueFrom(
                this.natsClient.send<SendEmailResponse, SendEmailRequest>(EmailEventType.SendEmail, {
                    emailType: EmailType.SignatoryAudit,
                    to: email,
                    locals: {
                        fullName: user?.profile?.fullName,
                        messages: history,
                        fileUrl: pdfUrl,
                    },
                })
            );
        }

        return {
            signedPdf: uploadedSignedFile,
        };
    }

    // async checkIfSignatureExists({ pdfUrl }: CheckIfSignatureExistsRequest): Promise<ApiSuccessResponse> {
    //     if (!pdfUrl) {
    //         throw ServiceRpcException(ApiEC.WrongInput);
    //     }

    //     const uploadedFile = await this.s3Service.getFile({
    //         key: 'pdf-files/1~2022-12-06T11:50:54.219Z/original',
    //     });

    //     if (!uploadedFile?.buffer) {
    //         throw ServiceRpcException(ApiEC.InternalServerError);
    //     }

    //     const exists = !!(await this.eSignService.checkIfSignatureExists({ pdf: uploadedFile }));

    //     return { ok: exists };
    // }
}
