import { DataSource } from 'typeorm';
import { CustomerFilesEntity } from './customer-files.entity';

export const CustomerFilesProvider = [
  {
    provide: 'CUSTOMER_FILES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CustomerFilesEntity),
    inject: ['DATA_SOURCE'],
  },
];
