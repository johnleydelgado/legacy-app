import { DataSource } from 'typeorm';
import { QuotesEntity } from './quotes.entity';


export const QuotesProvider = [
  {
    provide: 'QUOTES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(QuotesEntity),
    inject: ['DATA_SOURCE'],
  },
];
