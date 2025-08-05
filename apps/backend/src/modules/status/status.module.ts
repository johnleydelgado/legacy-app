import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { StatusController } from './status.controller';
import { StatusProvider } from './status.provider';
import { StatusService } from './status.service';

@Module({
  imports: [DatabaseModule],
  controllers: [StatusController],
  providers: [...StatusProvider, StatusService],
  exports: [StatusService]
})

export class StatusModule {}
