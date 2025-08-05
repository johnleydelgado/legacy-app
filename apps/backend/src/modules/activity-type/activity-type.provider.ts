import { DataSource } from 'typeorm';
import { ActivityTypeEntity } from './activity-type.entity';

export const ActivityTypeProvider = [
  {
    provide: 'ACTIVITY_TYPE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ActivityTypeEntity),
    inject: ['DATA_SOURCE'],
  },
];
