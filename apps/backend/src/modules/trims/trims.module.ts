import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TrimsController } from './trims.controller';
import { TrimsProvider } from './trims.provider';
import { TrimsService } from './trims.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TrimsController],
  providers: [...TrimsProvider, TrimsService],
  exports: [TrimsService]
})

export class TrimsModule {}
