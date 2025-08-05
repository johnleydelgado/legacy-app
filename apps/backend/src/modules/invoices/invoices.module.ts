import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { InvoicesController } from './invoices.controller';
import { InvoicesProvider } from './invoices.provider';
import { InvoicesService } from './invoices.service';
import { CustomersModule } from '../customers/customers.module';
import { ContactsModule } from '../contacts/contacts.module';
import { StatusModule } from '../status/status.module';
import { OrdersModule } from '../orders/orders.module';
import { SerialEncoderModule } from '../serial-encoder/serial-encoder.module';


@Module({
  imports: [
    DatabaseModule,
    CustomersModule,
    ContactsModule,
    StatusModule,
    OrdersModule,
    SerialEncoderModule,
  ],
  controllers: [InvoicesController],
  providers: [...InvoicesProvider, InvoicesService],
  exports: [InvoicesService],
})

export class InvoicesModule {}
