import { DataSource } from 'typeorm';
import { ContactsEntity } from './contacts.entity';


export const ContactsProvider = [
  {
    provide: 'CONTACTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ContactsEntity),
    inject: ['DATA_SOURCE'],
  },
];
