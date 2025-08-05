import { Module } from '@nestjs/common';
import { ProductPricesController } from './product-prices.controller';
import { ProductPricesService } from './product-prices.service';
import { DatabaseModule } from '../../database/database.module';
import { ProductPricesProvider } from './product-prices.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductPricesController],
  providers: [...ProductPricesProvider, ProductPricesService],
  exports: [ProductPricesService],
})
export class ProductPricesModule {}
