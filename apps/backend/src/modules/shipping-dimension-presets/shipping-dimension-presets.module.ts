import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ShippingDimensionPresetsController } from './shipping-dimension-presets.controller';
import { ShippingDimensionPresetsProvider } from './shipping-dimension-presets.provider';
import { ShippingDimensionPresetsService } from './shipping-dimension-presets.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ShippingDimensionPresetsController],
  providers: [
    ...ShippingDimensionPresetsProvider,
    ShippingDimensionPresetsService,
  ],
  exports: [ShippingDimensionPresetsService],
})
export class ShippingDimensionPresetsModule {}
