import { DataSource } from 'typeorm';
import { StatusEntity } from './status.entity';


export const StatusProvider = [
  {
    provide: 'STATUS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StatusEntity),
    inject: ['DATA_SOURCE'],
  },
];
