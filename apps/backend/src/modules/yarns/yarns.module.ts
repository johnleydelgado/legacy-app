import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { YarnsController } from './yarns.controller';
import { YarnsProvider } from './yarns.provider';
import { YarnsService } from './yarns.service';

@Module({
  imports: [DatabaseModule],
  controllers: [YarnsController],
  providers: [...YarnsProvider, YarnsService],
  exports: [YarnsService]
})

export class YarnsModule {}
