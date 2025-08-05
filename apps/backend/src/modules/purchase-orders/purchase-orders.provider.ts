import { DataSource } from 'typeorm';
import { PurchaseOrdersEntity } from './purchase-orders.entity';


export const PurchaseOrdersProvider = [
  {
    provide: 'PURCHASE_ORDERS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseOrdersEntity),
    inject: ['DATA_SOURCE'],
  },
];
