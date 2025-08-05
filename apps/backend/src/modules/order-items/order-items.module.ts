import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrderItemsProvider } from './order-items.provider';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { ProductsCategoryModule } from '../products-category/products-category.module';
import { AddressesModule } from '../addresses/addresses.module';
import { PackagingModule } from '../packaging/packaging.module';
import { TrimsModule } from '../trims/trims.module';
import { YarnsModule } from '../yarns/yarns.module';

@Module({
  imports: [
    DatabaseModule,
    OrdersModule,
    ProductsModule,
    ProductsCategoryModule,
    AddressesModule,
    PackagingModule,
    TrimsModule,
    YarnsModule,
  ],
  controllers: [OrderItemsController],
  providers: [...OrderItemsProvider, OrderItemsService],
  exports: [OrderItemsService],
})

export class OrderItemsModule {}
