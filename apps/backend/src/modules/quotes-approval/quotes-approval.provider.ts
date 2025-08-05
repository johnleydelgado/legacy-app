import { DataSource } from 'typeorm';
import { QuotesApprovalEntity } from './quotes-approval.entity';

export const QuotesApprovalProvider = [
  {
    provide: 'QUOTES_APPROVAL_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(QuotesApprovalEntity),
    inject: ['DATA_SOURCE'],
  },
];
