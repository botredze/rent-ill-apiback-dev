import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SessionUserInfo } from '@signy/auth';
import {
    AddContactToDocumentGroupRequest,
    AddContactToFavouriteRequest,
    AddContactToGroupRequest,
    AddGroupToFavouriteRequest,
    ContactGroupIdRequest,
    CreateContactCustomGroupRequest,
    CreateContactCustomGroupResponse,
    CreateNewContactRequest,
    DeleteContactFromDocumentGroupRequest,
    ChangeStatusOfContactRequest,
    DeleteMemberFromGroupRequest,
    GetCsvExampleResponse,
    GetUserContactsResponse,
    GetUserContactsWithFilterRequest,
    ImportContactsFromCsvRequest,
    ImportContactsFromGoogleRequest,
    UpdateContactGroupRequest,
    UpdateContactRequest,
    UpdateContactResponse,
    ChangeStatusOfContactsBulkRequest,
} from '@signy/contact';
import { GetAllDocumentGroupsAndContactsRequest, GetDocumentGrroupsAndContactsResponse } from '@signy/document';
import { ApiErrorResponse, ApiSuccessResponse } from '@signy/exceptions';
import { imageFileFilter, uploadConstants } from '@signy/s3';
import { UserPassport } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { ContactService } from './contact.service';

@ApiTags('Contact')
@ApiSecurity('X_API_KEY')
@ApiSecurity('X_SESSION_KEY')
@ApiBadRequestResponse({
    description: 'Bad response',
    type: ApiErrorResponse,
})
@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post('import-google-contacts')
    @ApiOperation({ summary: 'Import contacts from google' })
    async importContactsFromGoogle(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: ImportContactsFromGoogleRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.importContactsFromGoogle({ ...dto, userId });
    }

    @Post('get-user-contacts-with-filter')
    @ApiOperation({ summary: 'Get all contacts of user' })
    async getUserContacts(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: GetUserContactsWithFilterRequest
    ): Promise<GetUserContactsResponse> {
        return this.contactService.getUserContacts({ ...dto, userId });
    }

    @Post('add-to-favourite')
    @ApiOperation({ summary: 'Add contact to favourite' })
    async addContactToFavourite(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: AddContactToFavouriteRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.addContactToFavourite({ ...dto, userId });
    }

    @Post('remove-from-favourite')
    @ApiOperation({ summary: 'Remove contact from favourite' })
    async removeContactFromFavourite(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: AddContactToFavouriteRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.removeContactFromFavourite({ ...dto, userId });
    }

    @Post('create-contact')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('avatar', { limits: { fileSize: uploadConstants.maxFileSize }, fileFilter: imageFileFilter })
    )
    @ApiOperation({ summary: 'Create new contact' })
    async createNewContact(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CreateNewContactRequest,
        @UploadedFile() avatar: Express.Multer.File
    ): Promise<ApiSuccessResponse> {
        return this.contactService.createNewContact({ ...dto, userId, avatar });
    }

    @Post('change-status-of-contact')
    @ApiOperation({ summary: 'Change status of contact' })
    async changeStatusOfContact(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: ChangeStatusOfContactRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.changeStatusOfContact({ ...dto, userId });
    }
    @Post('create-custom-group')
    @ApiOperation({ summary: 'Delete contact' })
    async createCustomGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: CreateContactCustomGroupRequest
    ): Promise<CreateContactCustomGroupResponse> {
        return this.contactService.createCustomGroup({ ...dto, userId });
    }

    @Post('add-contact-to-group')
    @ApiOperation({ summary: 'Add contact to group' })
    async addContactToGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: AddContactToGroupRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.addContactToGroup({ ...dto, userId });
    }

    @Post('delete-member-from-group')
    @ApiOperation({ summary: 'Delete member from group' })
    async deleteMemberFromGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: DeleteMemberFromGroupRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.deleteMemberFromGroup({ ...dto, userId });
    }

    @Post('add-to-document-group')
    @ApiOperation({ summary: 'Add contact to group of document' })
    async addContactToDocumentGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: AddContactToDocumentGroupRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.addContactToDocumentGroup({ ...dto, userId });
    }

    @Post('delete-from-document-group')
    @ApiOperation({ summary: 'Delete from document group' })
    async deleteContactFromDocumentGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: DeleteContactFromDocumentGroupRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.deleteContactFromDocumentGroup({ ...dto, userId });
    }

    @Post('delete-contact-group')
    @ApiOperation({ summary: 'Delete contact group' })
    async deleteContactGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: ContactGroupIdRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.deleteContactGroup({ ...dto, userId });
    }

    @Post('update-contact-group')
    @ApiOperation({ summary: 'Update contact group' })
    async updateContactGroup(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UpdateContactGroupRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.updateContactGroup({ ...dto, userId });
    }

    @Post('import-from-csv')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('csv'))
    @ApiOperation({ summary: 'Import contacts from csv' })
    async importContactsFromCsv(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: ImportContactsFromCsvRequest,
        @UploadedFile() csv: Express.Multer.File
    ): Promise<ApiSuccessResponse> {
        return this.contactService.importContactsFromCsv({ userId, csv });
    }

    @Get('csv-example')
    @ApiOperation({ summary: 'Get CSV example file url' })
    async getCsvExample(): Promise<GetCsvExampleResponse> {
        return this.contactService.getCsvExample();
    }

    @Post('update-contact')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('avatar', { limits: { fileSize: uploadConstants.maxFileSize }, fileFilter: imageFileFilter })
    )
    @ApiOperation({ summary: 'Update contact' })
    async updateContact(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: UpdateContactRequest,
        @UploadedFile() avatar?: Express.Multer.File
    ): Promise<UpdateContactResponse> {
        return this.contactService.updateContact({ ...dto, userId, avatar });
    }

    @Post('groups-and-contacts')
    @ApiOperation({ summary: 'Get document groups and contacts' })
    async getAllDocumentGroupsAndContacts(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: GetAllDocumentGroupsAndContactsRequest
    ): Promise<GetDocumentGrroupsAndContactsResponse> {
        return this.contactService.getAllDocumentGroupsAndContacts({ ...dto, userId });
    }

    @Get('groups-with-contacts')
    @ApiOperation({ summary: 'Get groups with contacts' })
    async getGroupsWithContacts(
        @UserPassport() { id: userId }: SessionUserInfo
    ): Promise<GetDocumentGrroupsAndContactsResponse> {
        return this.contactService.getGroupsWithContacts({ userId });
    }

    @Post('add-group-to-favourite')
    @ApiOperation({ summary: 'Add group to favourites' })
    async addGroupToFavourite(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: AddGroupToFavouriteRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.addGroupToFavourite({ ...dto, userId });
    }

    @Post('change-status-of-contacts-bulk')
    @ApiOperation({ summary: 'Change status of contacts bulk' })
    async changeStatusOfContactsBulk(
        @UserPassport() { id: userId }: SessionUserInfo,
        @Body() dto: ChangeStatusOfContactsBulkRequest
    ): Promise<ApiSuccessResponse> {
        return this.contactService.changeStatusOfContactsBulk({ ...dto, userId });
    }
}
