import { DataSource } from 'typeorm';
import { AddressesEntity } from './addresses.entity';

export const AddressesProvider = [
  {
    provide: 'ADDRESSES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AddressesEntity),
    inject: ['DATA_SOURCE'],
  },
];
