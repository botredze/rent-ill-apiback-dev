export enum SignatoryEventTypes {
    CreateSignatory = 'CREATE_SIGNATORY',
    AddSignatoryToDocument = 'ADD_SIGNATORY_TO_DOCUMENT',
    SearchSignatoriesWithFilter = 'SEARCH_SIGNATORIES_WITH_FILTER',
    SignatoryAddInputHistory = 'SIGNATURE_ADD_INPUT_HISTORY',
    IsPassCodeExists = 'IS_PASS_CODE_EXISTS',
    GetDocumentInputHistory = 'GET_DOCUMENT_INPUT_HISTORY',
    UpdateSignatory = 'UPDATE_SIGNATORY',
    DeleteSignatory = 'DELETE_SIGNATORY',
    SignOrderBulkUpdate = 'SIGN_ORDER_BULK_UPDATE',
    UploadSignature = 'UPLOAD_SIGNATURE',
    DeleteSignature = 'DELETE_SIGNATURE',
}

export enum SignatoriesSearchTypes {
    Name = 'NAME',
    Email = 'EMAIL',
    Phone = 'PHONE',
    Whatsapp = 'WHATSAPP',
    Telegram = 'TELEGRAM',
    TelegramNick = 'TELEGRAM_NICK',
}
