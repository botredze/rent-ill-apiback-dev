export class OtpUserInfo {
    id: number;

    fullName?: string;

    email?: string;
    isEmailVerified: boolean;

    phone?: string;
    isPhoneVerified: boolean;

    tempEmail?: string;
    canChangeEmail: boolean;
}
