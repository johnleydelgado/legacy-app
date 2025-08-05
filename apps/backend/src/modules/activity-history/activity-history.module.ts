import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ActivityHistoryController } from './activity-history.controller';
import { ActivityHistoryProvider } from './activity-history.provider';
import { ActivityHistoryService } from './activity-history.service';
import { CustomersModule } from '../customers/customers.module';
import { StatusModule } from '../status/status.module';
import { ActivityTypeModule } from '../activity-type/activity-type.module';

@Module({
  imports: [
    DatabaseModule,
    CustomersModule,
    StatusModule,
    ActivityTypeModule,
  ],
  controllers: [ActivityHistoryController],
  providers: [...ActivityHistoryProvider, ActivityHistoryService],
  exports: [ActivityHistoryService]
})
export class ActivityHistoryModule {}
