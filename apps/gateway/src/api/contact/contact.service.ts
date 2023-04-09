import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    GetUserContactsResponse,
    GetUserContactsWithFilterRequest,
    ImportContactsFromGoogleRequest,
    ContactEventType,
    AddContactToFavouriteRequest,
    CreateNewContactRequest,
    ChangeStatusOfContactRequest,
    CreateContactCustomGroupRequest,
    CreateContactCustomGroupResponse,
    DeleteMemberFromGroupRequest,
    AddContactToGroupRequest,
    AddContactToDocumentGroupRequest,
    DeleteContactFromDocumentGroupRequest,
    ContactGroupIdRequest,
    UpdateContactGroupRequest,
    ImportContactsFromCsvRequest,
    ContactInfoRequest,
    GetCsvExampleResponse,
    UpdateContactRequest,
    UpdateContactResponse,
    AddGroupToFavouriteRequest,
    ChangeStatusOfContactsBulkRequest,
} from '@signy/contact';
import { ApiEC, ApiSuccessResponse, ServiceRpcException } from '@signy/exceptions';
import { S3Service, uploadFolders } from '@signy/s3';
import { lastValueFrom } from 'rxjs';
import { parse } from 'papaparse';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import {
    DocumentEventType,
    GetAllDocumentGroupsAndContactsRequest,
    GetDocumentGrroupsAndContactsResponse,
} from '@signy/document';
import { UserIdRequest } from '@signy/common';

@Injectable()
export class ContactService {
    private logger: Logger;
    private readonly csvExampleUrl: string;
    constructor(
        @Inject('GATEWAY_CONTACT_PUBLISHER') private natsClient: ClientProxy,
        private s3Service: S3Service,
        private configService: ConfigService
    ) {
        this.logger = new Logger(ContactService.name);
        this.csvExampleUrl = this.configService.get<string>('CSV_EXAMPLE_URL', '');
    }

