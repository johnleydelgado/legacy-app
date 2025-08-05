import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmailNotificationsController } from './email-notifications.controller';
import { EmailNotificationsProvider } from './email-notifications.provider';
import { EmailNotificationsService } from './email-notifications.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmailNotificationsController],
  providers: [...EmailNotificationsProvider, EmailNotificationsService],
  exports: [EmailNotificationsService],
})
export class EmailNotificationsModule {}
