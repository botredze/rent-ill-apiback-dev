import { Inject, Injectable, Logger } from '@nestjs/common';
import {
    ActionTypes,
    UploadDocumentResponse,
    InsertDocumentRequest,
    ChangeStatusOfDocumentRequest,
    DocumentIdRequest,
    GetDocumentByIdResponse,
    ChangeDocumentStepTypeRequest,
    GetAllUserDocuments,
    GetUserDocumentsRequest,
    GetDocumentWithPermissionRequest,
    UpdateDocumentFilesRequest,
    CreateCustomGroupRequest,
    CreateDocumentCustomGroupResponse,
    SignyDocumentCustomGroupsBaseInfo,
    DeleteGroupRequest,
    UpdateGroupRequest,
    CheckPassCodeRequest,
    UpdateDocumentSettingsRequest,
    GetAllDocumentGroupsAndContactsRequest,
    GetDocumentGrroupsAndContactsResponse,
    AddDocumentToGroupRequest,
    ChangeStatusOfDocumentsBulkRequest,
    AddGroupToFavouriteRequest,
    GetAllUserDocumentGroups,
    GetSentDocumentsRequest,
    CheckPassCodeResponse,
    CreateDocumentFromTemplateRequest,
    GetUserDocumentsCountResponse,
} from '@signy/document';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import {
    Company,
    SignyContact,
    SignyContactCustomGroup,
    SignyDocument,
    SignyDocumentAudit,
    SignyDocumentCustomGroups,
    SignyDocumentInputSettings,
    SignyDocumentSettings,
    SignyDocumentSignatories,
    SignyShareDocument,
    SignySharedUserDocument,
    User,
    UserAnalytic,
} from '@signy/db';
import { AnyQueryBuilder, Transaction } from 'objection';
import { commonConstants, SignyDocumentStatusTypes, StatusType, UserIdRequest } from '@signy/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaginationService } from '@signy/pagination';
import { DriveService } from '@signy/drive';
import { ReadStatusTypes, SigningStatusTypes, SignyBaseInfo } from '@signy/signy';
import { ShareService } from '../share/share.service';
import documentGroups from '@signy/json/document/groups';
import { SignyCustomGroupsBaseInfo } from '@signy/contact';
import { lastValueFrom } from 'rxjs';
import { CreateSignatoryRequest, SignatoryEventTypes } from '@signy/signatory';
import { AuthType } from '@signy/auth';
import { S3Service, uploadConstants } from '@signy/s3';
@Injectable()
export class DocumentService {
    private logger: Logger;
    constructor(
        @Inject('DOCUMENT_SERVICE') private natsClient: ClientProxy,
        private paginationService: PaginationService,
        private signyShareService: ShareService,
        private driveService: DriveService,
        private s3Service: S3Service
    ) {
        this.logger = new Logger(DocumentService.name);
    }

    private async checkContactAndSignatory(documentId: number, userId: number): Promise<ApiSuccessResponse> {
        const document = await SignyDocument.query().withGraphJoined('creator.[profile]').findById(documentId);

        if (!document) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        if (document.creator?.email || document.creator?.phone?.length) {
            const email =
                document.creator.auth_type === AuthType.Email && document.creator?.email
                    ? document.creator.email
                    : document.creator.auth_type !== AuthType.Phone && document.creator?.ext_user_email
                    ? document.creator.ext_user_email
                    : undefined;
            const phone = document.creator?.phone?.length ? document.creator.phone[0] : undefined;
            let contact = await SignyContact.query()
                .modify('active')
                .findOne({ owner_id: userId })
                .where((cb: AnyQueryBuilder) => {
                    if (email && phone) {
                        cb.where({ email }).orWhere({ phone });
                    }
                    if (email && !phone) {
                        cb.where({ email });
                    }
                    if (phone && !email) {
                        cb.where({ phone });
                    }
                    cb.where({ owner_id: userId });
                });

            if (!contact) {
                contact = await SignyContact.query().insertAndFetch({
                    owner_id: userId,
                    email: document.creator?.email ? document.creator.email : undefined,
                    phone: document.creator?.phone?.length ? document.creator.phone[0] : undefined,
                });
            }

            return await lastValueFrom(
                this.natsClient.send<ApiSuccessResponse, CreateSignatoryRequest>(SignatoryEventTypes.CreateSignatory, {
                    userId: userId,
                    contactId: contact.id,
                    documentId: document.id,
                    ownerId: userId,
                    signOrderQueue: null,
                    firstName: document?.creator?.profile?.first_name || undefined,
                    lastName: document?.creator?.profile?.last_name || undefined,
                })
            );
        }

        return { ok: false };
    }

