import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ShippingOrdersController } from './shipping-orders.controller';
import { ShippingOrdersProvider } from './shipping-orders.provider';
import { ShippingOrdersService } from './shipping-orders.service';
import { CustomersModule } from '../customers/customers.module';
import { ContactsModule } from '../contacts/contacts.module';
import { AddressesModule } from '../addresses/addresses.module';
import { ShippingOrderItemsModule } from '../shipping-order-items/shipping-order-items.module';
import { StatusModule } from '../status/status.module';
import { SerialEncoderModule } from '../serial-encoder/serial-encoder.module';

@Module({
  imports: [
    DatabaseModule,
    CustomersModule,
    ContactsModule,
    AddressesModule,
    StatusModule,
    forwardRef(() => ShippingOrderItemsModule),
    SerialEncoderModule,
  ],
  controllers: [ShippingOrdersController],
  providers: [...ShippingOrdersProvider, ShippingOrdersService],
  exports: [ShippingOrdersService],
})
export class ShippingOrdersModule {}
