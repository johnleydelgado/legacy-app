import { DataSource } from 'typeorm';
import { VendorsServiceCategoryEntity } from './vendors-service-category.entity';


export const VendorsServiceCategoryProvider = [
  {
    provide: 'VENDORS_SERVICE_CATEGORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(VendorsServiceCategoryEntity),
    inject: ['DATA_SOURCE'],
  },
];
