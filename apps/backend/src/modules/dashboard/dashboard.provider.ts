import { DataSource } from 'typeorm';
import { CustomersEntity } from '../customers/customers.entity';
import { OrdersEntity } from '../orders/orders.entity';

export const dashboardProviders = [
  {
    provide: 'CUSTOMERS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CustomersEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ORDERS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OrdersEntity),
    inject: ['DATA_SOURCE'],
  },
]; 
