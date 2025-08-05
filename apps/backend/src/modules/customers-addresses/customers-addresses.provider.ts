import { DataSource } from 'typeorm';
import { CustomersAddressesEntity } from './customers-addresses.entity';


export const CustomersAddressesProvider = [
  {
    provide: 'CUSTOMERS_ADDRESSES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CustomersAddressesEntity),
    inject: ['DATA_SOURCE'],
  },
];
