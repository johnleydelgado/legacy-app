import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AddressesProvider } from './addresses.provider';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AddressesController],
  providers: [...AddressesProvider, AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
