import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ActivityTypeProvider } from './activity-type.provider';
import { ActivityTypeService } from './activity-type.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [...ActivityTypeProvider, ActivityTypeService],
  exports: [ActivityTypeService],
})
export class ActivityTypeModule {}
