import { Module } from '@nestjs/common';
import { ProductionOrderItemsProvider } from './production-order-items.provider';
import { ProductionOrderItemsService } from './production-order-items.service';
import { DatabaseModule } from 'src/database/database.module';
import { ProductionOrderItemsController } from './production-order-items.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
  ],
  controllers: [ProductionOrderItemsController],
  providers: [...ProductionOrderItemsProvider, ProductionOrderItemsService],
  exports: [ProductionOrderItemsService],
})
export class ProductionOrderItemsModule {}