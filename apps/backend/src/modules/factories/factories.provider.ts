import { DataSource } from 'typeorm';
import { FactoriesEntity } from './factories.entity';


export const FactoriesProvider = [
  {
    provide: 'FACTORIES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(FactoriesEntity),
    inject: ['DATA_SOURCE'],
  },
];