    async uploadDocument({
        mimetype,
        pdfUrl,
        userId,
        extraData,
        pdfKey,
        size,
        uploadDate,
        name,
        isTemplate,
    }: InsertDocumentRequest): Promise<UploadDocumentResponse> {
        if (!pdfUrl || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const trx = await SignyDocument.startTransaction();

        let document: SignyDocument;
        const groups: SignyDocumentCustomGroupsBaseInfo[] = [];
        try {
            document = await SignyDocument.query(trx).insertAndFetch({
                creator_id: userId,
                original_file: { fileUrl: pdfUrl, fileKey: pdfKey, mimetype },
                name,
                size,
                extra_data: extraData,
                upload_date: uploadDate,
                is_template: isTemplate,
            });

            const group = await SignyDocumentCustomGroups.query().modify('active').findOne({ creator_id: userId });
            if (group) {
                groups.push(group.toSignyDocumentCustomGroupsBaseInfo());
            } else {
                for (const x of documentGroups as { title: string; color: string }[]) {
                    const group = await SignyDocumentCustomGroups.query(trx).insertAndFetch({
                        title: x.title,
                        color: x.color,
                        creator_id: userId,
                    });

                    groups.push(group.toSignyDocumentCustomGroupsBaseInfo());
                }
            }

            await SignyDocumentSettings.query(trx).insert({
                document_id: document.id,
            });

            await SignyDocumentAudit.query(trx).insert({
                user_id: userId,
                document_id: document.id,
                action_type: ActionTypes.Prepare,
            });

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        if (!document) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }
        if (isTemplate) {
            await UserAnalytic.query().modify('active').findOne({ user_id: userId }).decrement('templates_count', 1);
        } else {
            await UserAnalytic.query().modify('active').findOne({ user_id: userId }).decrement('documents_count', 1);
        }
        await UserAnalytic.query()
            .modify('active')
            .findOne({ user_id: userId })
            .decrement('storage_capacity_used', size);

        await this.checkContactAndSignatory(document.id, userId);

        return { document: document.toSignyDocumentBaseInfo(), groups };
    }

    async changeStatusOfDocument({
        userId,
        documentId,
        status,
    }: ChangeStatusOfDocumentRequest): Promise<ApiSuccessResponse> {
        if (!userId || !documentId || !status) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const document = await SignyDocument.query().findOne({ id: documentId, creator_id: userId });

        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        await document.$query().patch({ status });

        if (document?.is_template) {
            if (status === SignyDocumentStatusTypes.Active) {
                await UserAnalytic.query()
                    .modify('active')
                    .findOne({ user_id: userId })
                    .decrement('templates_count', 1);
            }
            if (status === SignyDocumentStatusTypes.Deleted) {
                await UserAnalytic.query()
                    .modify('active')
                    .findOne({ user_id: userId })
                    .increment('templates_count', 1);
            }
        } else if (status === SignyDocumentStatusTypes.Deleted) {
            await UserAnalytic.query().modify('active').findOne({ user_id: userId }).increment('documents_count', 1);
        } else if (status === SignyDocumentStatusTypes.Active) {
            await UserAnalytic.query().modify('active').findOne({ user_id: userId }).decrement('documents_count', 1);
        }

        return { ok: true };
    }

    async getIsSameDocumentSign(documentId: number): Promise<boolean> {
        const document = await SignyDocument.query()
            .modify('active')
            .withGraphJoined('[documentSettings, documentSignatories(active)]')
            .findOne({ 'signy_documents.id': documentId });
        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }
        return document.documentSettings.is_same_document_sign;
    }

