import { DataSource } from 'typeorm';
import { PurchaseOrdersItemsEntity } from './purchase-orders-items.entity';

export const PurchaseOrdersItemsProvider = [
  {
    provide: 'PURCHASE_ORDERS_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseOrdersItemsEntity),
    inject: ['DATA_SOURCE'],
  },
];
