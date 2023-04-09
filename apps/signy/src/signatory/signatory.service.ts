import { Injectable, Logger } from '@nestjs/common';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import {
    AddSignatoryInputHistoryRequest,
    AddSignatoryRequest,
    CreateSignatoryRequest,
    DeleteSignatoryRequest,
    GetDocumentInputHistoryResponse,
    IsPassCodeExistsRequest,
    SearchSignatoriesWithFilterRequest,
    SearchSignatoryWithFilterResponse,
    SignatoriesSearchTypes,
    SignOrderBulkUpdateRequest,
    UpdateSignatoryRequest,
    InsertSignatureRequest,
    UploadSignatureResponse,
    DeleteSignatureRequest,
} from '@signy/signatory';
import { DocumentService } from '../document/document.service';
import {
    SignyContact,
    SignyDocument,
    SignyDocumentInputHistory,
    SignyDocumentInputSettings,
    SignyDocumentSignatories,
    User,
} from '@signy/db';
import { ContactService } from '../contact/contact.service';
import { commonConstants, StatusType } from '@signy/common';
import { AnyQueryBuilder, raw } from 'objection';
import { PaginationService } from '@signy/pagination';
import { DocumentIdRequest } from '@signy/document';
@Injectable()
export class SignatoryService {
    private logger: Logger;
    constructor(
        private documentService: DocumentService,
        public contactService: ContactService,
        private paginationService: PaginationService
    ) {
        this.logger = new Logger(SignatoryService.name);
    }

    async signatoryDbProfile({
        documentId,
        signatoryId,
        userId,
        signOrderQueue,
        contactId,
        existingUserId,
        firstName,
        lastName,
        email,
        phone,
        whatsapp,
        telegram,
        telegramNick,
        role,
        is2faOn,
        isSelfieWithIdOn,
        isVideoRecordOn,
        passCode,
        groupId,
        color,
        signatureType,
        ownerId,
        signingStatus,
        readStatus,
        isVisible = false,
    }: Partial<UpdateSignatoryRequest>): Promise<Partial<SignyDocumentSignatories>> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        let contact: SignyContact | undefined;
        if (!signatoryId) {
            if (contactId) {
                contact = await this.contactService.getContactById({ contactId, userId });
                if (groupId) {
                    await contact.$query().patch({
                        group_ids: contact?.group_ids ? [...contact.group_ids, groupId] : [groupId],
                    });
                }

                if (contact) {
                    const foundSignatory = !!(await SignyDocumentSignatories.query()
                        .modify('active')
                        .findOne({ contact_id: contactId, document_id: documentId }));
                    if (foundSignatory) {
                        throw ServiceRpcException(ApiEC.SignatoryExists);
                    }
                }
            } else if (!contactId) {
                const foundContactId = await this.contactService.findContact({
                    email,
                    phone,
                    whatsapp,
                    telegram,
                    telegramNick,
                });

                if (foundContactId) {
                    const foundContact = await this.contactService.getContactById({
                        contactId: foundContactId,
                        userId,
                    });

                    if (groupId) {
                        await foundContact.$query().patch({
                            group_ids: foundContact?.group_ids ? [...foundContact.group_ids, groupId] : [groupId],
                        });
                    }

                    contactId = foundContactId;
                } else {
                    await this.contactService.createNewContact({
                        userId,
                        groupId,
                        firstName,
                        lastName,
                        email,
                        phone,
                        whatsapp,
                        telegram,
                        telegramNick,
                    });

                    contactId = await this.contactService.findContact({
                        email,
                        phone,
                        whatsapp,
                        telegram,
                        telegramNick,
                    });
                }
            }
        }
        if (existingUserId) {
            const user = await User.query().modify('active').findById(existingUserId);
            if (!user) {
                throw ServiceRpcException(ApiEC.UserNotFound);
            }
        }

        if (email) {
            const foundSignatory = !!(await SignyDocumentSignatories.query().modify('active').findOne({ email }));
            if (foundSignatory) {
                throw ServiceRpcException(ApiEC.SignatoryExists);
            }
        }
        if (phone) {
            const foundSignatory = !!(await SignyDocumentSignatories.query().modify('active').findOne({ phone }));
            if (foundSignatory) {
                throw ServiceRpcException(ApiEC.SignatoryExists);
            }
        }
        if (whatsapp) {
            const foundSignatory = !!(await SignyDocumentSignatories.query().modify('active').findOne({ whatsapp }));
            if (foundSignatory) {
                throw ServiceRpcException(ApiEC.SignatoryExists);
            }
        }
        if (telegram) {
            const foundSignatory = !!(await SignyDocumentSignatories.query().modify('active').findOne({ telegram }));
            if (foundSignatory) {
                throw ServiceRpcException(ApiEC.SignatoryExists);
            }
        }
        if (telegramNick) {
            const foundSignatory = !!(await SignyDocumentSignatories.query()
                .modify('active')
                .findOne({ telegram_nick: telegramNick }));
            if (foundSignatory) {
                throw ServiceRpcException(ApiEC.SignatoryExists);
            }
        }
        const fullName: string[] = [];
        if (firstName) {
            fullName.push(firstName);
        }
        if (lastName) {
            fullName.push(lastName);
        }

