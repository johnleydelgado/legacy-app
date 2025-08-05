import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { DatabaseModule } from '../../database/database.module';
import { ContactsProvider } from './contacts.provider';


@Module({
  imports: [DatabaseModule],
  controllers: [ContactsController],
  providers: [...ContactsProvider, ContactsService],
  exports: [ContactsService]
})

export class ContactsModule {}
