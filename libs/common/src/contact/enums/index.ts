export enum ContactEventType {
    ImportContactsFromGoogle = 'IMPORT_CONTACT_FROM_GOOGLE',
    GetUserContacts = 'GET_USER_CONTACTS',
    AddContactToFavourite = 'ADD_CONTACT_TO_FAVOURITE',
    RemoveContactFromFavourite = 'REMOVE_CONTACT_FROM_FAVOURITE',
    CreateNewContact = 'CREATE_NEW_CONTACT',
    ChangeStatusOfContact = 'CHANGE_STATUS_OF_CONTACT',
    CreateCustomGroup = 'CREATE_CUSTOM_GROUP',
    DeleteMemberFromGroup = 'DELETE_MEMBER_FROM_GROUP',
    AddContactToGroup = 'ADD_CONTACT_TO_GROUP',
    AddContactToDocumentGroup = 'ADD_CONTACT_TO_DOCUMENT_GROUP',
    DeleteContactFromDocumentGroup = 'DELETE_CONTACT_FROM_DOCUMENT_GROUP',
    DeleteContactGroup = 'DELETE_CONTACT_GROUP',
    UpdateContactGroup = 'UPDATE_CONTACT_GROUP',
    ImportContactsFromCsv = 'IMPORT_CONTACT_FROM_CSV',
    UpdateContact = 'UPDATE_CONTACT',
    GetGroupsWithContacts = ' GET_GROUPS_WITH_CONTACTS',
    AddGroupToFavourite = 'ADD_GROUP_TO_FAVOURITE',
    ChangeStatusOfContactsBulk = 'CHANGE_STATUS_OF_CONTACTS_BULK',
    InternalContactCreation = 'INTERNAL_CONTACT_CREATION',
}

export enum SignyContactImportTypes {
    Google = 'GOOGLE',
    Internal = 'INTERNAL',
    Csv = 'CSV',
}

export enum UserContactSearchTypes {
    Name = 'NAME',
    Email = 'EMAIL',
    Phone = 'PHONE',
    Groups = 'GROUPS',
}
