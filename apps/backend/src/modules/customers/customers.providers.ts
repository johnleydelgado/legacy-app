import { DataSource } from 'typeorm';
import { CustomersEntity } from './customers.entity';

export const CustomersProviders = [
  {
    provide: 'CUSTOMERS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CustomersEntity),
    inject: ['DATA_SOURCE'],
  }
]
