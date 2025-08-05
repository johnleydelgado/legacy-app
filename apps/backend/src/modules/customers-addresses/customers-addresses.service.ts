import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CustomersAddressesEntity } from './customers-addresses.entity';
import { CreateCustomersAddressDto, UpdateCustomersAddressDto } from './customers-addresses.dto';


@Injectable()
export class CustomersAddressesService {
  constructor(
    @Inject('CUSTOMERS_ADDRESSES_REPOSITORY')
    private customersAddressesRepository: Repository<CustomersAddressesEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.customersAddressesRepository, options);
  }

  findOne(pk_address_id: number): Promise<CustomersAddressesEntity | null> {
    return this.customersAddressesRepository.findOne({ where: { pk_address_id } });
  }

  async create(createCustomersAddressDto: CreateCustomersAddressDto): Promise<CustomersAddressesEntity> {
    const newCustomersAddresses = new CustomersAddressesEntity()

    newCustomersAddresses.fk_customer_id = createCustomersAddressDto.customerID;
    newCustomersAddresses.billing_address = createCustomersAddressDto.billingAddress;
    newCustomersAddresses.shipping_address = createCustomersAddressDto.shippingAddress;
    newCustomersAddresses.city = createCustomersAddressDto.city;
    newCustomersAddresses.state = createCustomersAddressDto.state;
    newCustomersAddresses.postal_code = createCustomersAddressDto.postalCode;
    newCustomersAddresses.country = createCustomersAddressDto.country;
    newCustomersAddresses.created_at = new Date();
    newCustomersAddresses.updated_at = new Date();

    return await this.customersAddressesRepository.save(newCustomersAddresses);
  }

  async remove(pk_address_id: number) {
    return await this.customersAddressesRepository.delete(pk_address_id);
  }

  async update(id: number, updateCustomersAddressDto: UpdateCustomersAddressDto) {
    const toUpdate = await this.customersAddressesRepository.findOne({ where: { pk_address_id: id } });

    const updated = Object.assign({
      pk_address_id: toUpdate?.pk_address_id,
      fk_customer_id: toUpdate?.fk_customer_id,
      billing_address: toUpdate?.billing_address,
      shipping_address: toUpdate?.shipping_address,
      city: toUpdate?.city,
      state: toUpdate?.state,
      postal_code: toUpdate?.postal_code,
      country: toUpdate?.country,
      created_at: toUpdate?.created_at,
      updated_at: toUpdate?.updated_at,
    }, {
      billing_address: updateCustomersAddressDto.billingAddress,
      shipping_address: updateCustomersAddressDto.shippingAddress,
      city: updateCustomersAddressDto.city,
      state: updateCustomersAddressDto.state,
      postal_code: updateCustomersAddressDto.postalCode,
      country: updateCustomersAddressDto.country,
      updated_at: new Date()
    });

    return await this.customersAddressesRepository.save(updated);
  }
}
