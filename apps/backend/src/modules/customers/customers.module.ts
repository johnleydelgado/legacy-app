import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersEntity } from './customers.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { AddressesModule } from '../addresses/addresses.module';
import { ContactsModule } from '../contacts/contacts.module';
import { DatabaseModule } from '../../database/database.module';
import { CustomersProviders } from './customers.providers';
import { AddressesEntity } from '../addresses/addresses.entity';
import { ContactsEntity } from '../contacts/contacts.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { OrdersModule } from '../orders/orders.module';
import { OrdersService } from '../orders/orders.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      CustomersEntity,
      AddressesEntity,
      ContactsEntity,
    ]),
    AddressesModule,
    ContactsModule,
    OrganizationsModule,
    forwardRef(() => OrdersModule),
  ],
  providers: [...CustomersProviders, CustomersService],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
