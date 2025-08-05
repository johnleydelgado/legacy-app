import { DataSource } from 'typeorm';
import { InvoicesItemsEntity } from './invoices-items.entity';


export const InvoicesItemsProvider = [
  {
    provide: 'INVOICES_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(InvoicesItemsEntity),
    inject: ['DATA_SOURCE'],
  }
]
