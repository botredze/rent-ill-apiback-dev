export enum EmailType {
    CurrentEmail = 'current_email',
    ChangeEmail = 'change_email',
    NewEmail = 'new_email',
    ResetPassword = 'reset_password',
    RestorePassword = 'restore_password',
    PasswordChanged = 'password_changed',
    SupportTeam = 'support_team',
    PasswordCreated = 'password_created',
    SignySharedDocument = 'signy_shared_document',
    SignatoryAudit = 'signatory_audit',
    DocumentOwnerAudit = 'document_owner_audit',
}

export enum EmailEventType {
    SendEmail = 'SEND_EMAIL',
    SendBulkEmail = 'SEND_BULK_EMAIL',
}
