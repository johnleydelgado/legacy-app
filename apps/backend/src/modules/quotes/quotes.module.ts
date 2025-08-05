import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QuotesController } from './quotes.controller';
import { QuotesProvider } from './quotes.provider';
import { QuotesService } from './quotes.service';
import { CustomersModule } from '../customers/customers.module';
import { ContactsModule } from '../contacts/contacts.module';
import { AddressesModule } from '../addresses/addresses.module';
import { QuoteItemsModule } from '../quotes-items/quote-items.module';
import { StatusModule } from '../status/status.module';
import { SerialEncoderModule } from '../serial-encoder/serial-encoder.module';

@Module({
  imports: [
    DatabaseModule,
    CustomersModule,
    ContactsModule,
    AddressesModule,
    StatusModule,
    forwardRef(() => QuoteItemsModule),
    SerialEncoderModule,
  ],
  controllers: [QuotesController],
  providers: [...QuotesProvider, QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
