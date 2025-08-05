import { forwardRef, Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '../../database/database.module';
import { OrdersProvider } from './orders.provider';
import { CustomersModule } from '../customers/customers.module';
import { ContactsModule } from '../contacts/contacts.module';
import { StatusModule } from '../status/status.module';
import { AddressesModule } from '../addresses/addresses.module';
import { SerialEncoderModule } from '../serial-encoder/serial-encoder.module';

@Module({
  imports: [
    DatabaseModule,
    ContactsModule,
    StatusModule,
    AddressesModule,
    forwardRef(() => CustomersModule),
    SerialEncoderModule,
  ],
  controllers: [OrdersController],
  providers: [...OrdersProvider, OrdersService],
  exports: [OrdersService],
})

export class OrdersModule {}
