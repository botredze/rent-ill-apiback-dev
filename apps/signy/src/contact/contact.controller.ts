import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserIdRequest } from '@signy/common';
import {
    GetUserContactsResponse,
    GetUserContactsWithFilterRequest,
    ImportContactsFromGoogleRequest,
    ContactEventType,
    AddContactToFavouriteRequest,
    CreateNewContactRequest,
    ChangeStatusOfContactRequest,
    CreateContactCustomGroupResponse,
    CreateContactCustomGroupRequest,
    DeleteMemberFromGroupRequest,
    AddContactToGroupRequest,
    AddContactToDocumentGroupRequest,
    DeleteContactFromDocumentGroupRequest,
    ContactGroupIdRequest,
    UpdateContactGroupRequest,
    UpdateContactResponse,
    UpdateContactRequest,
    AddGroupToFavouriteRequest,
    ChangeStatusOfContactsBulkRequest,
    InternalContactCreationRequest,
    ContactInfoRequest,
} from '@signy/contact';
import { GetDocumentGrroupsAndContactsResponse } from '@signy/document';
import { ApiSuccessResponse } from '@signy/exceptions';
import { ContactService } from './contact.service';

@Controller()
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @MessagePattern(ContactEventType.InternalContactCreation)
    async internalContactCreation(dto: InternalContactCreationRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.internalContactCreation(dto);
    }

    @MessagePattern(ContactEventType.ImportContactsFromGoogle)
    async importContactsFromGoogle(dto: ImportContactsFromGoogleRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.importContactsFromGoogle(dto);
    }

    @MessagePattern(ContactEventType.GetUserContacts)
    async getUserContacts(dto: GetUserContactsWithFilterRequest): Promise<GetUserContactsResponse> {
        return await this.contactService.getUserContacts(dto);
    }

    @MessagePattern(ContactEventType.AddContactToFavourite)
    async addContactToFavourite(dto: AddContactToFavouriteRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.addContactToFavourite(dto);
    }

    @MessagePattern(ContactEventType.RemoveContactFromFavourite)
    async removeContactFromFavourite(dto: AddContactToFavouriteRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.removeContactFromFavourite(dto);
    }

    @MessagePattern(ContactEventType.CreateNewContact)
    async createNewContact(dto: CreateNewContactRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.createNewContact(dto);
    }

    @MessagePattern(ContactEventType.ChangeStatusOfContact)
    async changeStatusOfContact(dto: ChangeStatusOfContactRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.changeStatusOfContact(dto);
    }

    @MessagePattern(ContactEventType.CreateCustomGroup)
    async createCustomGroup(dto: CreateContactCustomGroupRequest): Promise<CreateContactCustomGroupResponse> {
        return await this.contactService.createCustomGroup(dto);
    }

    @MessagePattern(ContactEventType.AddContactToGroup)
    async addContactToGroup(dto: AddContactToGroupRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.addContactToGroup(dto);
    }

    @MessagePattern(ContactEventType.DeleteMemberFromGroup)
    async deleteMemberFromGroup(dto: DeleteMemberFromGroupRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.deleteMemberFromGroup(dto);
    }

    @MessagePattern(ContactEventType.AddContactToDocumentGroup)
    async addContactToDocumentGroup(dto: AddContactToDocumentGroupRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.addContactToDocumentGroup(dto);
    }

    @MessagePattern(ContactEventType.DeleteContactFromDocumentGroup)
    async deleteContactFromDocumentGroup(dto: DeleteContactFromDocumentGroupRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.deleteContactFromDocumentGroup(dto);
    }

    @MessagePattern(ContactEventType.DeleteContactGroup)
    async deleteContactGroup(dto: ContactGroupIdRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.deleteContactGroup(dto);
    }

    @MessagePattern(ContactEventType.UpdateContactGroup)
    async updateContactGroup(dto: UpdateContactGroupRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.updateContactGroup(dto);
    }

    @MessagePattern(ContactEventType.ImportContactsFromCsv)
    async importContactsFromCsv(contactDatas: {
        contactDatas: Partial<ContactInfoRequest[]>;
        userId: number;
    }): Promise<ApiSuccessResponse> {
        return await this.contactService.importContactsFromCsv(contactDatas);
    }

    @MessagePattern(ContactEventType.UpdateContact)
    async updateContact(dto: UpdateContactRequest): Promise<UpdateContactResponse> {
        return await this.contactService.updateContact(dto);
    }

    @MessagePattern(ContactEventType.GetGroupsWithContacts)
    async getGroupsWithContacts(dto: UserIdRequest): Promise<GetDocumentGrroupsAndContactsResponse> {
        return await this.contactService.getGroupsWithContacts(dto);
    }

    @MessagePattern(ContactEventType.AddGroupToFavourite)
    async addGroupToFavourite(dto: AddGroupToFavouriteRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.addGroupToFavourite(dto);
    }

    @MessagePattern(ContactEventType.ChangeStatusOfContactsBulk)
    async changeStatusOfContactsBulk(dto: ChangeStatusOfContactsBulkRequest): Promise<ApiSuccessResponse> {
        return await this.contactService.changeStatusOfContactsBulk(dto);
    }
}
