import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { VendorsEntity } from './vendors.entity';
import { ProductsEntity } from '../products/products.entity';
import { ProductsCategoryEntity } from '../products-category/products-category.entity';
import { OrderItemsEntity } from '../order-items/order-items.entity';
import { VendorsTypeEntity } from '../vendors-type/vendors-type.entity';
import { VendorsServiceCategoryEntity } from '../vendors-service-category/vendors-service-category.entity';
import { ContactsModule } from '../contacts/contacts.module';
import { DatabaseModule } from 'src/database/database.module';
import { VendorsServiceCategoryModule } from '../vendors-service-category/vendors-service-category.module';
import { VendorsTypeModule } from '../vendors-type/vendors-type.module';
import { LocationTypesModule } from '../location-types/location-types.module';
import { LocationTypesEntity } from '../location-types/location-types.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorsEntity, 
      ProductsEntity, 
      ProductsCategoryEntity,
      OrderItemsEntity, 
      VendorsTypeEntity, 
      VendorsServiceCategoryEntity,
      LocationTypesEntity,
    ]),
    DatabaseModule,
    ContactsModule,
    VendorsTypeModule,
    VendorsServiceCategoryModule, 
    LocationTypesModule,
  ],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
