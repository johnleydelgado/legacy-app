import { DataSource } from 'typeorm';
import { ShippingWeightPresetsEntity } from './shipping-weight-presets.entity';

export const ShippingWeightPresetsProvider = [
  {
    provide: 'SHIPPING_WEIGHT_PRESETS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ShippingWeightPresetsEntity),
    inject: ['DATA_SOURCE'],
  },
];
