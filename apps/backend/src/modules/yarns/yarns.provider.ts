import { DataSource } from 'typeorm';
import { YarnEntity } from './yarns.entity';


export const YarnsProvider = [
  {
    provide: 'YARNS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(YarnEntity),
    inject: ['DATA_SOURCE'],
  },
];
