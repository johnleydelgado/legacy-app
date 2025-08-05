import { DataSource } from 'typeorm';
import { ProductsCategoryEntity } from './products-category.entity';


export const ProductsCategoryProvider = [
  {
    provide: 'PRODUCTS_CATEGORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductsCategoryEntity),
    inject: ['DATA_SOURCE'],
  },
];
