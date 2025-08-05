import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AddressesEntity } from './addresses.entity';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CreateAddressesDto, UpdateAddressesDto } from './addresses.dto';

@Injectable()
export class AddressesService {
  constructor(
    @Inject('ADDRESSES_REPOSITORY')
    private addressesRepository: Repository<AddressesEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.addressesRepository, options);
  }

  findOne(pk_address_id: number): Promise<AddressesEntity | null> {
    return this.addressesRepository.findOne({ where: { pk_address_id } });
  }

  async findAllByCustomerID(
    options: IPaginationOptions | null,
    customerID: number,
    status: string = "",
  ) {
    let query: any = {
      where: {
        fk_id: customerID,
        table: 'Customers',
      },
    };

    if (["BILLING", "SHIPPING"].includes(status)) {
      query = {
        where: {
          fk_id: customerID,
          address_type: status,
          table: 'Customers',
        },
      };
    }

    if (options && options.page && options.limit) {
      query.take = Number(options.limit);
      query.skip = (Number(options.page) - 1) * Number(options.limit);
    }

    const [addresses, total] =
      await this.addressesRepository.findAndCount(query);
    return { items: addresses, totalItems: total };
  }

  async create(
    createAddressesDto: CreateAddressesDto,
  ): Promise<AddressesEntity> {
    const newAddress = new AddressesEntity();
    newAddress.fk_id = createAddressesDto.fk_id;
    newAddress.address1 = createAddressesDto.address1;
    newAddress.address2 = createAddressesDto.address2 ?? '';
    newAddress.city = createAddressesDto.city;
    newAddress.state = createAddressesDto.state;
    newAddress.zip = createAddressesDto.zip;
    newAddress.country = createAddressesDto.country;
    newAddress.address_type = createAddressesDto.address_type;
    newAddress.table = createAddressesDto.table;
    return await this.addressesRepository.save(newAddress);
  }

  async remove(pk_address_id: number) {
    return await this.addressesRepository.delete(pk_address_id);
  }

  async update(id: number, updateAddressesDto: UpdateAddressesDto) {
    const toUpdate = await this.addressesRepository.findOne({
      where: { pk_address_id: id },
    });
    const updated = Object.assign(
      {
        pk_address_id: toUpdate?.pk_address_id,
        fk_id: toUpdate?.fk_id,
        address1: toUpdate?.address1,
        address2: toUpdate?.address2,
        city: toUpdate?.city,
        state: toUpdate?.state,
        zip: toUpdate?.zip,
        country: toUpdate?.country,
        address_type: toUpdate?.address_type,
        table: toUpdate?.table,
      },
      updateAddressesDto,
    );
    return await this.addressesRepository.save(updated);
  }

  async findByDetails(fk_id: number, table: string, address_type: string): Promise<AddressesEntity | null> {
    return this.addressesRepository.findOne({
      where: {
        fk_id,
        table,
        address_type,
      },
    });
  }
}
