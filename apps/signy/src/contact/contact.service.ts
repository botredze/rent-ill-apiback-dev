import { Inject, Injectable, Logger } from '@nestjs/common';
import { SignyContact, SignyContactCustomGroup, SignyDocumentCustomGroups } from '@signy/db';
import {
    AddContactToDocumentGroupRequest,
    AddContactToFavouriteRequest,
    AddContactToGroupRequest,
    AddGroupToFavouriteRequest,
    ChangeStatusOfContactRequest,
    ChangeStatusOfContactsBulkRequest,
    ContactGroupIdRequest,
    ContactInfoRequest,
    CreateContactCustomGroupRequest,
    CreateContactCustomGroupResponse,
    CreateNewContactRequest,
    DeleteContactFromDocumentGroupRequest,
    DeleteMemberFromGroupRequest,
    FindContactRequest,
    GetUserContactsResponse,
    GetUserContactsWithFilterRequest,
    ImportContactsFromGoogleRequest,
    InternalContactCreationRequest,
    SignyContactImportTypes,
    SignyCustomGroupsBaseInfo,
    UpdateContactGroupRequest,
    UpdateContactRequest,
    UpdateContactResponse,
    UserContactSearchTypes,
} from '@signy/contact';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { AnyQueryBuilder, raw } from 'objection';
import { commonConstants, StatusType, UserIdRequest } from '@signy/common';
import { PaginationService } from '@signy/pagination';
import { google, people_v1 } from 'googleapis';
import { ExternalUserContactsInfo, ExternalUserInfo } from '@signy/auth';
import contactGroups from '@signy/json/contact/groups';
import { GenderTypes } from '@signy/user';
import { SignyBaseInfo } from '@signy/signy';
import { GetDocumentGrroupsAndContactsResponse } from '@signy/document';
import { GaxiosResponse } from 'gaxios';
@Injectable()
export class ContactService {
    private logger: Logger;
    constructor(
        @Inject(SignyContact) private readonly signyContactModel: typeof SignyContact,
        private paginationService: PaginationService
    ) {
        this.logger = new Logger(ContactService.name);
    }

