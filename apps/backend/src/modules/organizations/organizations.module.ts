import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrganizationsProvider } from './organizations.provider';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationsController],
  providers: [...OrganizationsProvider, OrganizationsService],
  exports: [OrganizationsService],
})

export class OrganizationsModule {}
