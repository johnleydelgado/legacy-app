import { DataSource } from 'typeorm';
import { LocationTypesEntity } from './location-types.entity';

export const LocationTypesProvider = [
  {
    provide: 'LOCATION_TYPES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(LocationTypesEntity),
    inject: ['DATA_SOURCE'],
  },
];
