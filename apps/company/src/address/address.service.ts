import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AddressBaseInfo, EditAddressRequest } from '@signy/common';
import { Address } from '@signy/db';
import { ApiEC, ServiceRpcException } from '@signy/exceptions';
import { Transaction } from 'objection';

@Injectable()
export class AddressService {
    private logger: Logger;
    constructor(
        @Inject('ADDRESS_SERVICE') private natsClient: ClientProxy,
        @Inject(Address) private readonly addressModel: typeof Address
    ) {
        this.logger = new Logger(AddressService.name);
    }

    async createAddress(
        { apartment, city, area, street, zipCode, building, entry, country, coords }: AddressBaseInfo,
        trx?: Transaction
    ): Promise<Address> {
        return await this.addressModel.query(trx).insertAndFetch({
            city_name: city,
            street_name: street,
            zip_code: zipCode,
            country_name: country,
            area_name: area,
            apartment,
            block_number: building || null,
            entry: entry || null,
            latitude: coords?.latitude || null,
            longitude: coords?.longitude || null,
        });
    }

    async editAddress({
        addressId,
        apartment,
        city,
        area,
        street,
        zipCode,
        building,
        entry,
        country,
        coords,
    }: EditAddressRequest): Promise<Address> {
        if (!addressId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const address = await this.addressModel.query().modify('active').patchAndFetchById(addressId, {
            city_name: city,
            street_name: street,
            zip_code: zipCode,
            country_name: country,
            area_name: area,
            apartment,
            block_number: building,
            entry: entry,
            latitude: coords?.latitude,
            longitude: coords?.longitude,
        });

        return address;
    }
}
