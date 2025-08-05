import { DataSource } from 'typeorm';
import { ProductionOrdersEntity } from './production-orders.entity';

export const ProductionOrdersProvider = [
  {
    provide: 'PRODUCTION_ORDERS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductionOrdersEntity),
    inject: ['DATA_SOURCE'],
  },
];