import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ShippingPackageSpecificationsController } from './shipping-package-specifications.controller';
import { ShippingPackageSpecificationsProvider } from './shipping-package-specifications.provider';
import { ShippingPackageSpecificationsService } from './shipping-package-specifications.service';
import { ShippingOrdersModule } from '../shipping-orders/shipping-orders.module';
import { ShippingOrderItemsModule } from '../shipping-order-items/shipping-order-items.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ShippingOrdersModule),
    forwardRef(() => ShippingOrderItemsModule),
  ],
  controllers: [ShippingPackageSpecificationsController],
  providers: [
    ...ShippingPackageSpecificationsProvider,
    ShippingPackageSpecificationsService,
  ],
  exports: [ShippingPackageSpecificationsService],
})
export class ShippingPackageSpecificationsModule {}
