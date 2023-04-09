export enum SignyEmailEventType {
    CreateEmailTemplate = 'CREATE_EMAIL_TEMPLATE',
    UploadTemplateFilesToS3 = 'UPLOAD_TEMPLATE_FILES_TO_S3',
    UploadCompanyLogo = 'UPLOAD_COMPANY_LOGO',
    GetSignyEmailTemplateById = 'GET_SIGNY_EMAIL_TEMPLATE_BY_ID',
    SignySendEmail = 'SIGNY_SEND_EMAIL',
    SignySendSms = 'SIGNY_SEND_SMS',
    CreateSmsTemplate = 'SIGNY_CREATE_SMS_TEMPLATE',
    GetSignySmsTemplateById = 'GET_SIGNY_SMS_TEMPLATE_BY_ID',
}

export enum SignyEmailTypes {
    SignInvitation = 'sign_invitation',
    RequestForChanges = 'request_for_changes',
    Reviewd = 'reviewd',
    Accepted = 'accepted',
    Rejected = 'rejected',
    Pending = 'pending',
    Canceled = 'canceled',
}
