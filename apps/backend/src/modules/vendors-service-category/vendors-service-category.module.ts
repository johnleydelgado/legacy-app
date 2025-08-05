import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { VendorsServiceCategoryProvider } from './vendors-service-category.provider';
import { VendorsServiceCategoryService } from './vendors-service-category.services';
import { VendorsServiceCategoryController } from './vendors-service-category.controller';


@Module({
    imports: [
        DatabaseModule,
    ],
    controllers: [VendorsServiceCategoryController],
    providers: [VendorsServiceCategoryService, ...VendorsServiceCategoryProvider],
    exports: [VendorsServiceCategoryService],
})
export class VendorsServiceCategoryModule {}
