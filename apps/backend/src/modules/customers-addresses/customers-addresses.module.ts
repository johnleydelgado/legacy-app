import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CustomersAddressesProvider } from './customers-addresses.provider';
import { CustomersAddressesService } from './customers-addresses.service';
import { CustomersAddressesController } from './customers-addresses.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomersAddressesController],
  providers: [...CustomersAddressesProvider, CustomersAddressesService],
})

export class CustomersAddressesModule {}
