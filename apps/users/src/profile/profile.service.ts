import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceRpcException } from '@signy/exceptions';
import { User, UserProfile } from '@signy/db';
import { commonConstants, UserIdRequest } from '@signy/common';
import { AnyQueryBuilder, Transaction } from 'objection';
import { ApiEC } from '@signy/exceptions';
import {
    CreateUserProfileRequest,
    EditLocationRequest,
    GetExtraUserInfoResponse,
    NotificationSettingsResponse,
    PersonalInformationRequest,
    SetNotificationRequest,
    SetUserAvatarResponse,
    UploadAvatarRequest,
    UserNameRequest,
    UserNameResponse,
    UserProfileBaseResponse,
    UserProfileExtendedResponse,
    UserProfileResponse,
} from '@signy/profile';
import { UploadedImageInfo } from '@signy/upload';
import { ApiSuccessResponse } from '@signy/exceptions';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { AuthType } from '@signy/auth';
import { PaginationService } from '@signy/pagination';
import { NotificationEventType } from '@signy/notification';
import { CheckUserExistsResponse } from '@signy/auth';
import tzlookup from 'tz-lookup';
import {
    SearchUserRequest,
    SearchUsersResponse,
    SetUserDriveTokenRequest,
    SetUserLangRequest,
    UserSearchType,
} from '@signy/user';
import {
    ContactEventType,
    GetUserContactsResponse,
    GetUserContactsWithFilterRequest,
    UpdateContactRequest,
    UserContactSearchTypes,
} from '@signy/contact';

@Injectable()
export class ProfileService {
    private logger: Logger;
    constructor(
        @Inject('PROFILE_SERVICE') private natsClient: ClientProxy,
        @Inject(User) private readonly userModel: typeof User,
        @Inject(UserProfile) private readonly userProfileModel: typeof UserProfile,
        private paginationService: PaginationService
    ) {
        this.logger = new Logger(ProfileService.name);
    }

    async checkUserNameExists({ userId, userName }: UserNameRequest): Promise<CheckUserExistsResponse> {
        return {
            exists: !!(await this.userProfileModel
                .query()
                .distinct('user_name')
                .whereRaw("LOWER(??) LIKE LOWER(CONCAT(?,'%'))", ['user_name', userName])
                .whereNot({ user_id: userId })
                .orderBy('user_name', 'DESC')
                .first()),
        };
    }

