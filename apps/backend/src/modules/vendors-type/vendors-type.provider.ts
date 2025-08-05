import { DataSource } from 'typeorm';
import { VendorsTypeEntity } from './vendors-type.entity';


export const VendorsTypeProvider = [
  {
    provide: 'VENDORS_TYPE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(VendorsTypeEntity),
    inject: ['DATA_SOURCE'],
  },
];
