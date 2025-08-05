import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { PurchaseOrdersShippingMethodsProvider } from './purchase-orders-shipping-methods.provider';
import { PurchaseOrdersShippingMethodsController } from './purchase-orders-shipping-methods.controller';
import { PurchaseOrdersShippingMethodsService } from './purchase-orders-shipping-methods.services';


@Module({
    imports: [DatabaseModule],
    providers: [...PurchaseOrdersShippingMethodsProvider, PurchaseOrdersShippingMethodsService],
    controllers: [PurchaseOrdersShippingMethodsController],
    exports: [PurchaseOrdersShippingMethodsService],
})
export class PurchaseOrdersShippingMethodsModule {}
