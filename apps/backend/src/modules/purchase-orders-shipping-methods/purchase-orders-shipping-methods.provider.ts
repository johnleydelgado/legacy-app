import { DataSource } from 'typeorm';
import { PurchaseOrdersShippingMethodsEntity } from './purchase-orders-shipping-methods.entity';


export const PurchaseOrdersShippingMethodsProvider = [
  {
    provide: 'PURCHASE_ORDERS_SHIPPING_METHODS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseOrdersShippingMethodsEntity),
    inject: ['DATA_SOURCE'],
  },
];
