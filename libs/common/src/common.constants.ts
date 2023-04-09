import { DistanceUnitType } from './enums';

export const commonConstants = {
    maxChannelDescriptionLength: 140,
    maxStringInputLength: 255,
    maxDescriptionLength: 1000,
    maxIdLength: 10000,
    minPasswordLength: 8,
    maxPasswordLength: 255,
    maxNameLength: 255,
    maxEmailLength: 255,
    maxTokenLength: 255,
    maxSupportMessageLength: 470,
    maxSearchItemsPerPage: 40,
    maxEmojiInNewsFeed: 2,
    maxPhoneLength: 16,
    maxCountryNameLength: 56,
    maxTimeZoneLength: 28,
    maxSearchLength: 255,
    defaultUserName: 'Anonymous',
    userNamePrefix: '@',
    defaultSignySmsOriginator: 'Signy',
    defaultSignySmsAdditionalInfo: 'Signy message',
    defaultDriveOriginalFilePath: 'signy/original-files',
    defaultDriveSignedFilePath: 'signy/signed-files',
};

export const geoConstants = {
    polygonPoints: 6,
    defaultRadius: 20,
    defaultSRID: 4326,
    googleSRID: 3857,
};

export const distanceConstants = {
    [DistanceUnitType.Kilometers]: 1000,
    [DistanceUnitType.Miles]: 1609.34,
};
