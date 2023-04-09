import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StatusType } from '@signy/common';
import { SignyCustomGroupsBaseInfo } from '@signy/contact';
import {
    AddContactToAllInputsRequest,
    GetAllDocumentGroupsAndContactsRequest,
    RemoveContactFromInputRequest,
} from '@signy/document';
import {
    CreateInputForPdfRequest,
    CreateInputForPdfResponse,
    GetDocumentInputsWithSearchRequest,
    GetDocumentInputsWithSearchResponse,
    InputDbRequest,
    InputIdRequest,
    RemoveDocumentInputRequest,
    SignyDocumentInputSettingsExtraBaseInfo,
    UpdateInputForPdfRequest,
    UpdateInputForPdfResponse,
} from '@signy/document-input';
import { SignyBaseInfo } from '@signy/signy';
import {
    SignyContact,
    SignyContactCustomGroup,
    SignyDocumentInputHistory,
    SignyDocumentInputSettings,
    SignyDocumentSignatories,
    User,
} from '@signy/db';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { AnyQueryBuilder } from 'objection';
import { DocumentService } from '../document/document.service';
import { SignatoryService } from '../signatory/signatory.service';

@Injectable()
export class DocumentInputService {
    private logger: Logger;
    constructor(
        @Inject('DOCUMENT_INPUT_SERVICE') private natsClient: ClientProxy,
        private documentService: DocumentService,
        private signatoryService: SignatoryService
    ) {
        this.logger = new Logger(DocumentInputService.name);
    }

