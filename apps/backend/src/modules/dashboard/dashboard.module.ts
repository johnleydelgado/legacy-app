import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { dashboardProviders } from './dashboard.provider';
import { DatabaseModule } from '../../database/database.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [DatabaseModule, CustomersModule, OrdersModule],
  controllers: [DashboardController],
  providers: [DashboardService, ...dashboardProviders],
  exports: [DashboardService],
})
export class DashboardModule {}
