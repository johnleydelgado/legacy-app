import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { PurchaseOrdersLeadNumbersProvider } from './purchase-orders-lead-numbers.provider';
import { PurchaseOrdersLeadNumbersService } from './purchase-orders-lead-numbers.services';
import { PurchaseOrdersLeadNumbersController } from './purchase-orders-lead-numbers.controller';


@Module({
    imports: [DatabaseModule],
    providers: [...PurchaseOrdersLeadNumbersProvider, PurchaseOrdersLeadNumbersService],
    controllers: [PurchaseOrdersLeadNumbersController],
    exports: [PurchaseOrdersLeadNumbersService],
})
export class PurchaseOrdersLeadNumbersModule {}
