export enum DocumentEventType {
    UploadDocument = 'UPLOAD_DOCUMENT',
    ChangeStatusOfDocument = 'CHANGE_STATUS_OF_DOCUMENT',
    GetDocumentById = 'GET_DOCUMENT_BY_ID',
    ChangeDocumentStepType = 'CHANGE_DOCUMENT_STEP_TYPE',
    GetUserDocuments = 'GET_USER_DOCUMENTS',
    GetDocumentWithPermission = 'GET_DOCUMENT_WITH_PERMISSION',
    GetIsSameDocumentSign = 'GET_IS_SAME_DOCUMENT_SIGN',
    UpdateDocumentFiles = 'UPDATE_DOCUMENT_FILES',
    CreateDocumentCustomGroup = 'CREATE_DOCUMENT_CUSTOM_GROUP',
    DeleteDocumentGroup = 'DELETE_DOCUMENT_GROUP',
    UpdateDocumentGroup = 'UPDATE_DOCUMENT_GROUP',
    CheckPassCode = 'CHECK_PASS_CODE',
    UpdateDocumentSettings = 'UPDATE_DOCUMENT_SETTINGS',
    GetAllDocumentGroupsAndContacts = 'GET_ALL_DOCUMENT_GROUPS_AND_CONTACTS',
    AddDocumentToGroup = 'ADD_DOCUMENT_TO_GROUP',
    ChangeStatusOfDocumentsBulk = 'CHANGE_STATUS_OF_DOCUMENTS_BULK',
    AddGroupToFavourite = 'ADD_DOCUMENT_GROUP_TO_FAVOURITE',
    GetAllUserDocumentGroups = 'GET_ALL_USER_DOCUMENT_GROUPS',
    GetSentDocuments = 'GET_SENT_DOCUMENTS',
    GetRecievedDocuments = 'GET_RECIVED_DOCUMENTS',
    CheckIfPassCodeExixsts = 'CHECK_IF_PASS_CODE_EXISTS',
    CreateDocumentFromTemplate = 'CREATE_DOCUMENT_FROM_TEMPLATE',
    CreateTemplateFromDocument = 'CREATE_TEMPLATE_FROM_DOCUMENT',
    GetUserDocumentsCount = 'GET_USER_DOCUMENTS_COUNT',
}

export enum SignyDocumentStepTypes {
    Prepare = 'PREPARE',
    Signing = 'SIGNING',
    Review = 'REVIEW',
    Completed = 'COMPLETED',
}

export enum ActionTypes {
    Prepare = 'PREPARE',
    Signing = 'SIGNING',
    Review = 'REVIEW',
    Completed = 'COMPLETED',
}
