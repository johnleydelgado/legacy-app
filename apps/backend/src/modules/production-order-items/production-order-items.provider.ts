import { DataSource } from 'typeorm';
import { ProductionOrderItemsEntity } from './production-order-items.entity';

export const ProductionOrderItemsProvider = [
  {
    provide: 'PRODUCTION_ORDER_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductionOrderItemsEntity),
    inject: ['DATA_SOURCE'],
  },
];