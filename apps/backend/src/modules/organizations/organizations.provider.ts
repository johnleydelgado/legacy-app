import { DataSource } from 'typeorm';
import { OrganizationsEntity } from './organizations.entity';

export const OrganizationsProvider = [
  {
    provide: 'ORGANIZATION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(OrganizationsEntity),
    inject: ['DATA_SOURCE'],
  }
]
