import { Module } from '@nestjs/common';
import { ProductionOrdersBodyColorsProvider } from './production-orders-body-colors.provider';
import { ProductionOrdersBodyColorsService } from './production-orders-body-colors.service';
import { ProductionOrdersBodyColorsController } from './production-orders-body-colors.controller';
import { DatabaseModule } from 'src/database/database.module';
import { YarnsModule } from '../yarns/yarns.module';

@Module({
  imports: [
    DatabaseModule,
    YarnsModule,
  ],
  controllers: [ProductionOrdersBodyColorsController],
  providers: [...ProductionOrdersBodyColorsProvider, ProductionOrdersBodyColorsService],
  exports: [ProductionOrdersBodyColorsService],
})
export class ProductionOrdersBodyColorsModule {}