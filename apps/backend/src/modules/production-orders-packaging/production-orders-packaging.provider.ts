import { DataSource } from 'typeorm';
import { ProductionOrdersPackagingEntity } from './production-orders-packaging.entity';

export const ProductionOrdersPackagingProvider = [
  {
    provide: 'PRODUCTION_ORDERS_PACKAGING_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductionOrdersPackagingEntity),
    inject: ['DATA_SOURCE'],
  },
];