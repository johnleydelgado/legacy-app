import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QuotesItemsController } from './quotes-items.controller';
import { QuotesItemsProvider } from './quotes-items.provider';
import { QuotesItemsService } from './quotes-items.service';
import { ProductsModule } from '../products/products.module';
import { AddressesModule } from '../addresses/addresses.module';
import { TrimsModule } from '../trims/trims.module';
import { YarnsModule } from '../yarns/yarns.module';
import { PackagingModule } from '../packaging/packaging.module';
import { QuotesModule } from '../quotes/quotes.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => QuotesModule),
    ProductsModule,
    AddressesModule,
    TrimsModule,
    YarnsModule,
    PackagingModule,
  ],
  controllers: [QuotesItemsController],
  providers: [...QuotesItemsProvider, QuotesItemsService],
  exports: [QuotesItemsService],
})
export class QuoteItemsModule {}
