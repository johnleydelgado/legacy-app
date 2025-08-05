import { DataSource } from 'typeorm';
import { ActivityHistoryEntity } from './activity-history.entity';

export const ActivityHistoryProvider = [
  {
    provide: 'ACTIVITY_HISTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ActivityHistoryEntity),
    inject: ['DATA_SOURCE'],
  },
];
