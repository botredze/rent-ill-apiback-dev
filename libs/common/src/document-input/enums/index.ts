export enum DocmentInputEventType {
    CreateInputForPdf = 'CREATE_INPUT_FOR_PDF',
    GetDocumentInputs = 'GET_DOCUMENT_INPUTS',
    RemoveDocumentInput = 'REMOVE_DOCUMENT_INPUT',
    UpdateInputForPdf = 'UPDATE_INPUT_FOR_PDF',
    MergeAllContactsToInputs = 'MERGE_ALL_CONTACTS_TO_INPUTS',
    AddContactToAllInputs = 'ADD_CONTACT_TO_ALL_INPUTS',
    RemoveContactFromInput = 'REMOVE_CONTACT_FROM_INPUT',
}

export enum SignyInputTypes {
    Signature = 'SIGNATURE',
    Initials = 'INITIALS',
    Text = 'TEXT',
    Dropdown = 'DROPDOWN',
    CheckBox = 'CHECK_BOX',
    RadioButton = 'RADIO_BUTTON',
    DateAndTime = 'DATE_AND_TIME',
    Rating = 'RATING',
    Address = 'ADDRESS',
    Attachment = 'ATTACHMENT',
}

export enum SignyInputValidationTypes {
    Email = 'EMAIL',
    Phone = 'PHONE',
    NationalId = 'NATIONAL_ID',
}

export enum SignyInputFloatTypes {
    Left = 'LEFT',
    Center = 'CENTER',
    Right = 'RIGHT',
}

export enum SignyInputDateFormatTypes {
    Slash = 'SLASH',
    Dot = 'DOT',
}
