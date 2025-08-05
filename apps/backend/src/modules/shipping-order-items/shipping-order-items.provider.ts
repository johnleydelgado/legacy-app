import { DataSource } from 'typeorm';
import { ShippingOrderItemsEntity } from './shipping-order-items.entity';

export const ShippingOrderItemsProvider = [
  {
    provide: 'SHIPPING_ORDER_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ShippingOrderItemsEntity),
    inject: ['DATA_SOURCE'],
  },
];
