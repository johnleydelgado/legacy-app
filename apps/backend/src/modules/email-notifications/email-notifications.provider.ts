import { DataSource } from 'typeorm';
import { EmailNotificationsEntity } from './email-notifications.entity';

export const EmailNotificationsProvider = [
  {
    provide: 'EMAIL_NOTIFICATIONS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EmailNotificationsEntity),
    inject: ['DATA_SOURCE'],
  },
];
