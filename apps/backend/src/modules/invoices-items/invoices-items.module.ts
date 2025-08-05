import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { InvoicesItemsProvider } from './invoices-items.provider';
import { InvoicesItemsService } from './invoices-items.service';
import { InvoicesItemsController } from './invoices-items.controller';
import { ProductsModule } from '../products/products.module';
import { AddressesModule } from '../addresses/addresses.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    AddressesModule,
    InvoicesModule,
  ],
  controllers: [InvoicesItemsController],
  providers: [...InvoicesItemsProvider, InvoicesItemsService],
  exports: [InvoicesItemsService],
})

export class InvoicesItemsModule {}
