import { DataSource } from 'typeorm';
import { PackagingEntity } from './packaging.entity';


export const PackagingProvider = [
  {
    provide: 'PACKAGING_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PackagingEntity),
    inject: ['DATA_SOURCE'],
  },
];
