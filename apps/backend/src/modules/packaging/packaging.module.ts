import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PackagingController } from './packaging.controller';
import { PackagingService } from './packaging.service';
import { PackagingProvider } from './packaging.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [PackagingController],
  providers: [...PackagingProvider, PackagingService],
  exports: [PackagingService]
})

export class PackagingModule {}
