import { DataSource } from 'typeorm';
import { ProductionOrdersKnitColorsEntity } from './production-orders-knit-colors.entity';

export const ProductionOrdersKnitColorsProvider = [
  {
    provide: 'PRODUCTION_ORDERS_KNIT_COLORS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductionOrdersKnitColorsEntity),
    inject: ['DATA_SOURCE'],
  },
];