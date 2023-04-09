export enum AuthType {
    Email = 'EMAIL',
    Phone = 'PHONE',
    Apple = 'APPLE',
    Google = 'GOOGLE',
    Facebook = 'FACEBOOK',
    Guest = 'GUEST',
    Signatory = 'SIGNATORY',
}

export enum AuthEventType {
    CheckUserExists = 'CHECK_USER_EXISTS',
    SignUpLocal = 'SIGN_UP_LOCAL',
    SignUpLocalInternal = 'SIGN_UP_LOCAL_INTERNAL',
    SignUpExternal = 'SIGN_UP_EXTERNAL',
    GetSessionUser = 'GET_SESSION_USER',
    GetUserById = 'GET_USER_BY_ID',
    GetUserByCredentials = 'GET_USER_BY_CREDENTIALS',
    CheckPassword = 'CHECK_PASSWORD',
    ChangePassword = 'CHANGE_PASSWORD',
    ChangeEmail = 'CHANGE_EMAIL',
    SetFcmToken = 'SET_FCM_TOKEN',
    UserSignIn = 'USER_SIGN_IN',
    UserSignOut = 'USER_SIGN_OUT',
    UserDeleteAccount = 'USER_DELETE_ACCOUNT',
    AcceptTermsPolicy = 'ACCEPT_TERMS_POLICY',
    VerificationOtpCode = 'VERIFICATION_OTP_CODE',
    VerificationCodeResend = 'VERIFICATION_CODE_RESEND',
    ResetPassword = 'RESET_PASSWORD',
    VerifyResetPassword = 'VERIFY_RESET_PASSWORD',
    RecoverPassword = 'RECOVER_PASSWORD',
    GetUsersByIds = 'GET_USERS_BY_IDS',
    SignUpByInvitation = 'SIGN_UP_BY_INVITATION',
}

export enum VerificationType {
    Required = 'REQUIRED',
    Pending = 'PENDING',
    Passed = 'PASSED',
}