        return {
            document_id: documentId,
            signing_status: signingStatus,
            contact_id: contactId,
            user_id: ownerId || undefined,
            sign_order_queue: signOrderQueue,
            temp_user_id: !signatoryId ? Math.floor(Math.random() * commonConstants.maxIdLength) : undefined,
            name: fullName.length ? fullName.join(' ') : contact?.fullName ? contact.fullName : undefined,
            email: email || contact?.email,
            phone: phone || contact?.phone,
            whatsapp: whatsapp || contact?.whatsapp,
            telegram: telegram || contact?.telegram,
            telegram_nick: telegramNick || contact?.telegram_nick,
            roles: role,
            is_2fa_on: is2faOn,
            is_selfie_with_id_on: isSelfieWithIdOn,
            is_video_record_on: isVideoRecordOn,
            pass_code: passCode,
            signature_type: signatureType,
            read_status: readStatus,
            is_visible: isVisible,
            color,
        };
    }
    async createSignatory(dto: CreateSignatoryRequest): Promise<ApiSuccessResponse> {
        const dbProfile = await this.signatoryDbProfile(dto);

        await SignyDocumentSignatories.query().insertAndFetch({ ...dbProfile });

        return { ok: true };
    }

    async updateSignatory(dto: UpdateSignatoryRequest): Promise<ApiSuccessResponse> {
        if (!dto.signatoryId || !dto?.userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const signatory = await SignyDocumentSignatories.query()
            .modify('active')
            .withGraphJoined('user')
            .findById(dto.signatoryId);

        if (!signatory) {
            throw ServiceRpcException(ApiEC.SignatoryNotFound);
        }

        let signOrderQueue: number | undefined;
        if (dto?.signOrderQueue) {
            signOrderQueue = dto?.signOrderQueue;
            if (signatory?.sign_order_queue && dto?.signOrderQueue !== signatory.sign_order_queue) {
                const foundSameQueue = await SignyDocumentSignatories.query()
                    .modify('active')
                    .where({ sign_order_queue: signatory.sign_order_queue })
                    .whereNot({ id: signatory.id })
                    .andWhere({ document_id: signatory.document_id });

                if (!foundSameQueue?.length) {
                    const signatories = await SignyDocumentSignatories.query()
                        .modify('active')
                        .where('sign_order_queue', '>', signatory.sign_order_queue)
                        .andWhere({ document_id: signatory.document_id });

                    for (const y of signatories) {
                        if (y?.sign_order_queue && y?.sign_order_queue > signatory.sign_order_queue) {
                            await y.$query().patchAndFetch({ sign_order_queue: y.sign_order_queue - 1 });
                        }
                    }
                }
            }

            const highestOrderQueue = await SignyDocumentSignatories.query()
                .modify('active')
                .where({ document_id: signatory.document_id })
                .andWhereNot({ id: signatory.id })
                .max('sign_order_queue as sign_order_queue')
                .first();

            if (highestOrderQueue?.sign_order_queue && dto?.signOrderQueue > highestOrderQueue.sign_order_queue) {
                signOrderQueue = highestOrderQueue.sign_order_queue + 1;
            }
        }

        const dbProfile = await this.signatoryDbProfile({ ...dto, documentId: signatory.document_id, signOrderQueue });

        if (dto?.nationalId) {
            await signatory.user?.$query().patch({ national_id: dto.nationalId });
        }

        await signatory.$query().patch({ ...dbProfile });

        return { ok: true };
    }

    async addSignatoryToDocument({
        userId,
        documentId,
        inputId,
        userIds,
    }: AddSignatoryRequest): Promise<ApiSuccessResponse> {
        if (!userId || !documentId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const trx = await SignyDocument.startTransaction();

        try {
            const document = await this.documentService.getDocumentWithPermission({ documentId, userId }, trx);

            if (!userIds?.length) {
                if (!document?.documentSignatories?.length) {
                    return { ok: false };
                } else {
                    userIds = document.documentSignatories.map(({ id }) => id).sort((a: number, b: number) => a - b);
                }
            }
            const documentSignatories = await SignyDocumentSignatories.query(trx)
                .modify('active')
                .whereIn('id', userIds);

            if (userIds?.length !== documentSignatories?.length) {
                throw ServiceRpcException(ApiEC.UserNotExists);
            }

            if (!inputId) {
                const allInputs = await SignyDocumentInputSettings.query(trx)
                    .modify('active')
                    .where({ document_id: document.id });

                for (const x of allInputs) {
                    const contactRecepinest = x?.contact_recipients
                        ? [...new Set([...x.contact_recipients, ...userIds])]
                        : userIds;
                    await x
                        .$query(trx)
                        .patch({ contact_recipients: contactRecepinest.sort((a: number, b: number) => a - b) });
                }
            } else if (inputId) {
                await SignyDocumentInputSettings.query(trx).patchAndFetchById(inputId, {
                    contact_recipients: [...userIds],
                });
            }

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        return { ok: true };
    }

    async searchSignatoriesWithFilter({
        userId,
        contactId,
        documentId,
        id,
        roles,
        search,
        searchType,
        signatureType,
        signingStatus,
        pageInfo,
    }: SearchSignatoriesWithFilterRequest): Promise<SearchSignatoryWithFilterResponse> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const { pageIndex, itemsPerPage } = pageInfo ?? {};

        const { results, total } = await SignyDocumentSignatories.query()
            .modify('active')
            .select(
                '*',
                raw(
                    search && searchType === SignatoriesSearchTypes.Name && search?.length > 3
                        ? `MATCH (${SignyDocumentSignatories.tableName}.name ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : search && searchType === SignatoriesSearchTypes.Email && search?.length > 3
                        ? `MATCH (${SignyDocumentSignatories.tableName}.email ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : search && searchType === SignatoriesSearchTypes.Phone && search?.length > 3
                        ? `MATCH (${SignyDocumentSignatories.tableName}.phone ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : search && searchType === SignatoriesSearchTypes.Telegram && search?.length > 3
                        ? `MATCH (${SignyDocumentSignatories.tableName}.telegram ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : search && searchType === SignatoriesSearchTypes.TelegramNick && search?.length > 3
                        ? `MATCH (${SignyDocumentSignatories.tableName}.telegram_nick ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : search && searchType === SignatoriesSearchTypes.Whatsapp && search?.length > 3
                        ? `MATCH (${SignyDocumentSignatories.tableName}.whatsapp ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : '? as searchScore',
                    [search ? `${search.trim()}*` : 0]
                )
            )
            .where((cb: AnyQueryBuilder) => {
                if (search) {
                    if (searchType === SignatoriesSearchTypes.Name) {
                        if (search?.length > 3) {
                            cb.whereRaw('MATCH (name) AGAINST (?  IN BOOLEAN MODE)', [`${search.trim()}*`]);
                        } else {
                            cb.whereRaw('(name LIKE CONCAT(?, "%"))', [search.trim()]);
                        }
                    }
                    if (searchType === SignatoriesSearchTypes.Email) {
                        if (search?.length > 3) {
                            cb.whereRaw('MATCH (email) AGAINST (?  IN BOOLEAN MODE)', [`"${search.trim()}*"`]);
                        } else {
                            cb.whereRaw('(email LIKE CONCAT(?, "%"))', [search.trim()]);
                        }
                    }
                    if (searchType === SignatoriesSearchTypes.Phone) {
                        if (search?.length > 3) {
                            cb.whereRaw('MATCH (phone) AGAINST (?  IN BOOLEAN MODE)', [`${search.trim()}*`]);
                        } else {
                            cb.whereRaw('(phone LIKE CONCAT(?, "%"))', [search.trim()]);
                        }
                    }

                    if (searchType === SignatoriesSearchTypes.Telegram) {
                        if (search?.length > 3) {
                            cb.whereRaw('MATCH (telegram) AGAINST (?  IN BOOLEAN MODE)', [`${search.trim()}*`]);
                        } else {
                            cb.whereRaw('(telegram LIKE CONCAT(?, "%"))', [search.trim()]);
                        }
                    }
                    if (searchType === SignatoriesSearchTypes.TelegramNick) {
                        if (search?.length > 3) {
                            cb.whereRaw('MATCH (telegram_nick) AGAINST (?  IN BOOLEAN MODE)', [`${search.trim()}*`]);
                        } else {
                            cb.whereRaw('(telegram_nick LIKE CONCAT(?, "%"))', [search.trim()]);
                        }
                    }
                    if (searchType === SignatoriesSearchTypes.Whatsapp) {
                        if (search?.length > 3) {
                            cb.whereRaw('MATCH (whatsapp) AGAINST (?  IN BOOLEAN MODE)', [`${search.trim()}*`]);
                        } else {
                            cb.whereRaw('(whatsapp LIKE CONCAT(?, "%"))', [search.trim()]);
                        }
                    }
                }
                if (id) {
                    cb.findOne({ id });
                }
                if (contactId) {
                    cb.where({ contact_id: contactId });
                }
                if (documentId) {
                    cb.where({ document_id: documentId });
                }
                if (roles) {
                    cb.where({ roles });
                }
                if (signatureType) {
                    cb.where({ signature_type: signatureType });
                }
                if (signingStatus) {
                    cb.where({ signing_status: signingStatus });
                }
            })
            .orderBy([{ column: 'searchScore', order: 'DESC' }])
            .page(pageIndex ? pageIndex - 1 : 0, itemsPerPage ?? commonConstants.maxSearchItemsPerPage);

        return {
            signatories: results.map((x) => x?.toSignatoryBaseInfo()) || [],
            pageInfo: this.paginationService.toPageInfoDTO({ total, ...pageInfo }),
        };
    }

    async addInputHistory({
        inputSettingsId,
        signatoryId,
        attachments,
        value,
        valueJson,
        userId,
    }: AddSignatoryInputHistoryRequest): Promise<ApiSuccessResponse> {
        if (!value && !attachments?.length && !valueJson?.length) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const inputSettings = await SignyDocumentInputSettings.query()
            .withGraphJoined('document.[documentSettings]')
            .modify('active')
            .findById(inputSettingsId);

        if (!inputSettings) {
            throw ServiceRpcException(ApiEC.SignyInputNotFound);
        }
        let foundSignatory;
        if (inputSettings.document?.documentSettings.is_private) {
            if (!signatoryId) {
                throw ServiceRpcException(ApiEC.WrongInput);
            }

            foundSignatory = await SignyDocumentSignatories.query().modify('active').findById(signatoryId);
        } else if (!inputSettings.document?.documentSettings.is_private) {
            const user = await User.query().findById(userId);

            if (!user) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }

            foundSignatory = await SignyDocumentSignatories.query()
                .modify('active')
                .where((cb: AnyQueryBuilder) => {
                    if (user?.email) {
                        cb.where({ email: user?.email });
                    }
                    if (user?.phone?.length) {
                        cb.orWhere({ phone: user?.phone?.length ? user.phone[0] : undefined });
                    }
                    cb.orWhere({ user_id: user.id });
                })

                .first();

            if (!foundSignatory && !signatoryId) {
                const contact = await SignyContact.query().findOne((cb: AnyQueryBuilder) => {
                    if (user?.email) {
                        cb.findOne({ email: user.email });
                    }
                    if (!user?.email && user?.phone?.length) {
                        cb.findOne({ phone: user.phone[0] });
                    }

                    cb.where({ owner_id: user.id });
                });
                if (!contact) {
                    throw ServiceRpcException(ApiEC.InternalServerError);
                }
                foundSignatory = await SignyDocumentSignatories.query().insertAndFetch({
                    contact_id: contact.id,
                    document_id: inputSettings.document_id,
                    email: user?.email || contact?.email,
                    phone: user?.phone?.length ? user.phone[0] : contact?.phone,
                });
            }
        }

        if (!foundSignatory || !foundSignatory?.contact_id) {
            throw ServiceRpcException(ApiEC.SignatoryNotFound);
        }

        //TODO check if signatory exists in custom group
        // const foundInGroup = await SignyContactCustomGroup.query()
        //     .modify('active')
        //     .whereIn('id', inputSettings.group_recipients);

        if (
            !inputSettings.contact_recipients?.includes(foundSignatory.contact_id) &&
            inputSettings.document?.documentSettings.is_private
        ) {
            return { ok: false };
        }

        const foundInputHistory = await SignyDocumentInputHistory.query().findOne({
            input_settings_id: inputSettingsId,
            signatory_id: foundSignatory.id,
        });

        if (foundInputHistory) {
            await foundInputHistory.$query().patch({
                value,
                value_json: valueJson,
                attachments,
            });
        } else {
            await SignyDocumentInputHistory.query().insert({
                input_settings_id: inputSettingsId,
                signatory_id: foundSignatory.id,
                value,
                value_json: valueJson,
                attachments,
            });
        }

        return { ok: true };
    }

    async isPassCodeExists({ signatoryId, email, phone }: IsPassCodeExistsRequest): Promise<boolean> {
        if (!signatoryId && !email && !phone) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const foundSignatory = await SignyDocumentSignatories.query()
            .modify('active')
            .findOne((cb: AnyQueryBuilder) => {
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

        return !!foundSignatory?.pass_code;
    }

    async getDocumentInputHistory({ documentId }: DocumentIdRequest): Promise<GetDocumentInputHistoryResponse> {
        if (!documentId) throw ServiceRpcException(ApiEC.WrongInput);

        const inputSettingsIds = (
            await SignyDocumentInputSettings.query().select('id').modify('active').where({ document_id: documentId })
        ).map(({ id }) => id);

        const history = await SignyDocumentInputHistory.query()
            .withGraphJoined('documentInputs')
            .modify('active')
            .whereIn('input_settings_id', inputSettingsIds);
        return {
            history: history.map((x) => x?.toInputHistoryBaseInfo() || []),
        };
    }

    async deleteSignatory({ signatoryId, userId }: DeleteSignatoryRequest): Promise<ApiSuccessResponse> {
        if (!signatoryId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const signatory = await SignyDocumentSignatories.query().modify('active').findById(signatoryId);

        if (!signatory) {
            throw ServiceRpcException(ApiEC.SignatoryNotFound);
        }

        const allInputs = await SignyDocumentInputSettings.query().whereRaw(
            `contact_recipients LIKE '%${signatory.contact_id}%'`
        );

        if (signatory?.sign_order_queue) {
            const foundSameQueue = await SignyDocumentSignatories.query()
                .modify('active')
                .where({ sign_order_queue: signatory.sign_order_queue })
                .whereNot({ id: signatory.id })
                .andWhere({ document_id: signatory.document_id });

            if (!foundSameQueue?.length) {
                const signatories = await SignyDocumentSignatories.query()
                    .modify('active')
                    .where('sign_order_queue', '>', signatory.sign_order_queue)
                    .andWhere({ document_id: signatory.document_id });

                for (const y of signatories) {
                    if (y?.sign_order_queue && y?.sign_order_queue > signatory.sign_order_queue) {
                        await y.$query().patch({ sign_order_queue: y.sign_order_queue - 1 });
                    }
                }
            }
        }

        for (const x of allInputs) {
            if (x?.contact_recipients?.length && signatory?.contact_id) {
                const index = x.contact_recipients.indexOf(signatory.contact_id);
                x.contact_recipients.splice(index, 1);
                await x
                    .$query()
                    .patch({ contact_recipients: x.contact_recipients.sort((a: number, b: number) => a - b) });
            }
        }

        await signatory.$query().patch({ status: StatusType.Deleted, sign_order_queue: null });

        return { ok: true };
    }

    async signOrderBulkUpdate({
        documentId,
        signOrderQueue,
        userId,
    }: SignOrderBulkUpdateRequest): Promise<ApiSuccessResponse> {
        if (!documentId || !signOrderQueue || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await this.documentService.getDocumentWithPermission({ documentId, userId });

        await SignyDocumentSignatories.query()
            .modify('active')
            .where({ document_id: documentId })
            .patch({ sign_order_queue: signOrderQueue });

        return { ok: true };
    }

    async uploadSignature({
        uploadedSignature,
        signatoryId,
    }: InsertSignatureRequest): Promise<UploadSignatureResponse> {
        if (!uploadedSignature?.imageUrl || !signatoryId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let signatory = await SignyDocumentSignatories.query().modify('active').findById(signatoryId);

        if (!signatory) {
            throw ServiceRpcException(ApiEC.SignatoryNotFound);
        }

        signatory = await signatory.$query().patchAndFetch({
            drawn_sign_file: signatory?.drawn_sign_file
                ? [...signatory.drawn_sign_file, uploadedSignature]
                : [uploadedSignature],
        });

        return { signature: uploadedSignature };
    }

    async deleteSignature({ signatoryId, signatureIndex }: DeleteSignatureRequest): Promise<ApiSuccessResponse> {
        if (!signatoryId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let signatory = await SignyDocumentSignatories.query().modify('active').findById(signatoryId);

        if (!signatory) {
            throw ServiceRpcException(ApiEC.SignatoryNotFound);
        }

        if (signatureIndex === 0 && signatory?.drawn_sign_file?.length) {
            signatory.drawn_sign_file.splice(0, 1);
        } else if (signatureIndex && signatory?.drawn_sign_file?.length) {
            signatory.drawn_sign_file.splice(signatureIndex, 1);
        } else {
            signatory.drawn_sign_file = [];
        }

        signatory = await signatory.$query().patchAndFetch({
            drawn_sign_file: signatory.drawn_sign_file,
        });

        return { ok: true };
    }
}
