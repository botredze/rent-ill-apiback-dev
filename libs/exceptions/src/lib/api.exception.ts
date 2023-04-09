import { ApiEC } from './enums';
import { errorTranslate } from './dict.exception';
import { ApiErrorResponse } from './dto';

export class ApiException extends Error {
    private readonly errorCode: ApiEC;

    constructor(errorCode: ApiEC, message?: string) {
        super(message ?? ApiException.defaultMessageKeyForErrorCode(errorCode));
        this.errorCode = errorCode;
    }

    toErrorDTO(): ApiErrorResponse {
        const title = ApiException.titleForErrorCode(this.errorCode);
        const body = this.message ?? ApiException.bodyForErrorCode(this.errorCode);
        return {
            errorCode: this.errorCode,
            title: title ? errorTranslate(title) : undefined,
            message: errorTranslate(body),
            isForceLogout: ApiException.isForceLogoutErrorCode(this.errorCode),
            isSusbcriptionError: ApiException.isSubscriptionErrorCode(this.errorCode),
        };
    }

    private static isForceLogoutErrorCode(errorCode: ApiEC): boolean {
        return errorCode === ApiEC.AccessDenied;
    }

    private static isSubscriptionErrorCode(errorCode: ApiEC): boolean {
        return (
            errorCode === ApiEC.UpgradePlanForDocuments ||
            errorCode === ApiEC.UpgradePlanForSms ||
            errorCode === ApiEC.UpgradePlanForStorage ||
            errorCode === ApiEC.UpgradePlanForTemplates
        );
    }

