import { DataSource } from 'typeorm';
import { OrdersEntity } from './orders.entity';

export const OrdersProvider = [
  {
    provide: 'ORDERS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(OrdersEntity),
    inject: ['DATA_SOURCE'],
  }
]
