import { AnyQueryBuilder, Model, RawBuilder } from 'objection';
import { dbNames } from '..';
import { User } from '.';
import { UploadedImageInfo } from '@signy/upload';
import { commonConstants, CoordsInfo, StatusType } from '@signy/common';
import { UserBaseInfo, UserSettingsInfo } from '@signy/auth';
import { PersonalBaseInfo, PersonDetailedBaseInfo, UserProfileInfo } from '@signy/profile';
import { GenderTypes, UserSuffixeTypes } from '@signy/user';

export class UserProfile extends Model {
    id: number;
    user_id: number;

    first_name?: string | null;
    last_name?: string | null;
    user_name?: string | null;

    suffix?: UserSuffixeTypes | null;

    date_of_birth?: Date | string | null;

    gender?: GenderTypes | null;

    avatar?: UploadedImageInfo | null;

    is_notifications_on: boolean;

    //Experience

    location?: string | null;

    latitude?: number | null;
    longitude?: number | null;
    coords?: RawBuilder | string;
    time_zone?: string;

    user?: User;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.userProfiles.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                first_name: { type: ['null', 'string'] },
                last_name: { type: ['null', 'string'] },
                user_name: { type: ['null', 'string'] },
                suffix: { enum: Object.values(UserSuffixeTypes) },
                date_of_birth: { type: 'string' },
                gender: { enum: Object.values(GenderTypes) },
                avatar: { type: ['null', 'object'] },
                location: { type: ['null', 'string'] },
                is_notifications_on: { type: 'boolean', default: true },

                // Preferences
                latitude: { type: ['null', 'number'], default: 0 },
                longitude: { type: ['null', 'number'], default: 0 },
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${dbNames.userProfiles.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = User;
                builder.where(ref('user.status'), '!=', StatusType.Deleted);
            },
        };
    }

    get fullName(): string | undefined {
        const fullName: string[] = [];
        if (this?.first_name) {
            fullName.push(this.first_name);
        }
        if (this?.last_name) {
            fullName.push(this.last_name);
        }
        return fullName.length
            ? fullName.join(' ')
            : this?.user?.email
            ? this?.user?.email.substring(0, this?.user?.email.indexOf('@'))
            : commonConstants.defaultUserName;
    }

    get isUserProfileSetupRequired(): boolean {
        return !(this.first_name && this.last_name && this.location);
    }

    toUserNameDTO(): string {
        return commonConstants.userNamePrefix + (this.user_name || commonConstants.defaultUserName);
    }

    toAvatarDTO(): UploadedImageInfo | undefined {
        return this.avatar
            ? {
                  mimetype: this.avatar?.mimetype || undefined,
                  imageUrl: this.avatar?.imageUrl || '',
                  thumbnailUrl: this.avatar?.thumbnailUrl || undefined,
              }
            : undefined;
    }

    toCoordsBaseInfo(): CoordsInfo | undefined {
        if (!this.latitude && !this.longitude) {
            return;
        }
        return {
            latitude: this?.latitude || 0,
            longitude: this?.longitude || 0,
        };
    }

    toUserBaseInfo(): UserBaseInfo {
        return {
            firstName: this.first_name || undefined,
            lastName: this.last_name || undefined,
            userName: this.user_name ? this.toUserNameDTO() : undefined,
            location: this.location || undefined,
            avatar: this.toAvatarDTO(),
        };
    }

    toPersonalBaseInfo(): PersonalBaseInfo | undefined {
        return {
            id: this.user_id,
            email: this?.user?.email ? this.user.email : undefined,
            firstName: this?.first_name,
            lastName: this?.last_name,
            userName: commonConstants.userNamePrefix + (this.user_name || commonConstants.defaultUserName),
            location: this.location || undefined,
            dob: this?.date_of_birth ? new Date(this.date_of_birth).toISOString().substr(0, 10) : undefined,
            suffix: this?.suffix,
            gender: this?.gender,
            coords: this.toCoordsBaseInfo(),
        };
    }

    toDetailedPersonBaseInfo(): PersonDetailedBaseInfo {
        return {
            personalBaseView: this.toPersonalBaseInfo(),
            avatar: this.toAvatarDTO(),
            notification: this.toNotificationBaseInfo(),
        };
    }

    toNotificationBaseInfo(): UserSettingsInfo {
        return {
            isNotificationsOn: Boolean(this.is_notifications_on),
        };
    }

    toUserProfileInfo(): UserProfileInfo {
        return {
            profile: this?.toPersonalBaseInfo(),
            avatar: this?.toAvatarDTO(),
        };
    }

    get timeZone(): string {
        return this.time_zone ?? 'UTC';
    }
}