    private static defaultMessageKeyForErrorCode(errorCode: ApiEC): string {
        switch (errorCode) {
            case ApiEC.InternalServerError:
                return 'API_ERROR_INTERNAL_SERVER_ERROR';
            case ApiEC.WrongAppKey:
                return 'API_ERROR_WRONG_APP_KEY';
            case ApiEC.AccessDenied:
                return 'API_ERROR_ACCESS_DENIED';
            case ApiEC.WrongInput:
                return 'API_ERROR_WRONG_INPUT';
            case ApiEC.IncorrectEmailOrPassword:
                return 'API_ERROR_INCORRECT_EMAIL_OR_PASSWORD';
            case ApiEC.UserNotFoundByEmail:
                return 'API_ERROR_USER_NOT_FOUND_BY_EMAIL';
            case ApiEC.EmailAlreadyRegistered:
                return 'API_ERROR_EMAIL_ALREADY_REGISTERED';
            case ApiEC.UserCredentialNotFound:
                return 'API_ERROR_USER_CREDENTIAL_NOT_FOUND';
            case ApiEC.EmailAlreadyVerified:
                return 'API_ERROR_EMAIL_ALREADY_VERIFIED';
            case ApiEC.PasswordNotMatch:
                return 'API_ERROR_PASSWORD_NOT_MATCH';
            case ApiEC.OTPCodeExpired:
                return 'API_ERROR_OTP_CODE_EXPIRED';
            case ApiEC.WrongPasswordRecoveryToken:
                return 'API_ERROR_WRONG_PASSWORD_RECOVERY_TOKEN';
            case ApiEC.PasswordRecoveryTokenExpired:
                return 'API_ERROR_PASSWORD_RECOVERY_TOKEN_EXPIRED';
            case ApiEC.UserEmailIsNotVerified:
                return 'API_ERROR_USER_EMAIL_IS_NOT_VERIFIED';
            case ApiEC.AccountInactive:
                return 'API_ERROR_ACCOUNT_INACTIVE';
            case ApiEC.ImageFileRequired:
                return 'API_ERROR_IMAGE_FILE_REQUIRED';
            case ApiEC.WrongImageFormat:
                return 'API_ERROR_WRONG_IMAGE_FORMAT';
            case ApiEC.UserNotFound:
                return 'API_ERROR_USER_NOT_FOUND';
            case ApiEC.FileTooLarge:
                return 'API_ERROR_FILE_TOO_LARGE';
            case ApiEC.EmailWrong:
                return 'API_ERROR_EMAIL_WRONG';
            case ApiEC.NotOwnerOfAssignmentOrAccepted:
                return 'API_ERROR_NOT_OWNER_OF_ASSIGNMENT';
            case ApiEC.AssignmentNotFound:
                return 'API_ERROR_ASSIGNMENT_NOT_FOUND';
            case ApiEC.NewsDeletedOrAccepted:
                return 'API_ERROR_NEWS_DELETED_OR_ACCPETED';
            case ApiEC.SubmissionNotFound:
                return 'API_ERROR_SUBMISSION_NOT_FOUND';
            case ApiEC.ExceededLimitOfFiles:
                return 'API_ERROR_EXCEEDED_LIMIT_OF_FILES';
            case ApiEC.NewsChannelNotFound:
                return 'API_ERROR_NEWS_CHANNEL_NOT_FOUND';
            case ApiEC.NewPasswordEqualCurrent:
                return 'API_ERROR_NEW_PASSWORD_EQUAL_CURRENT';
            case ApiEC.NewsNotFound:
                return 'API_ERROR_NEWS_NOT_FOUND';
            case ApiEC.NewsRoomNotFound:
                return 'API_ERROR_NEWS_ROOM_NOT_FOUND';
            case ApiEC.MediaTypeNotAllowed:
                return 'API_ERROR_MEDIA_TYPE_NOT_ALLOWED';
            case ApiEC.DeletedUserAccount:
                return 'API_ERROR_DELETED_USER_ACCOUNT';
            case ApiEC.WrongPassword:
                return 'API_ERROR_WRONG_PASSWORD';
            case ApiEC.NoFilesInSubmission:
                return 'API_ERROR_NO_FILES_IN_SUBMISSION';
            case ApiEC.VideoTooLong:
                return 'API_ERROR_VIDEO_TOO_LONG';
            case ApiEC.SubmissionNotAccepted:
                return 'API_ERROR_SUBMISSION_NOT_ACCEPTED';
            case ApiEC.UserNameAlreadyTaken:
                return 'API_ERROR_USER_NAME_ALREADY_TAKEN';
            case ApiEC.UserLocationOutOfRange:
                return 'API_ERROR_USER_LOCATION_OUT_OF_RANGE';
            case ApiEC.CategoryNotFound:
                return 'API_ERROR_CATEGORY_NOT_FOUND';
            case ApiEC.CategoryExists:
                return 'API_ERROR_CATEGORY_EXISTS';
            case ApiEC.SubmissionDistanceWrong:
                return 'API_ERROR_SUBMISSION_DISTANCE_WRONG';
            case ApiEC.CompanyNotFound:
                return 'API_ERROR_COMPANY_NOT_FOUND';
            case ApiEC.BranchNotFound:
                return 'API_ERROR_BRANCH_NOT_FOUND';
            case ApiEC.InvitationAlreadyExists:
                return 'API_ERROR_INVITATION_ALREADY_EXISTS';
            case ApiEC.PhoneAlreadyRegistered:
                return 'API_ERROR_PHONE_ALREADY_REGISTERED';
            case ApiEC.RoleNotFound:
                return 'API_ERROR_ROLE_NOT_FOUND';
            case ApiEC.AlreadyMember:
                return 'API_ERROR_ALREADY_MEMBER';
            case ApiEC.BuildingNotFound:
                return 'API_ERROR_BUILDING_NOT_FOUND';
            case ApiEC.ApartmentNotFound:
                return 'API_ERROR_APARTMENT_NOT_FOUND';
            case ApiEC.UnitNotFound:
                return 'API_ERROR_UNIT_NOT_FOUND';
            case ApiEC.RoomNotFound:
                return 'API_ERROR_ROOM_NOT_FOUND';
            case ApiEC.SignyContactNotFound:
                return 'API_ERROR_SIGNY_CONTACT_NOT_FOUND';
            case ApiEC.SignyGroupNotFound:
                return 'API_ERROR_SIGNY_GROUP_NOT_FOUND';
            case ApiEC.SignyDocumentNotFound:
                return 'API_ERROR_SIGNY_DOCUMENT_NOT_FOUND';
            case ApiEC.ContactWithSuchEmailExists:
                return 'API_ERROR_CONTACT_WITH_SUCH_EMAIL_EXISTS';
            case ApiEC.ContactWithSuchPhoneExists:
                return 'API_ERROR_CONTACT_WITH_SUCH_PHONE_EXISTS';
            case ApiEC.ContactWithSuchWhatsappExists:
                return 'API_ERROR_CONTACT_WITH_SUCH_WHATSAPP_EXISTS';
            case ApiEC.ContactWithSuchTelegramExists:
                return 'API_ERROR_CONTACT_WITH_SUCH_TELEGRAM_EXISTS';
            case ApiEC.ContactWithTelegramNickNameExists:
                return 'API_ERROR_CONTACT_WITH_SUCH_TELEGRAM_NICK_NAME_EXISTS';
            case ApiEC.SignyInputNotFound:
                return 'API_ERROR_SIGNY_INPUT_NOT_FOUND';
            case ApiEC.UserNotExists:
                return 'API_ERROR_USER_NOT_EXIST';
            case ApiEC.SignatoryExists:
                return 'API_ERROR_SIGNATORY_EXISTS';
            case ApiEC.SignyEmailTemplateNotFound:
                return 'API_ERROR_SIGNY_EMAIL_TEMPLATE_NOT_FOUND';
            case ApiEC.SmsInfoNotFound:
                return 'API_ERROR_SMS_INFO_NOT_FOUND';
            case ApiEC.SignatoryNotFound:
                return 'API_ERROR_SIGNATORY_NOT_FOUND';
            case ApiEC.PassCodeNotFound:
                return 'API_ERROR_PASS_CODE_NOT_FOUND';
            case ApiEC.InvalidPassCode:
                return 'API_ERROR_INVALID_PASS_CODE';
            case ApiEC.UserPhoneIsNotVerified:
                return 'API_ERROR_USER_PHONE_IS_NOT_VERIFIED';
            case ApiEC.InvalidPhoneNumberForIsrael:
                return 'API_ERROR_INVALID_PHONE_NUMBER_FOR_ISRAEL';
            case ApiEC.SubscriptionPlanNotFound:
                return 'API_ERROR_SUBSCRIPTION_PLAN_NOT_FOUND';
            case ApiEC.CouponNotFound:
                return 'API_ERROR_COUPON_NOT_FOUND';
            case ApiEC.SignatoryUserPasswordNotExists:
                return 'API_ERROR_SIGNATURE_PASSWORD_NOT_EXISTS';
            case ApiEC.TemplateNotFound:
                return 'API_ERROR_TEMPLATE_NOT_FOUND';
            case ApiEC.UpgradePlanForDocuments:
                return 'API_ERROR_UPGRADE_PLAN_FOR_DOCUMENTS';
            case ApiEC.UpgradePlanForTemplates:
                return 'API_ERROR_UPGRADE_PLAN_FOR_TEMPLATES';
            case ApiEC.UpgradePlanForSms:
                return 'API_ERROR_UPGRADE_PLAN_FOR_SMS';
            case ApiEC.UpgradePlanForStorage:
                return 'API_ERROR_UPGRADE_PLAN_FOR_STORAGE';
            case ApiEC.DocumentAlreadySharedToSignatory:
                return 'API_ERROR_DOCUMENT_ALREADY_SHARED_TO_SIGNATORY';
        }

        return '';
    }

    private static titleForErrorCode(errorCode: ApiEC): string | null {
        switch (errorCode) {
            case ApiEC.IncorrectEmailOrPassword:
                return 'API_ERROR_INCORRECT_EMAIL_OR_PASSWORD';
            case ApiEC.UserNotFoundByEmail:
                return 'API_ERROR_USER_NOT_FOUND_BY_EMAIL';
        }

        return null;
    }

    private static bodyForErrorCode(errorCode: ApiEC): string {
        switch (errorCode) {
            case ApiEC.IncorrectEmailOrPassword:
            case ApiEC.UserNotFoundByEmail:
                return 'API_ERROR_INCORRECT_INPUT_DATA';
        }

        return ApiException.defaultMessageKeyForErrorCode(errorCode);
    }
}