    async getDocumentWithPermission(
        { documentId, userId }: GetDocumentWithPermissionRequest,
        trx?: Transaction
    ): Promise<SignyDocument> {
        if (!documentId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const document = await SignyDocument.query(trx)
            .modify('active')
            .withGraphJoined('[documentSettings, documentSignatories(active)]')
            .findOne({ 'signy_documents.id': documentId, creator_id: userId });

        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        return document;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async getDocumentStatuses(documents: SignyDocument[], userId: number): Promise<any> {
        const documentStatuses: {
            documentId: number;
            documentSigningStatus: SigningStatusTypes;
            documentVieweStatus: ReadStatusTypes;
        }[] = [];

        for (const x of documents) {
            if (x?.documentSignatories) {
                let documentSigningStatus: SigningStatusTypes;
                let documentVieweStatus: ReadStatusTypes;
                const signingStatuses = x.documentSignatories
                    .filter((x) => x.user_id !== userId)
                    .map(({ signing_status }) => signing_status);
                const checkSignStatus = new Set(signingStatuses).size === 1;
                if (checkSignStatus) {
                    documentSigningStatus = signingStatuses[0] ? signingStatuses[0] : SigningStatusTypes.Done;
                } else if (signingStatuses.includes(SigningStatusTypes.Canceled)) {
                    documentSigningStatus = SigningStatusTypes.Canceled;
                } else if (signingStatuses.includes(SigningStatusTypes.Rejected)) {
                    documentSigningStatus = SigningStatusTypes.Rejected;
                } else if (signingStatuses.includes(SigningStatusTypes.AskForReview)) {
                    documentSigningStatus = SigningStatusTypes.AskForReview;
                } else if (signingStatuses.includes(SigningStatusTypes.Done)) {
                    documentSigningStatus = SigningStatusTypes.Done;
                } else {
                    documentSigningStatus = SigningStatusTypes.Pending;
                }
                const viewStatuses = x.documentSignatories
                    .filter((x) => x.user_id !== userId)
                    .map(({ read_status }) => read_status);
                const checkViewStatus = new Set(viewStatuses).size === 1;
                if (checkViewStatus) {
                    documentVieweStatus = viewStatuses[0] ? viewStatuses[0] : ReadStatusTypes.Read;
                } else if (viewStatuses.includes(ReadStatusTypes.NotSent)) {
                    documentVieweStatus = ReadStatusTypes.NotSent;
                } else if (viewStatuses.includes(ReadStatusTypes.NotReceived)) {
                    documentVieweStatus = ReadStatusTypes.NotReceived;
                } else if (viewStatuses.includes(ReadStatusTypes.Sent)) {
                    documentVieweStatus = ReadStatusTypes.Sent;
                } else {
                    documentVieweStatus = ReadStatusTypes.Read;
                }

                documentStatuses.push({
                    documentId: x.id,
                    documentSigningStatus,
                    documentVieweStatus,
                });
            }
        }

        const documentFilteredStatuses = Object.assign(
            {},
            ...documentStatuses.map((x) => ({ [x.documentId]: { ...x } }))
        );

        return documentFilteredStatuses;
    }

    async getDocumentById({
        documentId,
        userId,
        email,
        phone,
        signatoryId,
        passCode,
    }: DocumentIdRequest): Promise<GetDocumentByIdResponse> {
        if (!documentId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        if (!userId && !email && !phone) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let document = await this.signyShareService.getSharedDocumentWithPermission({
            documentId,
            userId,
            signatoryId,
            passCode,
        });

        document = await document.$query().withGraphJoined('[documentSettings, documentSignatories(active), creator]');

        let isLastSignatory = false;
        if (document?.documentSignatories?.length) {
            const signinStatuses: SigningStatusTypes[] = [];
            for (const x of document.documentSignatories) {
                signinStatuses.push(x.signing_status);
            }

            if (signinStatuses.filter((x) => x == SigningStatusTypes.AskForReview).length > 1) {
                isLastSignatory = false;
            } else if (signinStatuses.filter((x) => x == SigningStatusTypes.Canceled).length > 1) {
                isLastSignatory = false;
            } else if (signinStatuses.filter((x) => x == SigningStatusTypes.Pending).length > 1) {
                isLastSignatory = false;
            } else if (signinStatuses.filter((x) => x == SigningStatusTypes.Rejected).length > 1) {
                isLastSignatory = false;
            } else {
                isLastSignatory = true;
            }
        }
        const user = await User.query().findById(userId);

        if (document.documentSettings.is_drive_synchronization_on && document.creator_id === userId) {
            if (user?.drive_token) {
                const file = await this.s3Service.getFile({
                    url: document.original_file.fileUrl,
                });

                if (file) {
                    await this.driveService.uploadFileToDrive({
                        file,
                        fullPath: `${document.documentSettings.drive_original_file_path}/${
                            document.name?.split('.')[0]
                        }-${new Date().toISOString()}`,
                        userToken: user?.drive_token,
                    });
                }
            }
        }

        const documentFilteredStatuses = await this.getDocumentStatuses([document], userId);

        // const foundGroups = await SignyDocumentCustomGroups.query().modify('active').where({ document_id: documentId });

        const company = await Company.query().modify('active').findOne({ owner_id: userId });

        const groups = await SignyDocumentCustomGroups.query().modify('active');

        return {
            document: {
                ...document?.toSignyDocumentBaseInfo(document.creator_id === userId ? true : false),
                ...documentFilteredStatuses[document.id],
                groups: groups
                    .filter((x) => x.document_ids?.includes(document.id))
                    .map((x) => x.toSignyDocumentCustomGroupsBaseInfo()),
                signatories: document?.documentSignatories?.map((x) => {
                    return {
                        ...x.toSignatoryBaseInfo(),
                        isMe:
                            x?.user_id === userId && x?.email === user?.email
                                ? true
                                : x?.user_id === userId && user?.phone?.length && x.phone === user?.phone[0]
                                ? true
                                : false,
                    };
                }),
            },
            company: company?.toCompanyBaseInfo(),
            isLastSignatory,
            isDriveSyncOn: document?.documentSettings?.is_drive_synchronization_on || false,
        };
    }

    async changeDocumentStepType({ documentId, stepType }: ChangeDocumentStepTypeRequest): Promise<ApiSuccessResponse> {
        if (!documentId || !stepType) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const document = await SignyDocument.query().modify('active').findOne({ id: documentId });

        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        await document.$query().patch({ step_type: stepType });

        return { ok: true };
    }

    async getUserDocuments({
        userId,
        pageInfo,
        signingStatus,
        status,
        groupId,
        isTemplate,
    }: GetUserDocumentsRequest): Promise<GetAllUserDocuments> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let documentIds: number[] | undefined;
        if (groupId) {
            documentIds = (
                await SignyDocumentCustomGroups.query()
                    .select('document_ids')
                    .findOne({ id: groupId, creator_id: userId })
            )?.document_ids;

            if (!documentIds?.length) {
                return {
                    document: [],
                    pageInfo: this.paginationService.toPageInfoDTO({
                        total: 0,
                        ...pageInfo,
                    }),
                };
            }
        }
        const { pageIndex, itemsPerPage } = pageInfo ?? {};

        const { results, total } = await SignyDocument.query()
            .withGraphJoined(`[documentSettings, documentSignatories(active)]`)
            .where((cb: AnyQueryBuilder) => {
                cb.where({ 'signy_documents.creator_id': userId });

                if (groupId && documentIds?.length) {
                    cb.whereIn('signy_documents.id', documentIds);
                }

                if (status) {
                    cb.where({ 'signy_documents.status': status });
                }
                if (isTemplate) {
                    cb.where({ 'signy_documents.is_template': isTemplate });
                } else {
                    cb.where({ 'signy_documents.is_template': false });
                }
            })
            .orderBy('created_at', 'DESC')
            .page(pageIndex ? pageIndex - 1 : 0, itemsPerPage ?? commonConstants.maxSearchItemsPerPage);

        const documentFilteredStatuses = await this.getDocumentStatuses(results, userId);

        const groups = await SignyDocumentCustomGroups.query().modify('active');

        const document = [];
        if (signingStatus) {
            for (const x of results) {
                if (documentFilteredStatuses[x.id]['documentSigningStatus'] === signingStatus) {
                    document.push({
                        ...x.toSignyDocumentBaseInfo(x.creator_id === userId ? true : false),
                        ...documentFilteredStatuses[x.id],
                        groups: groups
                            .filter((y) => y.document_ids?.includes(x.id) || y.creator_id === userId)
                            .map((z) => z.toSignyDocumentCustomGroupsBaseInfo()),
                        signatories: x?.documentSignatories?.map((x) => x.toSignatoryBaseInfo()),
                    });
                }
            }
        }

        return {
            document: signingStatus
                ? document
                : results.map((x) => {
                      return {
                          ...x.toSignyDocumentBaseInfo(x.creator_id === userId ? true : false),
                          ...documentFilteredStatuses[x.id],
                          groups: groups
                              .filter((y) => y.document_ids?.includes(x.id))
                              .map((z) => z.toSignyDocumentCustomGroupsBaseInfo()),
                          signatories: x?.documentSignatories?.map((x) => x.toSignatoryBaseInfo()),
                      };
                  }),
            pageInfo: this.paginationService.toPageInfoDTO({
                total: signingStatus ? document.length : total,
                ...pageInfo,
            }),
        };
    }

    async updateDocumentFiles({ documentId, files }: UpdateDocumentFilesRequest): Promise<ApiSuccessResponse> {
        const document = await SignyDocument.query().modify('active').findOne({ id: documentId });
        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        await document.$query().patchAndFetch({ file: files });
        return { ok: true };
    }

    async createCustomGroup({
        color,
        documentIds,
        title,
        userId,
    }: CreateCustomGroupRequest): Promise<CreateDocumentCustomGroupResponse> {
        if (!color || !title || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let foundGroup = await SignyDocumentCustomGroups.query()
            .modify('active')
            .findOne({ color, title, 'signy_document_custom_groups.creator_id': userId });

        if (!foundGroup) {
            foundGroup = await SignyDocumentCustomGroups.query().insertAndFetch({
                document_ids: documentIds,
                color,
                title,
                creator_id: userId,
            });
        }

        return { group: foundGroup.toSignyDocumentCustomGroupsBaseInfo() };
    }

    async deleteGroup({ groupId, userId }: DeleteGroupRequest): Promise<ApiSuccessResponse> {
        if (!userId || !groupId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const foundGroup = await SignyDocumentCustomGroups.query()
            .modify('active')
            .findOne({ id: groupId, creator_id: userId });

        if (!foundGroup) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        await foundGroup.$query().patch({ status: StatusType.Deleted });

        return { ok: true };
    }

    async updateGroup({ groupId, userId, color, title }: UpdateGroupRequest): Promise<ApiSuccessResponse> {
        if (!userId || !groupId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const group = await SignyDocumentCustomGroups.query()
            .modify('active')
            .findOne({ id: groupId, creator_id: userId });

        if (!group) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        await group.$query().patch({
            color,
            title,
        });

        return { ok: true };
    }

    async checkPassCode({ documentId, passCode, userId }: CheckPassCodeRequest): Promise<CheckPassCodeResponse> {
        if (!documentId || !passCode) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const document = await SignyDocument.query()
            .modify('active')
            .withGraphJoined('documentSettings')
            .findById(documentId);

        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        if (document?.documentSettings?.pass_code && document.documentSettings.pass_code !== passCode) {
            throw ServiceRpcException(ApiEC.InvalidPassCode);
        }

        return {
            isPassed: true,
            isOwner: document?.creator_id === userId,
        };
    }

    async updateDocumentSettings({
        documentId,
        userId,
        settings,
    }: UpdateDocumentSettingsRequest): Promise<ApiSuccessResponse> {
        if (!documentId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const documentSettings = await SignyDocumentSettings.query()
            .modify('active')
            .withGraphJoined('document')
            .findOne({ document_id: documentId });

        if (documentSettings && Object.keys(settings).includes('isEditable') && Object.keys(settings).length === 1) {
            await documentSettings.$query().patch({
                is_editable: settings?.isEditable,
            });

            return { ok: true };
        }

        if (!documentSettings || documentSettings.document?.creator_id !== userId) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        if (settings?.stepLevel) {
            await documentSettings.document.$query().patch({ step_level: settings?.stepLevel });
        }

        await documentSettings.$query().patch({
            expiration_date: settings?.expirationDate,
            reminders_schedule: settings.remindersSchedule,
            is_required_for_everyone: settings?.isRequiredForEveryone,
            is_sign_order_exists: settings?.isSignOrderExists,
            is_private: settings?.isPrivate,
            notify_me: settings?.notifyMe,
            notification_lang: settings?.notificationLang,
            is_show_signature_on: settings?.isShowSignatureOn,
            is_verify_signature_on: settings?.isVerifySignatureOn,
            is_branding_exists: settings?.isBrandingExists,
            is_same_document_sign: settings?.isSameDocumentSign,
            brand_logo: settings?.brandLogo,
            horizontal_stack: settings?.horizontalStack,
            is_one_question_on_the_screen: settings?.isOneQuestionOnTheScreen,
            background_color: settings?.backgroundColor,
            brightness_percentage: settings?.brightnessPercentage,
            blur_percentage: settings?.blurPercentage,
            is_allow_return_to_previous_screen: settings?.isAllowReturnToPreviousScreen,
            send_progress_to_members: settings?.sendProgressToMembers,
            input_location: settings?.inputLocation,
            theme: settings?.theme,
            pass_code: settings?.passCode,
            is_drive_synchronization_on: settings?.isDriveSyncOn,
            drive_original_file_path: settings?.driveOriginalFilePath,
            drive_signed_file_path: settings?.driveSignedFilePath,
            is_editable: settings?.isEditable,
        });

        return { ok: true };
    }

    async getAllDocumentGroupsAndContacts({
        userId,
        documentId,
    }: GetAllDocumentGroupsAndContactsRequest): Promise<GetDocumentGrroupsAndContactsResponse> {
        if (!userId || !documentId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        await this.getDocumentWithPermission({ userId, documentId });

        const inputs = await SignyDocumentInputSettings.query().modify('active').where({ document_id: documentId });

        const contacts: SignyBaseInfo[] = [];
        const groups: SignyCustomGroupsBaseInfo[] = [];
        for (const x of inputs) {
            if (x?.contact_recipients?.length) {
                contacts.push(
                    ...(
                        await SignyContact.query()
                            .withGraphJoined('signatory')
                            .modify('active')
                            .whereIn('signy_contacts.id', x.contact_recipients)
                    ).map((x) => x.toSignyContactsBaseInfo())
                );
            }
            if (x?.group_recipients?.length) {
                groups.push(
                    ...(await SignyContactCustomGroup.query().modify('active').whereIn('id', x.group_recipients)).map(
                        (x) => x.toSignyCustomGroupsBaseInfo()
                    )
                );
            }
        }

        return {
            contacts: [...new Map(contacts.map((item) => [item.id, item])).values()],
            groups: [...new Map(groups.map((item) => [item.id, item])).values()],
        };
    }

    async addDocumentToGroup({ documentId, userId, groupId }: AddDocumentToGroupRequest): Promise<ApiSuccessResponse> {
        if (!documentId || !groupId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await this.getDocumentWithPermission({ userId, documentId });

        const group = await SignyDocumentCustomGroups.query().modify('active').findById(groupId);

        if (!group || group?.creator_id !== userId) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        await group
            .$query()
            .patch({ document_ids: group?.document_ids ? [...group.document_ids, documentId] : [documentId] });

        return { ok: true };
    }

    async changeStatusOfDocumentsBulk({
        documentIds,
        status,
        userId,
    }: ChangeStatusOfDocumentsBulkRequest): Promise<ApiSuccessResponse> {
        if (!documentIds?.length || !status || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await SignyDocument.query().patch({ status }).whereIn('id', documentIds).where({ creator_id: userId });

        return { ok: true };
    }

    async addGroupToFavourite({ groupId, userId }: AddGroupToFavouriteRequest): Promise<ApiSuccessResponse> {
        if (!groupId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const group = await SignyDocumentCustomGroups.query().findOne({ id: groupId, creator_id: userId });

        if (!group) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        await group.$query().patch({ is_favourite: group.is_favourite ? false : true });

        return { ok: true };
    }

    async getAllUserDocumentGroups({ userId }: UserIdRequest): Promise<GetAllUserDocumentGroups> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const groups = await SignyDocumentCustomGroups.query().modify('active').where({ creator_id: userId });

        return {
            groups: groups.map((x) => x.toSignyDocumentCustomGroupsBaseInfo()),
        };
    }

    async getSentDocuments({ userId, pageInfo }: GetSentDocumentsRequest): Promise<GetAllUserDocuments> {
        const { pageIndex, itemsPerPage } = pageInfo ?? {};

        const sharedDocuments = (await SignyShareDocument.query().select('document_id').where({ user_id: userId })).map(
            ({ document_id }) => document_id
        );

        const { results, total } = await SignyDocument.query()
            .withGraphJoined(`[documentSettings, documentSignatories(active)]`)
            .whereIn('signy_documents.id', sharedDocuments)
            .page(pageIndex ? pageIndex - 1 : 0, itemsPerPage ?? commonConstants.maxSearchItemsPerPage);

        const documentFilteredStatuses = await this.getDocumentStatuses(results, userId);

        const groups = await SignyDocumentCustomGroups.query().modify('active');
        return {
            document: results.map((x) => {
                return {
                    ...x.toSignyDocumentBaseInfo(x.creator_id === userId ? true : false),
                    ...documentFilteredStatuses[x.id],
                    groups: groups
                        .filter((y) => y.document_ids?.includes(x.id))
                        .map((z) => z.toSignyDocumentCustomGroupsBaseInfo()),
                    signatories: x?.documentSignatories?.map((x) => x.toSignatoryBaseInfo()),
                };
            }),
            pageInfo: this.paginationService.toPageInfoDTO({
                total,
                ...pageInfo,
            }),
        };
    }

    async getRecievedDocuments({ userId, pageInfo }: GetSentDocumentsRequest): Promise<GetAllUserDocuments> {
        const { pageIndex, itemsPerPage } = pageInfo ?? {};
        const user = await User.query().findById(userId);
        const signatoryIds = (
            await SignyDocumentSignatories.query()
                .select('id')
                .modify('active')
                .where((cb: AnyQueryBuilder) => {
                    if (user?.email) {
                        cb.orWhere({ email: user.email });
                    }
                    if (user?.phone?.length) {
                        cb.orWhere({ phone: user.phone[0] });
                    }

                    cb.orWhere({ user_id: userId });
                })
        ).map(({ id }) => id);

        if (!signatoryIds?.length) {
            return {
                document: [],
                pageInfo: this.paginationService.toPageInfoDTO({
                    total: 0,
                    ...pageInfo,
                }),
            };
        }

        const sharedDocuments = (
            await SignySharedUserDocument.query().select('document_id').whereIn('signy_signatory_id', signatoryIds)
        ).map(({ document_id }) => document_id);

        const { results, total } = await SignyDocument.query()
            .withGraphJoined(`[documentSettings, documentSignatories(active)]`)
            .whereIn('signy_documents.id', sharedDocuments)
            .page(pageIndex ? pageIndex - 1 : 0, itemsPerPage ?? commonConstants.maxSearchItemsPerPage);

        const documentFilteredStatuses = await this.getDocumentStatuses(results, userId);

        const groups = await SignyDocumentCustomGroups.query().modify('active');
        return {
            document: results.map((x) => {
                return {
                    ...x.toSignyDocumentBaseInfo(x.creator_id === userId ? true : false),
                    ...documentFilteredStatuses[x.id],
                    groups: groups
                        .filter((y) => y.document_ids?.includes(x.id))
                        .map((z) => z.toSignyDocumentCustomGroupsBaseInfo()),
                    signatories: x?.documentSignatories?.map((x) => x.toSignatoryBaseInfo()),
                };
            }),
            pageInfo: this.paginationService.toPageInfoDTO({
                total,
                ...pageInfo,
            }),
        };
    }

    async checkIfPassCodeExixsts({ documentId }: GetAllDocumentGroupsAndContactsRequest): Promise<ApiSuccessResponse> {
        if (!documentId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const document = await SignyDocument.query()
            .modify('active')
            .withGraphJoined('documentSettings')
            .findById(documentId);

        if (!document) {
            throw ServiceRpcException(ApiEC.SignyDocumentNotFound);
        }

        return {
            ok: !!document?.documentSettings?.pass_code,
        };
    }

    async createDocumentFromTemplateRequest({
        templateId,
        userId,
        extraData,
        isTemplate,
    }: CreateDocumentFromTemplateRequest): Promise<UploadDocumentResponse> {
        if (!templateId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const template = await SignyDocument.query()
            .modify('template')
            .findOne({ id: templateId, creator_id: userId, is_template: true });

        if (!template) {
            throw ServiceRpcException(ApiEC.TemplateNotFound);
        }

        const size = template?.size
            ? template.size
            : await this.s3Service.getFileSize({ key: template.original_file.fileKey });

        const createdDocument = await this.uploadDocument({
            extraData,
            pdfUrl: template.original_file.fileUrl,
            pdfKey: template.original_file.fileKey,
            mimetype: template?.original_file?.mimetype || uploadConstants.defaultPdfMimetype,
            name: template.name || undefined,
            userId,
            uploadDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            size,
            isTemplate,
        });

        const inputs = await SignyDocumentInputSettings.query().modify('active').where({ document_id: templateId });

        if (inputs?.length) {
            for (const y of inputs) {
                const x: Partial<SignyDocumentInputSettings> = y;

                delete x.id;
                delete x.document;
                delete x.document_id;

                await SignyDocumentInputSettings.query().insert({
                    ...x,
                    is_bold_on: x?.is_bold_on || false,
                    is_date: x?.is_date || false,
                    is_duration: x?.is_duration || false,
                    is_edit_available: x?.is_edit_available || false,
                    is_italic_on: x?.is_italic_on || false,
                    is_range_one: x?.is_range_one || false,
                    is_range_zero: x?.is_range_zero || false,
                    is_required_on: x?.is_required_on || false,
                    is_select_checkmark_on: x?.is_select_checkmark_on || false,
                    is_show_labels_on: x?.is_show_labels_on || false,
                    is_time: x?.is_time || false,
                    is_underline_on: x?.is_underline_on || false,
                    validtion_type: x?.validtion_type || undefined,
                    date_format: x?.date_format || undefined,
                    float: x?.float || undefined,
                    document_id: createdDocument.document.id,
                });
            }
        }

        return createdDocument;
    }

    async createTemplateFromDocument({
        documentId,
        userId,
    }: GetAllDocumentGroupsAndContactsRequest): Promise<UploadDocumentResponse> {
        if (!documentId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const document = await SignyDocument.query().findOne({
            id: documentId,
            creator_id: userId,
            is_template: false,
        });

        if (!document) {
            throw ServiceRpcException(ApiEC.TemplateNotFound);
        }

        const size = document?.size
            ? document.size
            : await this.s3Service.getFileSize({ key: document.original_file.fileKey });

        const createdDocument = await this.uploadDocument({
            extraData: document?.extra_data || undefined,
            pdfUrl: document.original_file.fileUrl,
            pdfKey: document.original_file.fileKey,
            mimetype: document?.original_file?.mimetype || uploadConstants.defaultPdfMimetype,
            name: document.name || undefined,
            userId,
            uploadDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            size,
            isTemplate: true,
        });

        const inputs = await SignyDocumentInputSettings.query().modify('active').where({ document_id: documentId });

        if (inputs?.length) {
            for (const y of inputs) {
                const x: Partial<SignyDocumentInputSettings> = y;

                delete x.id;
                delete x.document;
                delete x.document_id;

                await SignyDocumentInputSettings.query().insert({
                    ...x,
                    is_bold_on: x?.is_bold_on || false,
                    is_date: x?.is_date || false,
                    is_duration: x?.is_duration || false,
                    is_edit_available: x?.is_edit_available || false,
                    is_italic_on: x?.is_italic_on || false,
                    is_range_one: x?.is_range_one || false,
                    is_range_zero: x?.is_range_zero || false,
                    is_required_on: x?.is_required_on || false,
                    is_select_checkmark_on: x?.is_select_checkmark_on || false,
                    is_show_labels_on: x?.is_show_labels_on || false,
                    is_time: x?.is_time || false,
                    is_underline_on: x?.is_underline_on || false,
                    validtion_type: x?.validtion_type || undefined,
                    date_format: x?.date_format || undefined,
                    float: x?.float || undefined,
                    document_id: createdDocument.document.id,
                });
            }
        }

        return createdDocument;
    }

    async getUserDocumentsCount({ userId }: UserIdRequest): Promise<GetUserDocumentsCountResponse> {
        const results = await SignyDocument.query().modify('active').where({ creator_id: userId });

        return {
            documentsCount: results.filter((x) => !x.is_template).length || 0,
        };
    }
}
