import { DataSource } from 'typeorm';
import { ProductPricesEntity } from './product-prices.entity';

export const ProductPricesProvider = [
  {
    provide: 'PRODUCT_PRICES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductPricesEntity),
    inject: ['DATA_SOURCE'],
  },
];