    async createUserProfile(
        { userId, extUserId, name }: CreateUserProfileRequest,
        trx?: Transaction
    ): Promise<GetExtraUserInfoResponse> {
        if (!userId) throw ServiceRpcException(ApiEC.WrongInput);

        let extUserValidatedProfile: Partial<UserProfile> | undefined = undefined;
        if (extUserId) {
            const extUserProfile = await this.userProfileModel.query(trx).findOne({ user_id: extUserId });

            extUserValidatedProfile = {
                first_name: extUserProfile?.first_name,
                last_name: extUserProfile?.last_name,
                location: extUserProfile?.location,
                suffix: extUserProfile?.suffix || undefined,
                gender: extUserProfile?.gender || undefined,
                latitude: extUserProfile?.latitude || undefined,
                longitude: extUserProfile?.longitude || undefined,
                time_zone: extUserProfile?.time_zone,
            };
        }
        const userProfile = extUserValidatedProfile
            ? await this.userProfileModel
                  .query(trx)
                  .insertAndFetch({
                      ...extUserValidatedProfile,
                      user_id: userId,
                      first_name: name,
                  })
                  .onConflict()
                  .merge()
            : await this.userProfileModel.query(trx).insertAndFetch({ user_id: userId }).onConflict().merge();

        if (!userProfile) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }
        return {
            userInfo: userProfile.toDetailedPersonBaseInfo(),
        };
    }

    async generateUserName({ userName }: UserNameRequest): Promise<UserNameResponse> {
        const latestUserName = await this.userProfileModel
            .query()
            .distinct('user_name')
            .whereRaw("LOWER(??) LIKE LOWER(CONCAT(?,'%'))", ['user_name', userName])
            .orderBy('user_name', 'DESC')
            .first();

        if (!latestUserName?.user_name) {
            return { userName };
        }

        const nextCount =
            parseInt(latestUserName.user_name.toLowerCase().replace(userName.toLowerCase(), '') || '0', 10) + 1;

        return { userName: userName + nextCount };
    }

    async setUserPersonalInformation(
        dto: PersonalInformationRequest,
        trx?: Transaction
    ): Promise<UserProfileBaseResponse> {
        const userProfile = await this.userProfileModel
            .query()
            .withGraphJoined('user')
            .findOne({ user_id: dto.userId });

        if (dto?.userName) {
            const takenUserName = await this.userProfileModel.query(trx).findOne({ user_name: dto.userName });
            if (takenUserName && takenUserName?.user_id !== dto.userId) {
                throw ServiceRpcException(ApiEC.UserNameAlreadyTaken);
            }
        }

        let contactId: number | undefined;
        if (userProfile?.user?.email && !userProfile?.user?.phone?.length) {
            const email =
                userProfile.user.auth_type === AuthType.Email
                    ? userProfile.user.email
                    : userProfile?.user?.ext_user_email
                    ? userProfile.user.ext_user_email
                    : null;

            if (email) {
                const { contacts } = await lastValueFrom(
                    this.natsClient.send<GetUserContactsResponse, GetUserContactsWithFilterRequest>(
                        ContactEventType.GetUserContacts,
                        {
                            userId: dto.userId,
                            searchType: UserContactSearchTypes.Email,
                            search: email,
                        }
                    )
                );

                if (contacts?.length && contacts[0]?.id) {
                    contactId = contacts[0]?.id;
                }
            }
        } else if (userProfile?.user?.phone?.length && !userProfile?.user?.email) {
            const { contacts } = await lastValueFrom(
                this.natsClient.send<GetUserContactsResponse, GetUserContactsWithFilterRequest>(
                    ContactEventType.GetUserContacts,
                    {
                        userId: dto.userId,
                        searchType: UserContactSearchTypes.Email,
                        search: userProfile.user.phone[0],
                    }
                )
            );

            if (contacts?.length && contacts[0]?.id) {
                contactId = contacts[0]?.id;
            }
        }
        if (contactId) {
            await lastValueFrom(
                this.natsClient.send<ApiSuccessResponse, UpdateContactRequest>(ContactEventType.UpdateContact, {
                    userId: dto.userId,
                    firstName: dto?.firstName || undefined,
                    lastName: dto?.lastName || undefined,
                    gender: dto?.gender || undefined,
                    dob: dto?.dob || undefined,
                    contactId,
                })
            );
        }

        const dbProfile: Partial<UserProfile> = {
            first_name: dto?.firstName,
            last_name: dto?.lastName,
            user_name: dto?.userName,
            location: dto?.location,
            date_of_birth: dto?.dob,
            suffix: dto?.suffix,
            gender: dto?.gender,
            latitude: dto?.coords?.latitude,
            longitude: dto?.coords?.longitude,
            time_zone:
                dto.coords?.latitude && dto.coords?.longitude
                    ? tzlookup(dto.coords.latitude, dto.coords.longitude)
                    : undefined,
        };

        if (userProfile) {
            await userProfile
                .$query(trx)
                .patchAndFetch({
                    user_id: dto.userId,
                    ...dbProfile,
                })
                .skipUndefined();
        } else {
            await this.userProfileModel.query(trx).insertAndFetch({ user_id: dto.userId });
        }

        if (!userProfile) throw ServiceRpcException(ApiEC.InternalServerError);

        return {
            personalInfo: userProfile?.toPersonalBaseInfo(),
        };
    }

    async setUserAvatar({
        userId,
        uploadedImage,
        uploadedThumbnail,
    }: UploadAvatarRequest): Promise<SetUserAvatarResponse> {
        if (!userId || !uploadedThumbnail || !uploadedImage) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        const userProfile = await this.userProfileModel.query().findOne({ user_id: userId });

        if (!userProfile) {
            throw ServiceRpcException(ApiEC.UserNotFound);
        }

        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        let exists: boolean = false;
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        let userAvatar: UploadedImageInfo | null = null;
        if (userProfile?.avatar) {
            exists = true;
            userAvatar = userProfile.avatar;
            await userProfile.$query().patchAndFetch({ avatar: null });
        }

        await userProfile.$query().patchAndFetch({ avatar: { ...uploadedImage, ...uploadedThumbnail } });

        if (!userProfile?.avatar) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return {
            uploadedImage: userProfile.toAvatarDTO(),
            avatarExists: {
                exists,
                userAvatar,
            },
        };
    }

    async getUserProfile({ userId }: UserIdRequest): Promise<UserProfileResponse> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const user = await this.userModel.query().modify('active').withGraphJoined('profile').findById(userId);

        if (!user?.profile) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        // const { hasNewNotifications } = await this.getExtendedUserProfile({
        //     userId,
        // });
        const userBaseInfo = user.toUserBaseInfoDTO();

        return {
            authType: user.auth_type,
            userEmail: user.auth_type === AuthType.Email || user.auth_type === AuthType.Phone ? user?.email : undefined,
            userBaseInfo,
            notification: user?.profile.toNotificationBaseInfo(),
            // hasNewNotifications,
        };
    }

    async getExtendedUserProfile({ userId }: UserIdRequest): Promise<UserProfileExtendedResponse> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const userProfile = await this.userProfileModel.query().withGraphJoined('user').findOne({ user_id: userId });

        if (!userProfile) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        const hasNewNotifications = await lastValueFrom(
            this.natsClient.send<boolean, UserIdRequest>(NotificationEventType.checkUserNotifications, {
                userId,
            })
        ).catch((err) => {
            this.logger.error('getUserProfile:' + err.message);
            return false;
        });

        return {
            userProfile: userProfile.toDetailedPersonBaseInfo(),
            hasNewNotifications,
        };
    }

    async setUserName({ userId, userName }: UserNameRequest): Promise<UserProfileBaseResponse> {
        if (!userName) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const takenUserName = await this.userProfileModel.query().findOne({ user_name: userName });

        if (takenUserName && takenUserName?.user_id !== userId) {
            throw ServiceRpcException(ApiEC.UserNameAlreadyTaken);
        }

        const userProfile = await this.userProfileModel.query().findOne({ user_id: userId });

        if (!userProfile) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        await userProfile.$query().patchAndFetch({ user_name: userName });

        return {
            personalInfo: userProfile.toPersonalBaseInfo(),
        };
    }

    async editLocation(dto: EditLocationRequest): Promise<ApiSuccessResponse> {
        if (!dto.userId || !dto.location) throw ServiceRpcException(ApiEC.WrongInput);

        const userProfile = !!(await this.userProfileModel
            .query()
            .where({ user_id: dto.userId })
            .patch({ location: dto.location, latitude: dto.latitude, longitude: dto.longitude }));

        return { ok: userProfile };
    }

    async setNotificationMessagesOn(dto: SetNotificationRequest): Promise<NotificationSettingsResponse> {
        return await this.setNotification({ userId: dto.userId }, { is_messages_on: dto.setRequestsUpdatesOn });
    }

    async setNotification(dto: UserIdRequest, line: Record<string, boolean>): Promise<NotificationSettingsResponse> {
        const userProfile = await this.userProfileModel.query().findOne({ user_id: dto.userId });

        if (!userProfile) throw ServiceRpcException(ApiEC.UserNotFound);

        await userProfile.$query().patchAndFetch(line);

        return { notification: userProfile.toNotificationBaseInfo() };
    }

    async getUserSettings(dto: UserIdRequest): Promise<NotificationSettingsResponse> {
        const userProfile = await this.userProfileModel.query().findOne({ user_id: dto.userId });
        return { notification: userProfile?.toNotificationBaseInfo() };
    }

    async searchUsers({ search, searchType, pageInfo }: SearchUserRequest): Promise<SearchUsersResponse> {
        const { pageIndex, itemsPerPage } = pageInfo ?? {};

        const { results, total } = await this.userModel
            .query()
            .modify('active')
            .where((wb: AnyQueryBuilder) => {
                if (search && searchType === UserSearchType.Email) {
                    if (search?.length > 3) {
                        wb.whereRaw('MATCH (email) AGAINST (?  IN BOOLEAN MODE)', [`"${search.trim()}*"`]);
                    } else {
                        wb.whereRaw('(email LIKE CONCAT(?, "%"))', [search.trim()]);
                    }
                }

                // if (search && searchType === UserSearchType.Phone) {
                //     if (search?.length > 3) {
                //         wb.whereRaw('MATCH (phone) AGAINST (?  IN BOOLEAN MODE)', [`${search.trim()}*`]);
                //     } else {
                //         wb.whereRaw('(phone LIKE CONCAT(?, "%"))', [search.trim()]);
                //     }
                // }
            })
            .orderBy('created_at', 'DESC')
            .page(pageIndex ? pageIndex - 1 : 0, itemsPerPage ?? commonConstants.maxSearchItemsPerPage);

        return {
            list: results.map((x) => x.toUserSearchBaseInfo()),
            pageInfo: this.paginationService.toPageInfoDTO({ total, ...pageInfo }),
        };
    }

    async setDriveToken({ userId, token }: SetUserDriveTokenRequest): Promise<ApiSuccessResponse> {
        if (!userId || !token) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const user = await User.query().findById(userId);

        if (!user) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        await user.$query().patch({
            drive_token: token,
        });

        return { ok: true };
    }

    async setUserLang({ lang, userId }: SetUserLangRequest): Promise<ApiSuccessResponse> {
        await User.query().findById(userId).patch({ language: lang });
        return {
            ok: true,
        };
    }
}
