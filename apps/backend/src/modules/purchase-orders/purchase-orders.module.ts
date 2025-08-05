import { Module } from '@nestjs/common';
import { PurchaseOrdersProvider } from './purchase-orders.provider';
import { PurchaseOrdersService } from './purchase-orders.service';
import { DatabaseModule } from 'src/database/database.module';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { SerialEncoderModule } from '../serial-encoder/serial-encoder.module';
import { VendorsModule } from '../vendors/vendors.module';
import { StatusModule } from '../status/status.module';
import { FactoriesModule } from '../factories/factories.module';
import { CustomersModule } from '../customers/customers.module';
import { PurchaseOrdersLeadNumbersModule } from '../purchase-orders-lead-numbers/purchase-orders-lead-numbers.module';
import { PurchaseOrdersShippingMethodsModule } from '../purchase-orders-shipping-methods/purchase-orders-shipping-methods.module';
import { VendorsTypeModule } from '../vendors-type/vendors-type.module';
import { VendorsServiceCategoryModule } from '../vendors-service-category/vendors-service-category.module';
import { LocationTypesModule } from '../location-types/location-types.module';
import { ContactsModule } from '../contacts/contacts.module';


@Module({
  imports: [
    DatabaseModule,
    SerialEncoderModule,
    ContactsModule,
    CustomersModule,
    VendorsModule,
    FactoriesModule,
    StatusModule,
    PurchaseOrdersLeadNumbersModule,
    PurchaseOrdersShippingMethodsModule,
    VendorsTypeModule,
    VendorsServiceCategoryModule,
    LocationTypesModule,
  ],
  controllers: [PurchaseOrdersController],
  providers: [...PurchaseOrdersProvider, PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})

export class PurchaseOrdersModule {}
