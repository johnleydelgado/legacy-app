import { DataSource } from 'typeorm';
import { InvoicesEntity } from './invoices.entity';


export const InvoicesProvider = [
  {
    provide: 'INVOICES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(InvoicesEntity),
    inject: ['DATA_SOURCE'],
  }
]
