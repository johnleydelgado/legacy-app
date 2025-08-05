import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ShippingWeightPresetsController } from './shipping-weight-presets.controller';
import { ShippingWeightPresetsProvider } from './shipping-weight-presets.provider';
import { ShippingWeightPresetsService } from './shipping-weight-presets.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ShippingWeightPresetsController],
  providers: [...ShippingWeightPresetsProvider, ShippingWeightPresetsService],
  exports: [ShippingWeightPresetsService],
})
export class ShippingWeightPresetsModule {}
