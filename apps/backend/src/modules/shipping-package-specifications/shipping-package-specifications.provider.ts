import { DataSource } from 'typeorm';
import { ShippingPackageSpecificationsEntity } from './shipping-package-specifications.entity';

export const ShippingPackageSpecificationsProvider = [
  {
    provide: 'SHIPPING_PACKAGE_SPECIFICATIONS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ShippingPackageSpecificationsEntity),
    inject: ['DATA_SOURCE'],
  },
];
