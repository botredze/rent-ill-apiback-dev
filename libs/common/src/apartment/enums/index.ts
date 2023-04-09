export enum ApartmentEventsTypes {
    CreateApartment = 'CREATE_APARTMENT',
    GetApartmentById = 'GET_APARTMENT_BY_ID',
    EditApartment = 'EDIT_APARTMENT',
}

export enum ApartmentTypes {
    Living = 'LIVING',
    Office = 'OFFICE',
    Commerce = 'COMMERCE',
    Store = 'STORE',
    Hangar = 'HANGAR',
    Storage = 'STORAGE',
    Parking = 'PARKING',
    ParkingStation = 'PARKING_STATION',
    Mall = 'MALL',
    Other = 'OTHER',
}

export enum RentAsTypes {
    Apartment = 'APARTMENT',
    Unit = 'UNIT',
    SubUnit = 'SUB_UNIT',
    Room = 'ROOM',
    Other = 'OTHER',
}

export enum TenancyStatusTypes {
    Rented = 'RENTED',
    SearchingForTenants = 'SEARCHING_FOR_TENANTS',
    Free = 'FREE',
    Other = 'OTHER',
}

export enum ManagementStatusTypes {
    AccompaniedFirstYear = 'ACCOMPANIED_FIRST_YEAR',
    AccompaniedSecondYear = 'ACCOMPANIED_SECOND_YEAR',
    AccompaniedThirdYear = 'ACCOMPANIED_THIRD_YEAR',
    CheckingYear = 'CHECKING_YEAR',
    Other = 'OTHER',
}

export enum ParkingTypes {
    Undergroung = 'UNDERGROUND',
    OnGround = 'ONGROUND',
    Twised = 'TWISED',
    InShadow = 'IN_SHADOW',
    Other = 'OTHER',
}
