import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { VendorsTypeProvider } from './vendors-type.provider';
import { VendorsTypeService } from './vendors-type.services';
import { VendorsTypeController } from './vendors-type.controller';


@Module({
    imports: [
        DatabaseModule,
    ],
    controllers: [VendorsTypeController],
    providers: [VendorsTypeService, ...VendorsTypeProvider],
    exports: [VendorsTypeService],
})

export class VendorsTypeModule {}
