import { DataSource } from 'typeorm';
import { TrimsEntity } from './trims.entity';


export const TrimsProvider = [
  {
    provide: 'TRIMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(TrimsEntity),
    inject: ['DATA_SOURCE'],
  },
];
