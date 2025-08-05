import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DatabaseModule } from '../../database/database.module';
import { ProductsProvider } from './products.provider';
import { ProductsEntity } from './products.entity';
import { VendorsEntity } from '../vendors/vendors.entity';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([ProductsEntity, VendorsEntity]),
    VendorsModule,
  ],
  controllers: [ProductsController],
  providers: [...ProductsProvider, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
