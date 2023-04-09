import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    SignyGenerateShareResponse,
    SignyGenerateShareRequest,
    SignyShareDocumentTypes,
    SignyShareDocumentRequest,
    SignyScheduleShareRequest,
    GenerateShareLinkForSignatoryRequest,
    GenerateShareLinkForSignatoryResponse,
} from '@signy/signy-share-document';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { generateQrCode } from '../utils';
import {
    SignyDocument,
    SignyDocumentAudit,
    SignyDocumentSignatories,
    SignyShareDocument,
    SignySharedUserDocument,
    User,
} from '@signy/db';
import { ActionTypes, DocumentIdRequest, GetDocumentWithPermissionRequest } from '@signy/document';
import { AnyQueryBuilder } from 'objection';
import { ClientProxy } from '@nestjs/microservices';
import { QueueProcessesService } from '../utils/queue/queue.processes.service';
import { lastValueFrom } from 'rxjs';
import { AuthEventType, AuthSignUpRequestInternal } from '@signy/auth';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { StatusType } from '@signy/common';

@Injectable()
export class ShareService {
    private jwtSignOptions: JwtSignOptions = {};
    private jwtVerifyOptions: JwtVerifyOptions = {};
    private logger: Logger;
    private signyFileUrl: string;
    constructor(
        public jwtService: JwtService,
        @Inject('SHARE_SERVICE') private natsClient: ClientProxy,
        @Inject(forwardRef(() => QueueProcessesService))
        private queueProcessesService: QueueProcessesService,
        private configService: ConfigService
    ) {
        this.logger = new Logger(ShareService.name);
        this.signyFileUrl = this.configService.get<string>('SIGNY_FILE_URL', '');
        this.jwtSignOptions.issuer = (process.env.PROJECT_NAME || 'signy.co.il')
            .replace(/\s/g, '.')
            .toLocaleLowerCase();
        this.jwtSignOptions.expiresIn = parseInt(process.env.JWT_MAX_AGE_SEC || `${60 * 60 * 24}`, 10);
        this.jwtSignOptions.secret = process.env.JWT_SECRET;
        this.jwtVerifyOptions.secret = process.env.JWT_SECRET;
    }

    async getDocumentWithPermission({ documentId, userId }: GetDocumentWithPermissionRequest): Promise<SignyDocument> {
        if (!documentId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const document = await SignyDocument.query()
            .modify('active')
            .withGraphJoined('[documentSettings, documentSignatories(active)]')
            .findOne({ 'signy_documents.id': documentId, creator_id: userId });
        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        return document;
    }

    async getShareDocumentWithPermission({
        documentId,
        userId,
    }: DocumentIdRequest): Promise<SignyShareDocument | undefined> {
        const foundShareDocument = await SignyShareDocument.query()
            .withGraphJoined('[document.[documentSignatories.[contact]], user.[profile]]')
            .modify('active')
            .findOne({
                'signy_share_documents.document_id': documentId,
                'signy_share_documents.user_id': userId,
            });

        return foundShareDocument;
    }

    async getSharedDocumentWithPermission({
        documentId,
        userId,
        email,
        phone,
        signatoryId,
        passCode,
    }: DocumentIdRequest): Promise<SignyDocument> {
        const foundShareDocument = await SignyShareDocument.query()
            .withGraphJoined('[document.[documentSignatories.[contact]], user.[profile]]')
            .modify('active')
            .findOne({
                'signy_share_documents.document_id': documentId,
            });

        const document = await SignyDocument.query()
            .alias('sd')
            .withGraphJoined('[documentSettings, documentSignatories]')
            .findOne({ 'sd.id': documentId, 'sd.status': StatusType.Active });

        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }
        if (!foundShareDocument && document.creator_id !== userId && document?.documentSettings.is_private) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        if (foundShareDocument && document.creator_id !== userId && document?.documentSettings.is_private) {
            const foundSignatory = await SignyDocumentSignatories.query()
                .modify('active')
                .findOne({ document_id: documentId })
                .where((cb: AnyQueryBuilder) => {
                    if (!signatoryId) {
                        cb.where({ user_id: userId }).orWhere({ temp_user_id: userId });
                    }
                    if (signatoryId) {
                        cb.findOne({ id: signatoryId });
                    }
                    if (email) {
                        cb.findOne({ email });
                    }
                    if (phone) {
                        cb.findOne({ phone });
                    }
                });
            if (!foundSignatory) {
                throw ServiceRpcException(ApiEC.SignatoryNotFound);
            }
            if (foundShareDocument.type === SignyShareDocumentTypes.ListedUsers) {
                const foundUser = await SignySharedUserDocument.query()
                    .modify('active')
                    .findOne({ document_id: documentId })
                    .where((cb: AnyQueryBuilder) => {
                        if (signatoryId) {
                            cb.where({ signy_signatory_id: signatoryId });
                        }
                    });

                if (!foundUser) {
                    throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
                }

                if (foundSignatory?.pass_code) {
                    if (!passCode) {
                        throw ServiceRpcException(ApiEC.PassCodeNotFound);
                    } else if (foundSignatory.pass_code !== passCode) {
                        throw ServiceRpcException(ApiEC.InvalidPassCode);
                    }
                }
            }
            await SignyDocumentAudit.query().insert({
                action_type: ActionTypes.Review,
                document_id: documentId,
                signatory_id: foundSignatory.id,
                user_id: document.creator_id,
            });
        }

        return document;
    }

