import { Module } from '@nestjs/common';
import { ProductionOrdersKnitColorsProvider } from './production-orders-knit-colors.provider';
import { ProductionOrdersKnitColorsService } from './production-orders-knit-colors.service';
import { DatabaseModule } from 'src/database/database.module';
import { ProductionOrdersKnitColorsController } from './production-orders-knit-colors.controller';
import { YarnsModule } from '../yarns/yarns.module';

@Module({
  imports: [
    DatabaseModule,
    YarnsModule,
  ],
  controllers: [ProductionOrdersKnitColorsController],
  providers: [...ProductionOrdersKnitColorsProvider, ProductionOrdersKnitColorsService],
  exports: [ProductionOrdersKnitColorsService],
})
export class ProductionOrdersKnitColorsModule {}