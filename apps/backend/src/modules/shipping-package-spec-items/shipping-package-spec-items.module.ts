import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ShippingPackageSpecItemsController } from './shipping-package-spec-items.controller';
import { ShippingPackageSpecItemsProvider } from './shipping-package-spec-items.provider';
import { ShippingPackageSpecItemsService } from './shipping-package-spec-items.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ShippingPackageSpecItemsController],
  providers: [
    ...ShippingPackageSpecItemsProvider,
    ShippingPackageSpecItemsService,
  ],
  exports: [ShippingPackageSpecItemsService],
})
export class ShippingPackageSpecItemsModule {}
