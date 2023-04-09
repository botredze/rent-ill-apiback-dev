export enum OtpType {
    CurrentEmail = 'CURRENT_EMAIL',
    ResetPassword = 'RESET_PASSWORD',
    ChangeEmail = 'CHANGE_EMAIL',
    ChangePhone = 'CHANGE_PHONE',
    NewEmail = 'NEW_EMAIL',
    LastPhone = 'LAST_PHONE',
}

export enum OtpEventType {
    VerifyOtpCode = 'VERIFY_OTP_CODE',
    ResendOtpCode = 'RESEND_OTP_CODE',
    IsOtpCodeValid = 'IS_OTP_CODE_VALID',
    DisableOtpCode = 'DISABLE_OTP_CODE',
}
