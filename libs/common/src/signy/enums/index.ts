export enum SignyEventType {
    SignPdf = 'SIGN_PDF',
    CheckIfSignatureExists = 'CHECK_IF_SIGNATURE_EXISTS',
}

export enum SignatoryRoleTypes {
    Signer = 'SIGNER',
    Validator = 'VALIDATOR',
    Viewer = 'VIEWER',
}

export enum SignatureTypes {
    Digital = 'DIGITAL',
    Simple = 'SIMPLE',
}

export enum SigningStatusTypes {
    Rejected = 'REJECTED',
    AskForReview = 'ASK_FOR_REVIEW',
    Pending = 'PENDING',
    Signed = 'SIGNED',
    Done = 'DONE',
    Canceled = 'CANCELED',
}

export enum ReadStatusTypes {
    NotReceived = 'NOT_RECEIVED',
    Sent = 'SENT',
    NotSent = 'NOT_SENT',
    Opened = 'OPENED',
    Read = 'READ',
}
