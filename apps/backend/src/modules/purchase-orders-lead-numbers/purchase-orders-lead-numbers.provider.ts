import { DataSource } from 'typeorm';
import { PurchaseOrdersLeadNumbersEntity } from './purchase-orders-lead-numbers.entity';


export const PurchaseOrdersLeadNumbersProvider = [
  {
    provide: 'PURCHASE_ORDERS_LEAD_NUMBERS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseOrdersLeadNumbersEntity),
    inject: ['DATA_SOURCE'],
  },
];
