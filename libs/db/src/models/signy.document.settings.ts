import { commonConstants, InputLocationTypes, NotificationLanguageTypes, StatusType, ThemeTypes } from '@signy/common';
import { SignyDocumentSettingsInfo } from '@signy/document';
import { UploadedImageInfo } from '@signy/upload';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocument } from './signy.document';

export class SignyDocumentSettings extends Model {
    id: number;
    document_id: number;
    expiration_date?: string;
    reminders_schedule?: string;
    is_required_for_everyone: boolean;
    is_sign_order_exists: boolean;
    notify_me: boolean;
    notification_lang: NotificationLanguageTypes;
    is_show_signature_on: boolean;
    is_verify_signature_on: boolean;
    is_branding_exists: boolean;
    is_private: boolean;
    is_same_document_sign: boolean;
    brand_logo?: UploadedImageInfo | null;
    horizontal_stack: boolean;
    is_one_question_on_the_screen: boolean;
    background_color?: string;
    brightness_percentage?: number;
    blur_percentage?: number;
    is_allow_return_to_previous_screen: boolean;
    send_progress_to_members: boolean;
    input_location: InputLocationTypes;
    drive_original_file_path: string;
    drive_signed_file_path: string;
    is_drive_synchronization_on: boolean;
    is_editable: boolean;
    pass_code?: string;
    theme: ThemeTypes;
    status: StatusType;

    document?: SignyDocument;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyDocumentSettings.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['document_id'],

            properties: {
                id: { type: 'integer' },
                document_id: { type: 'integer' },
                expiration_date: { type: ['null', 'string'] },
                reminders_schedule: { type: ['null', 'string'] },
                is_required_for_everyone: { type: 'boolean', default: false },
                is_sign_order_exists: { type: 'boolean', default: false },
                notify_me: { type: 'boolean', default: false },
                notification_lang: {
                    enum: Object.values(NotificationLanguageTypes),
                    default: NotificationLanguageTypes.En,
                },
                is_show_signature_on: { type: 'boolean', default: false },
                is_verify_signature_on: { type: 'boolean', default: false },
                is_branding_exists: { type: 'boolean', default: false },
                is_same_document_sign: { type: 'boolean', default: false },
                is_private: { type: 'boolean', default: true },
                brand_logo: { type: ['null', 'object'] },
                horizontal_stack: { type: 'boolean', default: false },
                is_one_question_on_the_screen: { type: 'boolean', default: false },
                background_color: { type: ['null', 'string'] },
                brightness_percentage: { type: ['null', 'integer'] },
                blur_percentage: { type: ['null', 'integer'] },
                is_allow_return_to_previous_screen: { type: 'boolean', default: false },
                send_progress_to_members: { type: 'boolean', default: false },
                drive_original_file_path: { type: 'string', default: commonConstants.defaultDriveOriginalFilePath },
                drive_signed_file_path: { type: 'string', default: commonConstants.defaultDriveSignedFilePath },
                is_drive_synchronization_on: { type: 'boolean', default: false },
                is_editable: { type: 'boolean', default: true },
                input_location: { enum: Object.values(InputLocationTypes), default: InputLocationTypes.Rtl },
                pass_code: { type: 'string' },
                theme: { enum: Object.values(ThemeTypes), default: ThemeTypes.Auto },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentSettings;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signyDocumentSettings.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
        };
    }

    toSignyDocumentSettingsBaseInfo(isOwner?: boolean): SignyDocumentSettingsInfo {
        return {
            expirationDate: this?.expiration_date || undefined,
            remindersSchedule: this?.reminders_schedule || undefined,
            isRequiredForEveryone: !!this.is_required_for_everyone,
            isSignOrderExists: !!this.is_sign_order_exists,
            notifyMe: !!this.notify_me,
            notificationLang: this.notification_lang,
            isShowSignatureOn: !!this.is_show_signature_on,
            isVerifySignatureOn: !!this.is_verify_signature_on,
            isBrandingExists: !!this.is_branding_exists,
            isPrivate: !!this.is_private,
            isSameDocumentSign: !!this.is_same_document_sign,
            brandLogo: this?.brand_logo || undefined,
            horizontalStack: !!this.horizontal_stack,
            isOneQuestionOnTheScreen: !!this.is_one_question_on_the_screen,
            backgroundColor: this?.background_color || undefined,
            brightnessPercentage: this?.brightness_percentage || undefined,
            blurPercentage: this?.blur_percentage || undefined,
            isAllowReturnToPreviousScreen: !!this.is_allow_return_to_previous_screen,
            sendProgressToMembers: !!this.send_progress_to_members,
            inputLocation: this.input_location,
            theme: this.theme,
            isPassCodeExists: !!this.pass_code,
            passCode: isOwner ? this?.pass_code : undefined,
            isDriveSyncOn: !!this.is_drive_synchronization_on,
            driveOriginalFilePath: this?.drive_original_file_path,
            driveSignedFilePath: this?.drive_signed_file_path,
            isEditable: !!this.is_editable,
        };
    }
}
