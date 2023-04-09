export enum ProfileEventsType {
    CheckUserNameExists = 'CHECK_USER_NAME_EXISTS',
    GenerateUserName = 'GENERATE_USER_NAME',
    SetUserPersonalInformation = 'SET_USER_PERSONAL_INFORMATION',
    SetUserAvatar = 'SET_USER_AVATAR',
    SetUserName = 'SET_USER_NAME',
    GetUserProfile = 'GET_USER_PROFILE',
    GetExtendedUserProfile = 'GET_EXTENDED_USER_PROFILE',
    GetPersonProfile = 'GET_PERSON_PROFILE',
    EditPhoneNumber = 'EDIT_PHONE_NUMBER',
    EditLocation = 'EDIT_LOCATION',
    GetUserSettings = 'GET_USER_SETTINGS',
    GetUserProfileList = 'GET_USER_PROFILE_LIST',
    SearchUsers = 'SEARCH_USERS',
    SetDriveToken = 'SET_DRIVE_TOKEN',
    SetUserLang = 'SET_USER_LANG',
}

export enum UserProfileSearchTypes {
    Id = 'ID',
    Name = 'NAME',
    Address = 'ADDRESS',
}
