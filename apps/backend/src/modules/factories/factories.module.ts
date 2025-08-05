import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { FactoriesProvider } from './factories.provider';
import { FactoriesService } from './factories.service';
import { FactoriesController } from './factories.controller';
import { VendorsTypeModule } from '../vendors-type/vendors-type.module';
import { VendorsServiceCategoryModule } from '../vendors-service-category/vendors-service-category.module';
import { LocationTypesModule } from '../location-types/location-types.module';
import { ContactsModule } from '../contacts/contacts.module';
import { AddressesModule } from '../addresses/addresses.module';


@Module({
    imports: [
        DatabaseModule,
        VendorsTypeModule,
        VendorsServiceCategoryModule,
        LocationTypesModule,
        ContactsModule,
        AddressesModule,
    ],
    controllers: [FactoriesController],
    providers: [...FactoriesProvider, FactoriesService],
    exports: [FactoriesService],
})
export class FactoriesModule {}
