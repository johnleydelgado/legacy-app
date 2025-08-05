import { Module } from '@nestjs/common';
import { ProductionOrdersProvider } from './production-orders.provider';
import { ProductionOrdersService } from './production-orders.service';
import { DatabaseModule } from 'src/database/database.module';
import { ProductionOrdersController } from './production-orders.controller';
import { CustomersModule } from '../customers/customers.module';
import { FactoriesModule } from '../factories/factories.module';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [
    DatabaseModule,
    CustomersModule,
    FactoriesModule,
    ContactsModule,
  ],
  controllers: [ProductionOrdersController],
  providers: [...ProductionOrdersProvider, ProductionOrdersService],
  exports: [ProductionOrdersService],
})
export class ProductionOrdersModule {}