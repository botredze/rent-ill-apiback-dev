import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AddressBaseInfo, AddressEventsTypes, EditAddressRequest } from '@signy/common';
import { Address } from '@signy/db';
import { AddressService } from './address.service';
@Controller()
export class AddressController {
    constructor(private readonly addressService: AddressService) {}

    @MessagePattern(AddressEventsTypes.CreateAddress)
    async createAddress(dto: AddressBaseInfo): Promise<Address> {
        return await this.addressService.createAddress(dto);
    }

    @MessagePattern(AddressEventsTypes.EditAddress)
    async editAddress(dto: EditAddressRequest): Promise<Address> {
        return await this.addressService.editAddress(dto);
    }
}
