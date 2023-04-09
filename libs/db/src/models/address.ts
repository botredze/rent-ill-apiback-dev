import { AddressExtraBaseInfo, CoordsInfo, StatusType } from '@signy/common';
import { AnyQueryBuilder, Model, RawBuilder } from 'objection';
import { dbNames } from '../db.names';

export class Address extends Model {
    id: number;
    country_name: string;
    city_name: string;
    street_name: string;
    area_name: string;
    apartment?: number;
    block_number?: number | null;
    entry?: string | null;
    zip_code: string;
    latitude?: number | null;
    longitude?: number | null;
    coords?: RawBuilder | string;
    status: StatusType;

    static get tableName() {
        return dbNames.addresses.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],

            properties: {
                id: { type: 'integer' },
                country_name: { type: 'string' },
                street_name: { type: 'string' },
                area_name: { type: 'string' },
                apartment: { type: 'integer' },
                block_number: { type: ['null', 'integer'] },
                entry: { type: ['null', 'string'] },
                zip_code: { type: 'string' },
                latitude: { type: ['null', 'number'], default: 0 },
                longitude: { type: ['null', 'number'], default: 0 },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = Address;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    toCoordsBaseInfo(): CoordsInfo | null {
        if (!this.latitude && !this.longitude) {
            return null;
        }
        return {
            latitude: this?.latitude || 0,
            longitude: this?.longitude || 0,
        };
    }

    toAddressBaseInfo(): AddressExtraBaseInfo {
        return {
            id: this.id,
            city: this.city_name,
            country: this.country_name,
            street: this.street_name,
            area: this.area_name,
            apartment: this?.apartment,
            building: this?.block_number || null,
            entry: this?.entry || null,
            zipCode: this.zip_code,
            coords: this.toCoordsBaseInfo(),
        };
    }
}
