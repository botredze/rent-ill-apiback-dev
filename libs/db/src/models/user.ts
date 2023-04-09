import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '..';
import { SignyDocumentSignatories, UserSession, UserSubscription } from '.';
import { Language, StatusType } from '@signy/common';
import { authConstants } from '@signy/auth';
import { UserProfile } from './user.profile';
import { AuthType } from '@signy/auth';
import { AuthSessionUserResponse, SessionUserInfo, UserBaseInfo } from '@signy/auth';
import { OtpUserInfo } from '@signy/otp';
import { UserSearchBaseInfo } from '@signy/user';

export class User extends Model {
    id: number;
    // Auth
    auth_type: AuthType;
    email?: string | null;
    phone?: string[] | null;

    is_email_verified: boolean;
    is_phone_verified: boolean;
    is_terms_policy_accepted: boolean;
    is_trail_on: boolean;

    ext_user_apple_id?: string | null;
    ext_user_google_id?: string | null;
    ext_user_facebook_id?: string | null;
    ext_user_email?: string | null;
    ext_user_name?: string | null;
    ext_user_avatar?: string | null;
    ext_user_phone?: string | null;

    national_id?: string | null;

    language?: Language;

    temp_email?: string | null;

    is_user_hints_passed: boolean;

    drive_token?: string;

    status: StatusType;

    sessionToken?: string;

    profile?: UserProfile;
    session?: UserSession;
    subscription?: UserSubscription;
    signatory?: SignyDocumentSignatories;

    static get tableName() {
        return dbNames.users.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],

            properties: {
                id: { type: 'integer' },
                // Auth
                auth_type: { enum: Object.values(AuthType), default: AuthType.Email },

                email: { type: ['null', 'string'], maxLength: authConstants().maxEmailLength },
                phone: { type: 'array' },

                is_email_verified: { type: 'boolean', default: false },
                is_phone_verified: { type: 'boolean', default: false },

                is_terms_policy_accepted: { type: 'boolean', default: false },

                is_trail_on: { type: 'boolean' },

                ext_user_apple_id: { type: ['null', 'string'] },
                ext_user_google_id: { type: ['null', 'string'] },
                ext_user_facebook_id: { type: ['null', 'string'] },
                ext_user_email: { type: ['null', 'string'] },
                ext_user_name: { type: ['null', 'string'] },
                ext_user_avatar: { type: ['null', 'string'] },
                ext_user_phone: { type: ['null', 'string'] },

                national_id: { type: ['null', 'string'] },

                language: { enum: Object.values(Language), default: Language.En },

                drive_token: { type: ['null', 'string'] },

                temp_email: { type: ['null', 'string'] },

                is_user_hints_passed: { type: 'boolean', default: false },

                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            session: {
                relation: Model.HasOneRelation,
                modelClass: UserSession,
                modify: 'active',
                join: {
                    from: `${dbNames.users.tableName}.id`,
                    to: `${dbNames.userSessions.tableName}.user_id`,
                },
            },
            profile: {
                relation: Model.HasOneRelation,
                modelClass: UserProfile,
                join: {
                    from: `${dbNames.users.tableName}.id`,
                    to: `${dbNames.userProfiles.tableName}.user_id`,
                },
            },
            subscription: {
                relation: Model.HasOneRelation,
                modelClass: UserSubscription,
                join: {
                    from: `${dbNames.users.tableName}.id`,
                    to: `${dbNames.userSubscriptions.tableName}.user_id`,
                },
            },
            signatory: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocumentSignatories,
                join: {
                    from: `${dbNames.users.tableName}.id`,
                    to: `${dbNames.signyDocumentSignatories.tableName}.user_id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = User;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    static externalUserIdKey(externalAuthType: AuthType): string {
        switch (externalAuthType) {
            case AuthType.Apple:
                return 'ext_user_apple_id';
            case AuthType.Google:
                return 'ext_user_google_id';
            case AuthType.Facebook:
                return 'ext_user_facebook_id';
        }

        return '';
    }

    isActive(): boolean {
        return this.status === StatusType.Active;
    }

    get isFullAccess(): boolean {
        return !!this.subscription?.isFullAccess;
    }

    toSessionUserInfoDTO(): SessionUserInfo {
        return {
            id: this.id,

            authType: this.auth_type,
            sessionToken: this.sessionToken,

            fullName: this.profile ? this.profile.fullName : undefined,

            email: this?.email ? this.email : undefined,
            phone: this?.phone?.length ? this.phone : undefined,

            dob: this?.profile?.date_of_birth
                ? new Date(this.profile.date_of_birth).toISOString().substr(0, 10)
                : undefined,

            suffix: this?.profile?.suffix ? this.profile.suffix : undefined,

            gender: this?.profile?.gender ? this.profile.gender : undefined,

            language: this?.language,

            isEmailVerified: !!this.is_email_verified,
            isPhoneVerified: !!this.is_phone_verified,

            isTermsAndPolicyAccepted: !!this.is_terms_policy_accepted,

            isTrailOn: !!this.is_trail_on,

            isDriveSyncOn: !!this.drive_token,

            isUserProfileSetupRequired: !!this.profile?.isUserProfileSetupRequired,

            canChangeEmail: Boolean(this.auth_type === AuthType.Email),
            canChangePassword: Boolean(this.auth_type === AuthType.Email),

            isUserHintsPassed: Boolean(this.is_user_hints_passed),

            signatory: this.signatory?.toSignatoryBaseInfo(),
        };
    }

    toAuthSessionUserDTO(): AuthSessionUserResponse {
        return {
            sessionUser: this.toSessionUserInfoDTO(),
            userBaseInfo: this.profile ? this.profile.toUserBaseInfo() : undefined,
            userSettings: this.profile ? this.profile.toNotificationBaseInfo() : undefined,
        };
    }

    toOtpUserInfoDTO(): OtpUserInfo {
        return {
            id: this.id,
            fullName: this.profile ? this.profile.fullName : undefined,
            email: this?.email ? this.email : undefined,
            phone: this?.phone?.length ? this.phone[0] : undefined,
            isPhoneVerified: !!this.is_phone_verified,
            isEmailVerified: !!this.is_email_verified,
            tempEmail: this.temp_email || undefined,
            canChangeEmail: Boolean(this.auth_type === AuthType.Email),
        };
    }

    toUserBaseInfoDTO(): UserBaseInfo {
        return {
            firstName: this.profile?.first_name || undefined,
            lastName: this.profile?.last_name || undefined,
            userName: this.profile?.toUserNameDTO(),
            avatar: this.profile?.avatar || undefined,
            dob: this?.profile?.date_of_birth
                ? new Date(this.profile.date_of_birth).toISOString().substr(0, 10)
                : undefined,

            suffix: this?.profile?.suffix ? this.profile.suffix : undefined,

            gender: this?.profile?.gender ? this.profile.gender : undefined,
            phone: this?.phone?.length ? this.phone : undefined,
            location: this.profile?.location || undefined,
        };
    }

    toUserSearchBaseInfo(): UserSearchBaseInfo {
        return {
            id: this.id,
            email: this?.email || undefined,
            phone: this?.phone || undefined,
        };
    }
}