    async internalContactCreation({
        userId,
        email,
        phone,
    }: InternalContactCreationRequest): Promise<ApiSuccessResponse> {
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
                email: email || undefined,
                phone: phone || undefined,
            });
        }

        return { ok: true };
    }

    async getContactById({ contactId, userId }: AddContactToFavouriteRequest): Promise<SignyContact> {
        if (!contactId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const contact = await SignyContact.query().modify('active').findOne({ id: contactId, owner_id: userId });

        if (!contact) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }

        return contact;
    }

    async findContact({
        email,
        phone,
        whatsapp,
        telegram,
        telegramNick,
    }: FindContactRequest): Promise<number | undefined> {
        if (!email && !phone && !whatsapp && !telegram && !telegramNick) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const contact = await SignyContact.query()
            .modify('active')
            .select('id')
            .where((cb: AnyQueryBuilder) => {
                if (email) {
                    cb.where({ email });
                }
                if (phone) {
                    cb.orWhere({ phone });
                }
                if (whatsapp) {
                    cb.orWhere({ whatsapp });
                }
                if (telegram) {
                    cb.orWhere({ telegram });
                }
                if (telegramNick) {
                    cb.orWhere({ telegram_nick: telegramNick });
                }
            })
            .first();

        return contact?.id;
    }

    async getUserContacts({
        userId,
        companyId,
        branchId,
        pageInfo,
        searchType,
        id,
        search,
        status,
        type,
        groupId,
    }: GetUserContactsWithFilterRequest): Promise<GetUserContactsResponse> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const { pageIndex, itemsPerPage } = pageInfo ?? {};

        const defaultContactGroups = await SignyContactCustomGroup.query().modify('active').where({
            owner_id: userId,
        });

        if (!defaultContactGroups?.length) {
            for (const x of contactGroups as { name: string; color: string; is_custom: boolean }[]) {
                if (!x.is_custom) {
                    await SignyContactCustomGroup.query().insertAndFetch({
                        owner_id: userId,
                        name: x.name,
                        color: x.color,
                        is_custom: x.is_custom,
                    });
                }
            }
        }

        if (search && searchType === UserContactSearchTypes.Groups) {
            const { results, total } = await SignyContactCustomGroup.query()
                .modify('active')
                .select(
                    '*',
                    raw(
                        search && search?.length > 3
                            ? `MATCH (${SignyContactCustomGroup.tableName}.name) AGAINST (? IN BOOLEAN MODE) as searchScore`
                            : '? as searchScore',
                        [search ? `${search.trim()}*` : 0]
                    )
                )
                .where((wb: AnyQueryBuilder) => {
                    if (search?.length > 3) {
                        wb.whereRaw('MATCH (name) AGAINST (?  IN BOOLEAN MODE)', [`"${search.trim()}*"`]);
                    } else {
                        wb.whereRaw('(name LIKE CONCAT(?, "%"))', [search.trim()]);
                    }
                })
                .orderBy([{ column: 'searchScore', order: 'DESC' }])
                .page(pageIndex ? pageIndex - 1 : 0, itemsPerPage ?? commonConstants.maxSearchItemsPerPage);

            return {
                groups: results.map(({ id, name }) => {
                    return { id, name };
                }),
                pageInfo: this.paginationService.toPageInfoDTO({ total, ...pageInfo }),
            };
        }

        let contactIds: number[] | undefined;
        if (groupId) {
            const foundGroup = await SignyContactCustomGroup.query().findOne({ id: groupId });

            if (foundGroup?.owner_id !== userId) {
                throw ServiceRpcException(ApiEC.SignyGroupNotFound);
            }

            if (!foundGroup?.contact_ids?.length) {
                return {
                    contacts: [],
                    pageInfo: this.paginationService.toPageInfoDTO({ total: 0, ...pageInfo }),
                };
            }

            contactIds = foundGroup?.contact_ids;
        }

        const { results, total } = await SignyContact.query()
            .select(
                '*',
                raw(
                    search && searchType === UserContactSearchTypes.Name && search?.length > 3
                        ? `MATCH (${SignyContact.tableName}.first_name, ${SignyContact.tableName}.last_name ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : search && searchType === UserContactSearchTypes.Email && search?.length > 3
                        ? `MATCH (${SignyContact.tableName}.email ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : search && searchType === UserContactSearchTypes.Phone && search?.length > 3
                        ? `MATCH (${SignyContact.tableName}.phone ) AGAINST (? IN BOOLEAN MODE) as searchScore`
                        : '? as searchScore',
                    [search ? `"${search.trim()}*"` : 0]
                )
            )
            .where((wb: AnyQueryBuilder) => {
                if (search) {
                    if (searchType === UserContactSearchTypes.Name) {
                        if (search?.length > 3) {
                            wb.whereRaw('MATCH (first_name, last_name) AGAINST (?  IN BOOLEAN MODE)', [
                                `${search.trim()}*`,
                            ]);
                        } else {
                            wb.whereRaw('(first_name LIKE CONCAT(?, "%") OR last_name LIKE CONCAT(?, "%"))', [
                                search,
                                search,
                            ]);
                        }
                    }
                    if (searchType === UserContactSearchTypes.Email) {
                        if (search?.length > 3) {
                            wb.whereRaw('MATCH (email) AGAINST (?  IN BOOLEAN MODE)', [`"${search.trim()}*"`]);
                        } else {
                            wb.whereRaw('(email LIKE CONCAT(?, "%"))', [search.trim()]);
                        }
                    }
                    if (searchType === UserContactSearchTypes.Phone) {
                        if (search?.length > 3) {
                            wb.whereRaw('MATCH (phone) AGAINST (?  IN BOOLEAN MODE)', [`${search.trim()}*`]);
                        } else {
                            wb.whereRaw('(phone LIKE CONCAT(?, "%"))', [search.trim()]);
                        }
                    }
                }

                if (id) {
                    wb.findOne({ 'signy_contacts.owner_id': id });
                }

                if (companyId) {
                    wb.where({ company_id: companyId });
                }

                if (branchId) {
                    wb.where({ branch_id: branchId });
                }

                if (!companyId && !branchId) {
                    wb.where({ 'signy_contacts.owner_id': userId });
                }

                if (status) {
                    wb.where({ status });
                } else {
                    wb.where({ status: StatusType.Active });
                }

                if (type) {
                    wb.where({ type });
                }

                if (groupId && contactIds?.length) {
                    wb.whereIn('signy_contacts.id', contactIds);
                }
            })
            .orderBy([
                { column: 'searchScore', order: 'DESC' },
                { column: 'is_favourite', order: 'DESC' },
            ])
            .page(pageIndex ? pageIndex - 1 : 0, itemsPerPage ?? commonConstants.maxSearchItemsPerPage);

        return {
            contacts: results?.length ? results.map((x) => x.toSignyContactsBaseInfo()) : undefined,
            groups: defaultContactGroups?.length
                ? defaultContactGroups.map((x) => x.toSignyCustomGroupsBaseInfo())
                : [],
            pageInfo: this.paginationService.toPageInfoDTO({ total, ...pageInfo }),
        };
    }

    async importContactsFromGoogle({
        userId,
        userToken,
    }: ImportContactsFromGoogleRequest): Promise<ApiSuccessResponse> {
        if (!userId || !userToken) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const service = google.people({
            version: 'v1',
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });

        const peopleApi = async (
            nextPageToken?: string
        ): Promise<void | GaxiosResponse<people_v1.Schema$ListConnectionsResponse> | undefined> => {
            return await service.people.connections
                .list({
                    resourceName: 'people/me',
                    personFields: 'names,emailAddresses,photos,phoneNumbers',
                    pageSize: 1000,
                    pageToken: nextPageToken,
                })
                .then((data) => {
                    return data;
                })
                .catch((err) => {
                    if (err?.errors[0].message === 'Invalid Credentials') {
                        throw ServiceRpcException(ApiEC.AccountInactive);
                    }
                });
        };
        const connections = await peopleApi().then(async (data) => {
            const connections: people_v1.Schema$Person[] = [];
            let token;
            if (data?.data?.connections?.length) {
                connections.push(...data.data.connections);
            }
            if (data?.data?.nextPageToken) {
                token = data.data.nextPageToken;
            }
            if (token) {
                do {
                    await peopleApi(token).then(async (data) => {
                        if (data?.data?.connections?.length) {
                            connections.push(...data.data.connections);
                        }
                        if (data?.data?.nextPageToken) {
                            token = data.data.nextPageToken;
                        } else {
                            token = undefined;
                        }
                    });
                } while (token);
            }
            return connections;
        });

        if (!connections) {
            return { ok: false };
        }

        const externalContactsInfo: ExternalUserContactsInfo = { contacts: [] };

        const trx = await this.signyContactModel.startTransaction();
        try {
            for (const { names, emailAddresses, photos, phoneNumbers } of connections) {
                const dbProfile: Partial<SignyContact> = {};
                const externalUserInfo = new ExternalUserInfo();
                if (names && names.length && names[0]) {
                    const { metadata, familyName, givenName } = names[0];
                    if (metadata && metadata.source && metadata.source.id) {
                        externalUserInfo.userId = metadata.source.id;
                    }
                    dbProfile.first_name = familyName || undefined;
                    dbProfile.last_name = givenName || undefined;
                }
                if (photos !== undefined) {
                    for (const { metadata, url } of photos) {
                        if (metadata?.primary && url) {
                            dbProfile.avatar = url;
                            if (!externalUserInfo.userId && metadata.source && metadata.source.id) {
                                externalUserInfo.userId = metadata.source.id;
                            }
                            break;
                        }
                    }
                }
                if (phoneNumbers !== undefined) {
                    for (const { metadata, value } of phoneNumbers) {
                        if (metadata?.primary && value) {
                            dbProfile.phone = value;
                            if (!externalUserInfo.userId && metadata.source && metadata.source.id) {
                                externalUserInfo.userId = metadata.source.id;
                            }
                            break;
                        }
                    }
                }

                if (emailAddresses !== undefined) {
                    for (const { metadata, value } of emailAddresses) {
                        if (metadata?.primary && value) {
                            dbProfile.email = value;
                            if (!externalUserInfo.userId && metadata.source && metadata.source.id) {
                                externalUserInfo.userId = metadata.source.id;
                            }
                        }
                        break;
                    }
                }
                await SignyContact.query(trx)
                    .insertAndFetch({
                        ...dbProfile,
                        owner_id: userId,
                        type: SignyContactImportTypes.Google,
                    })
                    .onConflict('email')
                    .ignore();

                externalContactsInfo.contacts.push(externalUserInfo);
            }
            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        return { ok: true };
    }

    async addContactToFavourite({ contactId, userId }: AddContactToFavouriteRequest): Promise<ApiSuccessResponse> {
        if (!contactId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const contact = await SignyContact.query().modify('active').findOne({ id: contactId, owner_id: userId });

        if (!contact) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }

        await contact.$query().patch({ is_favourite: true });

        return { ok: true };
    }

    async removeContactFromFavourite({ contactId, userId }: AddContactToFavouriteRequest): Promise<ApiSuccessResponse> {
        if (!contactId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const contact = await SignyContact.query().modify('active').findOne({ id: contactId, owner_id: userId });

        if (!contact) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }

        await contact.$query().patch({ is_favourite: false });

        return { ok: true };
    }

    private async contactDbProfile({
        userId,
        groupId,
        uploadedAvatar,
        companyId,
        branchId,
        firstName,
        lastName,
        email,
        phone,
        whatsapp,
        telegram,
        telegramNick,
        isFavourite,
        gender,
        dob,
        color,
    }: Partial<CreateNewContactRequest>): Promise<Partial<SignyContact>> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        if (email) {
            const emailExists = await SignyContact.query().modify('active').findOne({ email, owner_id: userId });

            if (emailExists) {
                throw ServiceRpcException(ApiEC.ContactWithSuchEmailExists);
            }
        }

        if (phone) {
            const phoneExists = await SignyContact.query().modify('active').findOne({ phone, owner_id: userId });

            if (phoneExists) {
                throw ServiceRpcException(ApiEC.ContactWithSuchPhoneExists);
            }
        }

        if (whatsapp) {
            const whatsappExists = await SignyContact.query().modify('active').findOne({ whatsapp, owner_id: userId });

            if (whatsappExists) {
                throw ServiceRpcException(ApiEC.ContactWithSuchWhatsappExists);
            }
        }

        if (telegram) {
            const telegramExists = await SignyContact.query().modify('active').findOne({ telegram, owner_id: userId });

            if (telegramExists) {
                throw ServiceRpcException(ApiEC.ContactWithSuchTelegramExists);
            }
        }

        if (telegramNick) {
            const telegramNickExists = await SignyContact.query()
                .modify('active')
                .findOne({ telegram_nick: telegramNick, owner_id: userId });

            if (telegramNickExists) {
                throw ServiceRpcException(ApiEC.ContactWithTelegramNickNameExists);
            }
        }

        const dbProfile: Partial<SignyContact> = {
            owner_id: userId,
            group_ids: groupId ? [groupId] : undefined,
            avatar: uploadedAvatar || undefined,
            company_id: companyId || undefined,
            branch_id: branchId || undefined,
            first_name: firstName || undefined,
            last_name: lastName || undefined,
            email: email || undefined,
            phone: phone || undefined,
            whatsapp: whatsapp || undefined,
            telegram: telegram || undefined,
            telegram_nick: telegramNick || undefined,
            is_favourite: isFavourite || false,
            gender: gender || undefined,
            dob: dob ? new Date(dob).toISOString() : undefined,
            color: color || undefined,
        };

        return dbProfile;
    }

    async createNewContact(dto: CreateNewContactRequest): Promise<ApiSuccessResponse> {
        const dbProfile = await this.contactDbProfile(dto);

        await SignyContact.query().insertAndFetch({ ...dbProfile });

        return { ok: true };
    }

    async updateContact(dto: UpdateContactRequest): Promise<UpdateContactResponse> {
        if (!dto?.userId || !dto?.contactId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let contact = await this.getContactById({ contactId: dto.contactId, userId: dto.userId });

        const dbProfile = await this.contactDbProfile(dto);

        contact = await contact.$query().patchAndFetch({ ...dbProfile });

        return { contact: contact.toSignyContactsBaseInfo() };
    }

    async changeStatusOfContact({
        contactId,
        userId,
        status,
    }: ChangeStatusOfContactRequest): Promise<ApiSuccessResponse> {
        if (!contactId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const contact = await SignyContact.query().findOne({ id: contactId, owner_id: userId });

        if (!contact) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }

        await contact.$query().patch({ status });

        return { ok: true };
    }

    async createCustomGroup({
        color,
        name,
        userId,
        contactIds,
        icon,
    }: CreateContactCustomGroupRequest): Promise<CreateContactCustomGroupResponse> {
        if (!color || !name || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        let foundGroup = await SignyContactCustomGroup.query().modify('active').findOne({ name, owner_id: userId });

        if (!foundGroup) {
            foundGroup = await SignyContactCustomGroup.query().insertAndFetch({
                name: name,
                owner_id: userId,
                color,
                icon,
                contact_ids: contactIds,
            });
        }

        return { group: foundGroup.toSignyCustomGroupsBaseInfo() };
    }

    async addContactToGroup({ contactIds, groupId, userId }: AddContactToGroupRequest): Promise<ApiSuccessResponse> {
        if (!groupId || !contactIds?.length || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const group = await SignyContactCustomGroup.query().modify('active').findOne({ id: groupId, owner_id: userId });

        if (!group) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        const contact = await SignyContact.query().modify('active').whereIn('id', contactIds);

        if (!contact?.length) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }
        let filteredContactIds;

        if (group?.contact_ids?.length) {
            filteredContactIds = [...group.contact_ids, ...contactIds].sort((a, b) => {
                return a - b;
            });
        } else {
            filteredContactIds = [...contactIds];
        }

        await group.$query().patchAndFetch({
            contact_ids: [...new Map(filteredContactIds.map((item) => [item, item])).values()],
        });

        return { ok: true };
    }

    async deleteMemberFromGroup({
        groupId,
        memberId,
        userId,
    }: DeleteMemberFromGroupRequest): Promise<ApiSuccessResponse> {
        if (!groupId || !memberId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const group = await SignyContactCustomGroup.query().modify('active').findOne({ id: groupId, owner_id: userId });

        if (!group) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        const indexOfMember = group?.contact_ids?.indexOf(memberId);

        if (indexOfMember === undefined || !(indexOfMember > -1)) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }

        if (group?.contact_ids?.length && indexOfMember) {
            group.contact_ids.splice(indexOfMember, 1);

            await group.$query().patch({
                contact_ids: group.contact_ids,
            });
        }

        return { ok: true };
    }

    async addContactToDocumentGroup({
        contactId,
        documentGroupId,
        userId,
    }: AddContactToDocumentGroupRequest): Promise<ApiSuccessResponse> {
        if (!contactId || !documentGroupId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const documentGroup = await SignyDocumentCustomGroups.query().modify('active').findOne({ id: documentGroupId });

        if (!documentGroup) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        const contact = await SignyContact.query().modify('active').findOne({ id: contactId, owner_id: userId });

        if (!contact) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }

        let groupIds;

        if (contact?.group_ids?.length) {
            groupIds = [...contact.group_ids, documentGroupId].sort((a, b) => {
                return a - b;
            });
        } else {
            groupIds = [documentGroupId];
        }

        await contact.$query().patchAndFetch({
            group_ids: groupIds,
        });

        return { ok: true };
    }

    async deleteContactFromDocumentGroup({
        contactId,
        documentGroupId,
        userId,
    }: DeleteContactFromDocumentGroupRequest): Promise<ApiSuccessResponse> {
        if (!documentGroupId || !contactId || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const documentGroup = await SignyDocumentCustomGroups.query().modify('active').findOne({ id: documentGroupId });

        if (!documentGroup) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        const contact = await SignyContact.query().modify('active').findOne({ id: contactId, owner_id: userId });

        if (!contact) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }

        const indexOfGroup = contact?.group_ids?.indexOf(documentGroupId);
        if (indexOfGroup === undefined || !(indexOfGroup > -1)) {
            throw ServiceRpcException(ApiEC.SignyContactNotFound);
        }

        if (contact?.group_ids?.length) {
            contact.group_ids.splice(indexOfGroup, 1);

            await contact.$query().patch({
                group_ids: contact.group_ids,
            });
        }

        return { ok: true };
    }

    async deleteContactGroup({ groupId, userId }: ContactGroupIdRequest): Promise<ApiSuccessResponse> {
        if (!userId || !groupId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const group = await SignyContactCustomGroup.query().modify('active').findOne({ id: groupId, owner_id: userId });

        if (!group) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        await group.$query().patch({ status: StatusType.Deleted });

        return { ok: true };
    }

    async updateContactGroup({
        groupId,
        userId,
        color,
        icon,
        signOrderQueue,
        name,
    }: UpdateContactGroupRequest): Promise<ApiSuccessResponse> {
        if (!userId || !groupId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const group = await SignyContactCustomGroup.query().modify('active').findOne({ id: groupId, owner_id: userId });

        if (!group) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        await group.$query().patch({
            color,
            icon,
            sign_order_queue: signOrderQueue,
            name,
        });

        return { ok: true };
    }

    async importContactsFromCsv(contactDatas: {
        contactDatas: Partial<ContactInfoRequest[]>;
        userId: number;
    }): Promise<ApiSuccessResponse> {
        if (!contactDatas?.contactDatas?.length) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        for (const x of contactDatas.contactDatas as Partial<SignyContact[]>) {
            if (x?.gender) {
                x.gender = x.gender.toUpperCase() as GenderTypes;
            }
            await SignyContact.query()
                .insertAndFetch({
                    ...x,
                    owner_id: contactDatas.userId,
                    type: SignyContactImportTypes.Csv,
                })
                .onConflict('email')
                .ignore();
        }

        return { ok: true };
    }

    async getGroupsWithContacts({ userId }: UserIdRequest): Promise<GetDocumentGrroupsAndContactsResponse> {
        const groups = await SignyContactCustomGroup.query().modify('active').where({ owner_id: userId });
        const filteredGroups: SignyCustomGroupsBaseInfo[] = [];
        for (const x of groups) {
            const contacts: SignyBaseInfo[] = [];
            if (x?.contact_ids?.length) {
                contacts.push(
                    ...(await SignyContact.query().whereIn('id', x.contact_ids)).map((x) => x.toSignyContactsBaseInfo())
                );
            }
            filteredGroups.push({
                ...x.toSignyCustomGroupsBaseInfo(),
                contacts,
            });
        }

        const contacts = await SignyContact.query().where({ owner_id: userId });

        const filteredContacts: SignyBaseInfo[] = [];
        for (const x of contacts) {
            const groups: SignyCustomGroupsBaseInfo[] = [];
            if (x?.group_ids) {
                groups.push(
                    ...(await SignyContactCustomGroup.query().whereIn('id', x.group_ids)).map((x) =>
                        x.toSignyCustomGroupsBaseInfo()
                    )
                );
            }

            filteredContacts.push({
                ...x.toSignyContactsBaseInfo(),
                groups,
            });
        }
        return {
            groups: filteredGroups,
            contacts: filteredContacts,
        };
    }

    async addGroupToFavourite({ groupId, userId }: AddGroupToFavouriteRequest): Promise<ApiSuccessResponse> {
        if (!groupId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const group = await SignyContactCustomGroup.query().findOne({ id: groupId, owner_id: userId });

        if (!group) {
            throw ServiceRpcException(ApiEC.SignyGroupNotFound);
        }

        await group.$query().patch({ is_favourite: group.is_favourite ? false : true });

        return { ok: true };
    }

    async changeStatusOfContactsBulk({
        contactIds,
        userId,
        status,
    }: ChangeStatusOfContactsBulkRequest): Promise<ApiSuccessResponse> {
        if (!userId || !contactIds?.length) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        await SignyContact.query().patch({ status }).whereIn('id', contactIds).where({ owner_id: userId });

        return { ok: true };
    }
}
