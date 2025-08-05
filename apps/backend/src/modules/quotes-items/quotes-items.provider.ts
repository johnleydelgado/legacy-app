import { DataSource } from 'typeorm';
import { QuotesItemsEntity } from './quotes-items.entity';


export const QuotesItemsProvider = [
  {
    provide: 'QUOTES_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(QuotesItemsEntity),
    inject: ['DATA_SOURCE'],
  },
];
