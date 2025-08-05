import { DataSource } from 'typeorm';
import { ShippingDimensionPresetsEntity } from './shipping-dimension-presets.entity';

export const ShippingDimensionPresetsProvider = [
  {
    provide: 'SHIPPING_DIMENSION_PRESETS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ShippingDimensionPresetsEntity),
    inject: ['DATA_SOURCE'],
  },
];
