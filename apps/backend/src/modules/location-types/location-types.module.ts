import { Module } from '@nestjs/common';
import { LocationTypesController } from './location-types.controller';
import { LocationTypesService } from './location-types.service';
import { LocationTypesProvider } from './location-types.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LocationTypesController],
  providers: [LocationTypesService, ...LocationTypesProvider],
  exports: [LocationTypesService],
})
export class LocationTypesModule {}
