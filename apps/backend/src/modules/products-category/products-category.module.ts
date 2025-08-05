import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ProductsCategoryProvider } from './products-category.provider';
import { ProductsCategoryService } from './products-category.service';
import { ProductsCategoryController } from './products-category.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsCategoryController],
  providers: [...ProductsCategoryProvider, ProductsCategoryService],
  exports: [ProductsCategoryService]
})

export class ProductsCategoryModule {}
