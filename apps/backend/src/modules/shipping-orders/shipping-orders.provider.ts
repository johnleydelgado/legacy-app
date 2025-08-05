import { DataSource } from 'typeorm';
import { ShippingOrdersEntity } from './shipping-orders.entity';

export const ShippingOrdersProvider = [
  {
    provide: 'SHIPPING_ORDERS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ShippingOrdersEntity),
    inject: ['DATA_SOURCE'],
  },
];
