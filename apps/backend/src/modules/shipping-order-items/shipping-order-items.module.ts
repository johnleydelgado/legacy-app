import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ShippingOrderItemsController } from './shipping-order-items.controller';
import { ShippingOrderItemsProvider } from './shipping-order-items.provider';
import { ShippingOrderItemsService } from './shipping-order-items.service';
import { ShippingOrdersModule } from '../shipping-orders/shipping-orders.module';
import { ProductsModule } from '../products/products.module';
import { AddressesModule } from '../addresses/addresses.module';
import { TrimsModule } from '../trims/trims.module';
import { PackagingModule } from '../packaging/packaging.module';
import { YarnsModule } from '../yarns/yarns.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ShippingOrdersModule),
    ProductsModule,
    AddressesModule,
    TrimsModule,
    PackagingModule,
    YarnsModule,
  ],
  controllers: [ShippingOrderItemsController],
  providers: [...ShippingOrderItemsProvider, ShippingOrderItemsService],
  exports: [ShippingOrderItemsService],
})
export class ShippingOrderItemsModule {}
