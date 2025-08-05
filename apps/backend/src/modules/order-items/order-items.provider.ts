import { DataSource } from 'typeorm';
import { OrderItemsEntity } from './order-items.entity';


export const OrderItemsProvider = [
  {
    provide: 'ORDER_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(OrderItemsEntity),
    inject: ['DATA_SOURCE'],
  },
];