    private async getInputById({ inputId }: Partial<InputIdRequest>): Promise<SignyDocumentInputSettings> {
        if (!inputId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const input = await SignyDocumentInputSettings.query().modify('active').findOne({ id: inputId });

        if (!input) {
            throw ServiceRpcException(ApiEC.SignyInputNotFound);
        }

        return input;
    }

    async inputDbData({
        id,
        userId,
        documentId,
        uploadedAttachments,
        type,
        isRequiredOn,
        isSelectCheckmarkOn,
        contactRecipients,
        groupRecipients,
        placeholder,
        hint,
        signatureColor,
        fieldId,
        validationType,
        validationMin,
        validationMax,
        textFont,
        textSize,
        textColor,
        textDistance,
        isUnderlineOn,
        isItalicOn,
        isBoldOn,
        float,
        optionsListData,
        isShowLabelsOn,
        isTime,
        isDate,
        isDuration,
        dateFormat,
        rangeCount,
        isRangeZero,
        isRangeOne,
        inputOrder,
        extraData,
    }: Partial<InputDbRequest>): Promise<Partial<SignyDocumentInputSettings>> {
        let input: SignyDocumentInputSettings | undefined;
        if (id) {
            input = await this.getInputById({ inputId: id, userId });
        }
        if (contactRecipients?.length) {
            for (const x of contactRecipients) {
                const foundContact = await SignyContact.query().modify('active').findOne({ id: x });
                if (!foundContact) {
                    throw ServiceRpcException(ApiEC.SignyContactNotFound);
                }
            }
        }

        if (groupRecipients?.length) {
            for (const x of groupRecipients) {
                const foundGroup = await SignyContactCustomGroup.query().modify('active').findOne({ id: x });
                if (!foundGroup) {
                    throw ServiceRpcException(ApiEC.SignyGroupNotFound);
                }
            }
        }

        if (input) {
            if (input?.contact_recipients?.length) {
                contactRecipients?.push(...input.contact_recipients);
            }
            if (input?.group_recipients?.length) {
                groupRecipients?.push(...input.group_recipients);
            }

            if (uploadedAttachments) {
                if (input?.attachments?.length) {
                    uploadedAttachments.push(...input.attachments);
                }
            }
            const filteredSignatureColor = [];
            if (input?.signature_color?.length && signatureColor) {
                filteredSignatureColor.push(...input.signature_color, ...signatureColor);
            } else if (input?.signature_color?.length && !signatureColor) {
                filteredSignatureColor.push(...input.signature_color);
            } else if (!input?.signature_color?.length && signatureColor) {
                filteredSignatureColor.push(...signatureColor);
            }
            if (optionsListData && input?.options_list_data?.length) {
                optionsListData.push(...input.options_list_data);
            }
            const dbData: Partial<SignyDocumentInputSettings> = {
                attachments: uploadedAttachments || input.attachments,
                type: type || input.type,
                is_required_on: isRequiredOn || Boolean(input.is_required_on),
                is_select_checkmark_on: isSelectCheckmarkOn || Boolean(input.is_select_checkmark_on),
                contact_recipients: contactRecipients || input.contact_recipients,
                group_recipients: groupRecipients || input.group_recipients,
                placeholder: placeholder || input.placeholder,
                hint: hint || input.hint,
                signature_color: filteredSignatureColor || input.signature_color,
                field_id: fieldId || input.field_id,
                validtion_type: validationType || input?.validtion_type || undefined,
                validation_min: validationMin || input.validation_min,
                validation_max: validationMax || input.validation_max,
                text_font: textFont || input.text_font,
                text_size: textSize || input.text_size,
                text_color: textColor || input.text_color,
                text_distance: textDistance || input.text_distance,
                is_underline_on: isUnderlineOn || Boolean(input.is_underline_on),
                is_italic_on: isItalicOn || Boolean(input.is_italic_on),
                is_bold_on: isBoldOn || Boolean(input.is_bold_on),
                float: float || input?.float || undefined,
                options_list_data: optionsListData || input.options_list_data,
                is_show_labels_on: isShowLabelsOn || Boolean(input.is_show_labels_on),
                is_time: isTime || Boolean(input.is_time),
                is_date: isDate || Boolean(input.is_date),
                is_duration: isDuration || Boolean(input.is_duration),
                date_format: dateFormat || input?.date_format || undefined,
                range_count: rangeCount || input.range_count,
                is_range_zero: isRangeZero || Boolean(input.is_range_zero),
                is_range_one: isRangeOne || Boolean(input.is_range_one),
                input_order: inputOrder || input.input_order,
                extra_data: extraData || input.extra_data,
            };

            return dbData;
        }

        const dbData: Partial<SignyDocumentInputSettings> = {
            type,
            document_id: documentId,
            input_order: inputOrder,
            extra_data: extraData,
            is_required_on: isRequiredOn,
            contact_recipients: contactRecipients?.length ? contactRecipients : null,
            group_recipients: groupRecipients?.length ? groupRecipients : null,
            placeholder,
            hint,
            field_id: fieldId,
            is_select_checkmark_on: isSelectCheckmarkOn,
            text_font: textFont,
            text_size: textSize,
            text_color: textColor,
            text_distance: textDistance,
            is_underline_on: isUnderlineOn,
            is_italic_on: isItalicOn,
            is_bold_on: isBoldOn,
            float: float,
            attachments: uploadedAttachments,
            signature_color: signatureColor,
            validtion_type: validationType,
            validation_min: validationMin,
            validation_max: validationMax,
            options_list_data: optionsListData,
            is_show_labels_on: isShowLabelsOn,
            is_time: isTime,
            is_date: isDate,
            is_duration: isDuration,
            date_format: dateFormat,
            range_count: rangeCount,
            is_range_zero: isRangeZero,
            is_range_one: isRangeOne,
        };

        if (!dbData) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return dbData;
    }

    async createInputForPdf(dto: CreateInputForPdfRequest): Promise<CreateInputForPdfResponse> {
        if (!dto.documentId || !dto.type) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const foundSignatory = await SignyDocumentSignatories.query()
            .withGraphJoined('contact(active)')
            .modify('active')
            .findOne({
                user_id: dto.userId,
                document_id: dto.documentId,
            });

        if (foundSignatory?.contact && foundSignatory?.contact_id) {
            if (dto?.contactRecipients?.length) {
                dto.contactRecipients.push(foundSignatory?.contact_id);
            } else {
                dto.contactRecipients = [foundSignatory.contact_id];
            }
        }

        const dbData = await this.inputDbData({ ...dto });

        const input = await SignyDocumentInputSettings.query().insertAndFetch(dbData);

        if (dto?.contactRecipients?.length) {
            for (const x of dto.contactRecipients) {
                const foundSignatory = await SignyDocumentSignatories.query()
                    .modify('active')
                    .findOne({ document_id: dto.documentId, contact_id: x });

                if (!foundSignatory) {
                    await this.signatoryService.createSignatory({
                        documentId: dto.documentId,
                        userId: dto.userId,
                        contactId: x,
                    });
                }
            }
        }

        return { input: input.toSignyDocumentInputSettingsBaseInfo() };
    }

    async updateInputForPdf(dto: UpdateInputForPdfRequest): Promise<UpdateInputForPdfResponse> {
        if (!dto.id) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }
        const input = await this.getInputById({ inputId: dto.id, userId: dto.userId });

        const dbData = await this.inputDbData({ ...dto, type: input.type, documentId: input.document_id });
        const updatedInput = await input.$query().patchAndFetch({
            ...dbData,
        });

        if (dto?.contactRecipients?.length) {
            for (const x of dto.contactRecipients) {
                const foundSignatory = await SignyDocumentSignatories.query()
                    .modify('active')
                    .findOne({ document_id: updatedInput.document_id, contact_id: x });

                if (!foundSignatory) {
                    await this.signatoryService.createSignatory({
                        documentId: updatedInput.document_id,
                        userId: dto.userId,
                        contactId: x,
                    });
                }
            }
        }

        return { input: input.toSignyDocumentInputSettingsBaseInfo() };
    }
    async removeDocumentInput({ userId, inputId }: RemoveDocumentInputRequest): Promise<ApiSuccessResponse> {
        if (!inputId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const input = await SignyDocumentInputSettings.query()
            .withGraphJoined('document(active)')
            .modify('active')
            .findOne({ 'signy_document_input_settings.id': inputId });

        if (!input || input?.document?.creator_id !== userId) {
            throw ServiceRpcException(ApiEC.SignyInputNotFound);
        }

        await input.$query().patch({ status: StatusType.Deleted });

        return { ok: true };
    }

    async getDocumentInputs({
        documentId,
        inputId,
        type,
        signatoryId,
        userId,
    }: GetDocumentInputsWithSearchRequest): Promise<GetDocumentInputsWithSearchResponse> {
        if (!documentId && !inputId && !type) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const inputs = await SignyDocumentInputSettings.query()
            .modify('active')
            .withGraphJoined('document.[documentSettings, creator]')
            .where((wb: AnyQueryBuilder) => {
                if (type) {
                    wb.where({ 'signy_document_input_settings.type': type });
                }
                if (documentId) {
                    wb.where({ 'signy_document_input_settings.document_id': documentId });
                }
                if (inputId) {
                    wb.findOne({ 'signy_document_input_settings.id': inputId });
                }
            });

        const filteredResponse: SignyDocumentInputSettingsExtraBaseInfo[] = [];
        for (const x of inputs) {
            const contacts: SignyContact[] = [];

            if (x?.contact_recipients?.length) {
                const foundContacts = await SignyContact.query().modify('active').whereIn('id', x.contact_recipients);
                contacts.push(...foundContacts);
            }
            const groups: SignyContactCustomGroup[] = [];
            if (x?.group_recipients?.length) {
                const foundGroups = await SignyContactCustomGroup.query()
                    .modify('active')
                    .whereIn('id', x.group_recipients);
                groups.push(...foundGroups);
            }

            let signatory: SignyDocumentSignatories | undefined;
            const histories: SignyDocumentInputHistory[] = [];
            if (signatoryId) {
                signatory = await SignyDocumentSignatories.query().modify('active').findById(signatoryId);

                if (!signatory) {
                    throw ServiceRpcException(ApiEC.SignatoryNotFound);
                }

                const history = await SignyDocumentInputHistory.query()
                    .withGraphJoined('documentInputs')
                    .modify('active')
                    .where({ input_settings_id: x.id, signatory_id: signatoryId });

                if (history?.length) {
                    histories.push(...history);
                }
            }

            const filteredContacts: SignyBaseInfo[] = [];
            contacts.map((y) => {
                if (x?.contact_recipients?.includes(y.id)) {
                    filteredContacts.push(y.toSignyContactsBaseInfo());
                }
            });
            const filteredGroups: SignyCustomGroupsBaseInfo[] = [];
            groups.map((y) => {
                if (x?.group_recipients?.includes(y.id)) {
                    filteredGroups.push(y.toSignyCustomGroupsBaseInfo());
                }
            });

            if (x.document?.creator_id !== userId) {
                if (
                    x?.document?.documentSettings?.is_private &&
                    signatory?.contact_id &&
                    x?.contact_recipients?.length &&
                    x?.contact_recipients?.includes(signatory?.contact_id)
                ) {
                    filteredResponse.push({
                        ...x.toSignyDocumentInputSettingsBaseInfo(),
                        contacts: filteredContacts,
                        groups: filteredGroups,
                        history: histories?.filter((z) => z.input_settings_id === x.id)[0]?.toInputHistoryBaseInfo(),
                    });
                } else if (!x?.document?.documentSettings?.is_private) {
                    const docOwnerContactId = await this.signatoryService.contactService.findContact({
                        email: x?.document?.creator?.email || undefined,
                        phone: x?.document?.creator?.phone?.length ? x.document.creator.phone[0] : undefined,
                    });

                    let isVisible = false;
                    if (docOwnerContactId) {
                        const ownerSignatory = await SignyDocumentSignatories.query().findOne({
                            contact_id: docOwnerContactId,
                            document_id: documentId,
                        });
                        isVisible = !!ownerSignatory?.is_visible;
                    }
                    if (
                        !x?.contact_recipients?.length ||
                        (!isVisible && !x?.contact_recipients.some((elem) => ![docOwnerContactId].includes(elem)))
                    ) {
                        filteredResponse.push({
                            ...x.toSignyDocumentInputSettingsBaseInfo(),
                            contacts: filteredContacts,
                            groups: filteredGroups,
                            history: histories
                                ?.filter((z) => z.input_settings_id === x.id)[0]
                                ?.toInputHistoryBaseInfo(),
                        });
                    } else if (signatory?.contact_id && x?.contact_recipients?.includes(signatory?.contact_id)) {
                        filteredResponse.push({
                            ...x.toSignyDocumentInputSettingsBaseInfo(),
                            contacts: filteredContacts,
                            groups: filteredGroups,
                            history: histories
                                ?.filter((z) => z.input_settings_id === x.id)[0]
                                ?.toInputHistoryBaseInfo(),
                        });
                    }
                } else if (
                    x?.document?.documentSettings?.is_private &&
                    signatory?.contact_id &&
                    signatory.document_id === x.document_id &&
                    !x?.contact_recipients?.length
                ) {
                    filteredResponse.push({
                        ...x.toSignyDocumentInputSettingsBaseInfo(),
                        contacts: filteredContacts,
                        groups: filteredGroups,
                        history: histories?.filter((z) => z.input_settings_id === x.id)[0]?.toInputHistoryBaseInfo(),
                    });
                }
            } else {
                filteredResponse.push({
                    ...x.toSignyDocumentInputSettingsBaseInfo(),
                    contacts: filteredContacts,
                    groups: filteredGroups,
                    history: histories?.filter((z) => z.input_settings_id === x.id)[0]?.toInputHistoryBaseInfo(),
                });
            }
        }

        return {
            inputs: filteredResponse,
        };
    }

    async mergeAllContactsToInputs({
        documentId,
        userId,
    }: GetAllDocumentGroupsAndContactsRequest): Promise<ApiSuccessResponse> {
        if (!documentId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await this.documentService.getDocumentWithPermission({ userId, documentId });

        const inputs = await SignyDocumentInputSettings.query().modify('active').where({ document_id: documentId });
        const contacts: number[] = [];
        const groups: number[] = [];
        for (const x of inputs) {
            (await SignyDocumentSignatories.query().modify('active').where({ document_id: documentId })).map((x) => {
                if (x?.contact_id) {
                    contacts.push(x.contact_id);
                }
            });
            if (x?.group_recipients?.length) {
                groups.push(
                    ...(await SignyContactCustomGroup.query().modify('active').whereIn('id', x.group_recipients)).map(
                        (x) => x.id
                    )
                );
            }
        }
        await SignyDocumentInputSettings.query()
            .modify('active')
            .patch({
                contact_recipients: [...new Map(contacts.map((item) => [item, item])).values()],
                group_recipients: [...new Map(groups.map((item) => [item, item])).values()],
            })
            .where({ document_id: documentId });

        return { ok: true };
    }

    async addContactToAllInputs({
        contactId,
        documentId,
        userId,
    }: AddContactToAllInputsRequest): Promise<ApiSuccessResponse> {
        if (!documentId || !userId || !contactId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await this.documentService.getDocumentWithPermission({ userId, documentId });

        const inputs = await SignyDocumentInputSettings.query().modify('active').where({ document_id: documentId });
        for (const x of inputs) {
            let contacts: number[] = [];
            if (x?.contact_recipients?.length) {
                contacts = x.contact_recipients;
                contacts.push(contactId);
            } else {
                contacts.push(contactId);
            }
            await x
                .$query()
                .modify('active')
                .patch({
                    contact_recipients: [...new Map(contacts.map((item) => [item, item])).values()],
                });
        }

        return { ok: true };
    }

    async removeContactFromInput({
        contactId,
        groupId,
        documentId,
        inputId,
        userId,
    }: RemoveContactFromInputRequest): Promise<ApiSuccessResponse> {
        if (!documentId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const user = await User.query().findById(userId);

        let myContact;
        if (user?.email) {
            myContact = await SignyContact.query().modify('active').findOne({ email: user.email });
        } else if (user?.phone?.length) {
            myContact = await SignyContact.query().modify('active').findOne({ phone: user.phone[0] });
        }

        if (!contactId && !groupId) {
            if (!contactId) {
                if (myContact?.id) {
                    const inputs = await SignyDocumentInputSettings.query()
                        .modify('active')
                        .where({ document_id: documentId });
                    for (const x of inputs) {
                        if (x?.contact_recipients?.length && !x?.contact_recipients?.includes(myContact.id)) {
                            await x.$query().patch({ contact_recipients: [] });
                        } else if (x?.contact_recipients?.includes(myContact.id)) {
                            await x.$query().patch({ contact_recipients: [myContact.id] });
                        }
                    }
                } else {
                    await SignyDocumentInputSettings.query()
                        .modify('active')
                        .where({ document_id: documentId })
                        .patch({ contact_recipients: [] });
                }

                return { ok: true };
            }
        }

        await this.documentService.getDocumentWithPermission({ userId, documentId });

        if (!inputId) {
            if (contactId) {
                const allInputs = await SignyDocumentInputSettings.query()
                    .where({ document_id: documentId })
                    .whereRaw(`contact_recipients LIKE '%${contactId}%'`);

                for (const x of allInputs) {
                    if (x?.contact_recipients?.length && x?.contact_recipients?.includes(contactId)) {
                        const index = x.contact_recipients.indexOf(contactId);
                        x.contact_recipients.splice(index, 1);
                        await x
                            .$query()
                            .patch({ contact_recipients: x.contact_recipients.sort((a: number, b: number) => a - b) });
                    }
                }
            } else if (groupId) {
                const allInputs = await SignyDocumentInputSettings.query()
                    .where({ document_id: documentId })
                    .whereRaw(`group_recipients LIKE '%${groupId}%'`);

                for (const x of allInputs) {
                    if (x?.group_recipients?.length && x?.group_recipients?.includes(groupId)) {
                        const index = x.group_recipients.indexOf(groupId);
                        x.group_recipients.splice(index, 1);
                        await x
                            .$query()
                            .patch({ group_recipients: x.group_recipients.sort((a: number, b: number) => a - b) });
                    }
                }
            }
        } else {
            const input = await SignyDocumentInputSettings.query().modify('active').findById(inputId);
            if (!input) {
                throw ServiceRpcException(ApiEC.SignyInputNotFound);
            }

            if (contactId) {
                if (input?.contact_recipients?.length && input?.contact_recipients?.includes(contactId)) {
                    const index = input.contact_recipients.indexOf(contactId);
                    input.contact_recipients.splice(index, 1);
                    await input
                        .$query()
                        .patch({ contact_recipients: input.contact_recipients.sort((a: number, b: number) => a - b) });
                }
            } else if (groupId) {
                if (input?.group_recipients?.length && input?.group_recipients?.includes(groupId)) {
                    const index = input.group_recipients.indexOf(groupId);
                    input.group_recipients.splice(index, 1);
                    await input
                        .$query()
                        .patch({ group_recipients: input.group_recipients.sort((a: number, b: number) => a - b) });
                }
            }
        }

        // if (contactId) {
        //     const signatory = await SignyDocumentSignatories.query()
        //         .modify('active')
        //         .findOne({ document_id: documentId, contact_id: contactId });

        //     if (signatory?.sign_order_queue) {
        //         const foundSameQueue = await SignyDocumentSignatories.query()
        //             .modify('active')
        //             .where({ sign_order_queue: signatory.sign_order_queue })
        //             .whereNot({ id: signatory.id })
        //             .andWhere({ document_id: signatory.document_id });

        //         if (!foundSameQueue?.length) {
        //             const signatories = await SignyDocumentSignatories.query()
        //                 .modify('active')
        //                 .where('sign_order_queue', '>', signatory.sign_order_queue)
        //                 .andWhere({ document_id: signatory.document_id });

        //             for (const y of signatories) {
        //                 if (y?.sign_order_queue && y?.sign_order_queue > signatory.sign_order_queue) {
        //                     await y.$query().patch({ sign_order_queue: y.sign_order_queue - 1 });
        //                 }
        //             }
        //         }
        //     }

        //     await signatory?.$query().patch({ status: StatusType.Deleted, sign_order_queue: null });
        // }

        return { ok: true };
    }
}
