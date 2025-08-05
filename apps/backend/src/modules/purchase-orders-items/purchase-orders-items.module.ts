import { Module } from '@nestjs/common';
import { PurchaseOrdersItemsProvider } from './purchase-orders-items.provider';
import { DatabaseModule } from 'src/database/database.module';
import { PurchaseOrdersItemsService } from './purchase-orders-items.service';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { PurchaseOrdersItemsController } from './purchase-orders-items.controller';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [DatabaseModule, PurchaseOrdersModule, ProductsModule],
    controllers: [PurchaseOrdersItemsController],
    providers: [...PurchaseOrdersItemsProvider, PurchaseOrdersItemsService],
    exports: [PurchaseOrdersItemsService],
})

export class PurchaseOrdersItemsModule {}