    async generateShare({ documentId, userId }: SignyGenerateShareRequest): Promise<SignyGenerateShareResponse> {
        if (!documentId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await this.getDocumentWithPermission({ documentId, userId });

        const foundShareDocument = await this.getShareDocumentWithPermission({ documentId, userId });

        const url = `${this.signyFileUrl}/${documentId || foundShareDocument?.document_id}`;

        const { data, err: qrError } = await generateQrCode(url);

        if (qrError || !data) {
            throw qrError;
        }

        if (foundShareDocument) {
            return {
                link: foundShareDocument.url,
                qrCodeUrl: Buffer.from(data).toString('base64'),
            };
        }

        await SignyShareDocument.query().insert({
            document_id: documentId,
            user_id: userId,
            url,
            // qr_code: qrCode,
        });

        return {
            link: url,
            qrCodeUrl: Buffer.from(data).toString('base64'),
        };
    }

    async generateShareLinkForSignatory({
        documentId,
        signatoryId,
        userId,
    }: GenerateShareLinkForSignatoryRequest): Promise<GenerateShareLinkForSignatoryResponse> {
        if (!documentId || !userId || !signatoryId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const generatedShared = await this.generateShare({ documentId, userId });

        let signatory = await SignyDocumentSignatories.query().findOne({ id: signatoryId, document_id: documentId });

        if (!signatory) {
            throw ServiceRpcException(ApiEC.SignatoryNotFound);
        }

        const user = await lastValueFrom(
            this.natsClient.send<User, AuthSignUpRequestInternal>(AuthEventType.SignUpLocalInternal, {
                email: signatory?.email,
                phone: signatory?.phone,
                name: signatory?.name,
            })
        );

        signatory = await signatory.$query().patchAndFetch({ user_id: user.id });

        const accessToken = await this.jwtService.signAsync(
            {
                linkData: {
                    email: signatory?.email || signatory?.contact?.email,
                    phone: signatory?.phone || signatory?.contact?.phone,
                    userId: user?.id,
                    documentId,
                },
            },
            this.jwtSignOptions
        );

        return {
            link: `${generatedShared.link}?token=${accessToken}`,
        };
    }

    async shareDocument({
        userId,
        signatories,
        documentId,
        shareType,
    }: SignyShareDocumentRequest): Promise<ApiSuccessResponse> {
        if (!userId || !documentId || !signatories?.length) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        await this.queueProcessesService.addJobToQueue(documentId, userId, signatories, shareType);

        return { ok: true };
    }

    async scheduleShare({
        documentId,
        scheduleDate,
        signatories,
        userId,
        shareType,
    }: SignyScheduleShareRequest): Promise<ApiSuccessResponse> {
        if (!userId || !documentId || !signatories?.length || !scheduleDate) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await this.queueProcessesService.addJobToQueue(documentId, userId, signatories, shareType, scheduleDate);

        return { ok: true };
    }
}