    async importContactsFromGoogle(dto: ImportContactsFromGoogleRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, ImportContactsFromGoogleRequest>(
                ContactEventType.ImportContactsFromGoogle,
                {
                    ...dto,
                }
            )
        );
    }

    async getUserContacts(dto: GetUserContactsWithFilterRequest): Promise<GetUserContactsResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetUserContactsResponse, GetUserContactsWithFilterRequest>(
                ContactEventType.GetUserContacts,
                {
                    ...dto,
                }
            )
        );
    }

    async addContactToFavourite(dto: AddContactToFavouriteRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddContactToFavouriteRequest>(
                ContactEventType.AddContactToFavourite,
                {
                    ...dto,
                }
            )
        );
    }

    async removeContactFromFavourite(dto: AddContactToFavouriteRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddContactToFavouriteRequest>(
                ContactEventType.RemoveContactFromFavourite,
                {
                    ...dto,
                }
            )
        );
    }

    async createNewContact(dto: CreateNewContactRequest): Promise<ApiSuccessResponse> {
        let uploadedAvatar: string | undefined;
        if (dto?.avatar?.buffer?.length) {
            const uploadedImage = await this.s3Service.uploadImage({
                stream: dto.avatar.buffer,
                mimetype: dto.avatar.mimetype,
                imageFolder: uploadFolders.contactAvatars,
            });
            if (!uploadedImage?.imageUrl) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }
            const uploadedThumbnail = await this.s3Service.resizeImage({ key: uploadedImage.imageKey });

            uploadedAvatar = uploadedThumbnail.thumbnailUrl;

            delete dto?.avatar;
        }

        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, CreateNewContactRequest>(ContactEventType.CreateNewContact, {
                ...dto,
                uploadedAvatar,
            })
        );
    }

    async changeStatusOfContact(dto: ChangeStatusOfContactRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, ChangeStatusOfContactRequest>(
                ContactEventType.ChangeStatusOfContact,
                {
                    ...dto,
                }
            )
        );
    }

    async createCustomGroup(dto: CreateContactCustomGroupRequest): Promise<CreateContactCustomGroupResponse> {
        return await lastValueFrom(
            this.natsClient.send<CreateContactCustomGroupResponse, CreateContactCustomGroupRequest>(
                ContactEventType.CreateCustomGroup,
                {
                    ...dto,
                }
            )
        );
    }

    async addContactToGroup(dto: AddContactToGroupRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddContactToGroupRequest>(ContactEventType.AddContactToGroup, {
                ...dto,
            })
        );
    }

    async deleteMemberFromGroup(dto: DeleteMemberFromGroupRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, DeleteMemberFromGroupRequest>(
                ContactEventType.DeleteMemberFromGroup,
                {
                    ...dto,
                }
            )
        );
    }

    async addContactToDocumentGroup(dto: AddContactToDocumentGroupRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddContactToDocumentGroupRequest>(
                ContactEventType.AddContactToDocumentGroup,
                {
                    ...dto,
                }
            )
        );
    }

    async deleteContactFromDocumentGroup(dto: DeleteContactFromDocumentGroupRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, DeleteContactFromDocumentGroupRequest>(
                ContactEventType.DeleteContactFromDocumentGroup,
                {
                    ...dto,
                }
            )
        );
    }

    async deleteContactGroup(dto: ContactGroupIdRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, ContactGroupIdRequest>(ContactEventType.DeleteContactGroup, {
                ...dto,
            })
        );
    }

    async updateContactGroup(dto: UpdateContactGroupRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, UpdateContactGroupRequest>(ContactEventType.UpdateContactGroup, {
                ...dto,
            })
        );
    }

    async importContactsFromCsv({ csv, userId }: ImportContactsFromCsvRequest): Promise<ApiSuccessResponse> {
        if (!csv || !userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const stream = Readable.from(csv.buffer);
        parse(stream, {
            header: true,
            worker: true,
            dynamicTyping: true,
            delimiter: ',',
            complete: async (results) => {
                await lastValueFrom(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.natsClient.send<ApiSuccessResponse, { contactDatas: ContactInfoRequest[]; userId: number }>(
                        ContactEventType.ImportContactsFromCsv,
                        {
                            contactDatas: results.data as ContactInfoRequest[],
                            userId,
                        }
                    )
                ).catch((err) => {
                    this.logger.error(err);
                });
            },
        });

        return { ok: true };
    }

    async getCsvExample(): Promise<GetCsvExampleResponse> {
        return { url: this.csvExampleUrl };
    }

    async updateContact(dto: UpdateContactRequest): Promise<UpdateContactResponse> {
        let uploadedAvatar: string | undefined;
        if (dto?.avatar?.buffer?.length) {
            const uploadedImage = await this.s3Service.uploadImage({
                stream: dto.avatar.buffer,
                mimetype: dto.avatar.mimetype,
                imageFolder: uploadFolders.contactAvatars,
            });
            if (!uploadedImage?.imageUrl) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }
            const uploadedThumbnail = await this.s3Service.resizeImage({ key: uploadedImage.imageKey });

            uploadedAvatar = uploadedThumbnail.thumbnailUrl;

            delete dto?.avatar;
        }

        return await lastValueFrom(
            this.natsClient.send<UpdateContactResponse, UpdateContactRequest>(ContactEventType.UpdateContact, {
                ...dto,
                uploadedAvatar,
            })
        );
    }

    async getAllDocumentGroupsAndContacts(
        dto: GetAllDocumentGroupsAndContactsRequest
    ): Promise<GetDocumentGrroupsAndContactsResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetDocumentGrroupsAndContactsResponse, GetAllDocumentGroupsAndContactsRequest>(
                DocumentEventType.GetAllDocumentGroupsAndContacts,
                {
                    ...dto,
                }
            )
        );
    }

    async getGroupsWithContacts(dto: UserIdRequest): Promise<GetDocumentGrroupsAndContactsResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetDocumentGrroupsAndContactsResponse, UserIdRequest>(
                ContactEventType.GetGroupsWithContacts,
                {
                    ...dto,
                }
            )
        );
    }

    async addGroupToFavourite(dto: AddGroupToFavouriteRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, AddGroupToFavouriteRequest>(ContactEventType.AddGroupToFavourite, {
                ...dto,
            })
        );
    }

    async changeStatusOfContactsBulk(dto: ChangeStatusOfContactsBulkRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, ChangeStatusOfContactsBulkRequest>(
                ContactEventType.ChangeStatusOfContactsBulk,
                {
                    ...dto,
                }
            )
        );
    }
}
