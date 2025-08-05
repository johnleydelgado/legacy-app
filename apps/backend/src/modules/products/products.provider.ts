import { DataSource } from 'typeorm';
import { ProductsEntity } from './products.entity';


export const ProductsProvider = [
  {
    provide: 'PRODUCTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductsEntity),
    inject: ['DATA_SOURCE'],
  },
];
