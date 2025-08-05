import { DataSource } from 'typeorm';
import { ShippingPackageSpecItemsEntity } from './shipping-package-spec-items.entity';

export const ShippingPackageSpecItemsProvider = [
  {
    provide: 'SHIPPING_PACKAGE_SPEC_ITEMS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ShippingPackageSpecItemsEntity),
    inject: ['DATA_SOURCE'],
  },
];
