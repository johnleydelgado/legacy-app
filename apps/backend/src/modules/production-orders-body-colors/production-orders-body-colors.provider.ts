import { DataSource } from 'typeorm';
import { ProductionOrdersBodyColorsEntity } from './production-orders-body-colors.entity';

export const ProductionOrdersBodyColorsProvider = [
  {
    provide: 'PRODUCTION_ORDERS_BODY_COLORS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductionOrdersBodyColorsEntity),
    inject: ['DATA_SOURCE'],
  },
];