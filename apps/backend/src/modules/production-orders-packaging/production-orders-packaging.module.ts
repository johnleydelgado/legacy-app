import { Module } from '@nestjs/common';
import { ProductionOrdersPackagingProvider } from './production-orders-packaging.provider';
import { ProductionOrdersPackagingService } from './production-orders-packaging.service';
import { ProductionOrdersPackagingController } from './production-orders-packaging.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [ProductionOrdersPackagingController],
  providers: [...ProductionOrdersPackagingProvider, ProductionOrdersPackagingService],
  exports: [ProductionOrdersPackagingService],
})
export class ProductionOrdersPackagingModule {}