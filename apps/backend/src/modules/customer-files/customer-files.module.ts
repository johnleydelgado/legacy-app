import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerFilesController } from './customer-files.controller';
import { CustomerFilesService } from './customer-files.service';
import { DatabaseModule } from '../../database/database.module';
import { CustomerFilesProvider } from './customer-files.provider';
import { CustomerFilesEntity } from './customer-files.entity';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([CustomerFilesEntity])],
  controllers: [CustomerFilesController],
  providers: [...CustomerFilesProvider, CustomerFilesService],
  exports: [CustomerFilesService],
})
export class CustomerFilesModule {}
