import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ContactsEntity } from './contacts.entity';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CreateContactsDto, UpdateContactsDto } from './contacts.dto';

@Injectable()
export class ContactsService {
  constructor(
    @Inject('CONTACTS_REPOSITORY')
    private contactsRepository: Repository<ContactsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.contactsRepository, options);
  }

  findOne(pk_contact_id: number): Promise<ContactsEntity | null> {
    return this.contactsRepository.findOne({ where: { pk_contact_id } });
  }

  async findAllByCustomerID(
    options: IPaginationOptions | null,
    customerID: number,
  ) {
    const query: any = {
      where: {
        fk_id: customerID,
        table: 'Customers',
      },
    };

    if (options && options.page && options.limit) {
      query.take = Number(options.limit);
      query.skip = (Number(options.page) - 1) * Number(options.limit);
    }

    const [contacts, total] = await this.contactsRepository.findAndCount(query);
    return { items: contacts, totalItems: total };
  }

  async create(createContactsDto: CreateContactsDto): Promise<ContactsEntity> {
    const newContacts = new ContactsEntity();

    newContacts.fk_id = createContactsDto.fk_id;
    newContacts.first_name = createContactsDto.firstname;
    newContacts.last_name = createContactsDto.lastname;
    newContacts.email = createContactsDto.email;
    newContacts.phone_number = createContactsDto.phoneNumber;
    newContacts.mobile_number = createContactsDto.mobileNumber;
    newContacts.position_title = createContactsDto.positionTitle;
    newContacts.contact_type = createContactsDto.contactType;
    newContacts.table = createContactsDto.table;
    newContacts.created_at = new Date();
    newContacts.updated_at = new Date();

    return await this.contactsRepository.save(newContacts);
  }

  async remove(pk_contact_id: number) {
    return await this.contactsRepository.delete(pk_contact_id);
  }

  async update(id: number, updateContactsDto: UpdateContactsDto) {
    const toUpdate = await this.contactsRepository.findOne({
      where: { pk_contact_id: id },
    });

    const updated = Object.assign(
      {
        pk_contact_id: toUpdate?.pk_contact_id,
        fk_id: toUpdate?.fk_id,
        first_name: toUpdate?.first_name,
        last_name: toUpdate?.last_name,
        email: toUpdate?.email,
        phone_number: toUpdate?.phone_number,
        mobile_number: toUpdate?.mobile_number,
        position_title: toUpdate?.position_title,
        contact_type: toUpdate?.contact_type,
        table: toUpdate?.table,
        created_at: toUpdate?.created_at,
        updated_at: toUpdate?.updated_at,
      },
      {
        first_name: updateContactsDto.firstname,
        last_name: updateContactsDto.lastname,
        email: updateContactsDto.email,
        phone_number: updateContactsDto.phoneNumber,
        mobile_number: updateContactsDto.mobileNumber,
        position_title: updateContactsDto.positionTitle,
        contact_type: updateContactsDto.contactType,
        updated_at: new Date(),
      },
    );

    return await this.contactsRepository.save(updated);
  }

  /**
   * Get primary contact for a specific customer
   * @param customerID - The customer ID to search for
   * @param contact_type
   * @returns Promise<ContactsEntity | null> - The primary contact or null if not found
   */
  async getContactByCustomerIDType(
    customerID: number,
    contact_type: string = 'primary'
  ): Promise<ContactsEntity | null> {
    return await this.contactsRepository.findOne({
      where: {
        fk_id: customerID,
        contact_type,
        table: 'Customers',
      },
    });
  }

  async getBillingContactByCustomerID(customerID: number): Promise<ContactsEntity | null> {
    return await this.contactsRepository.findOne({
      where: {
        fk_id: customerID,
        contact_type: 'billing',
        table: 'Customers',
      },
    });
  }

  async getShippingContactByCustomerID(customerID: number): Promise<ContactsEntity | null> {
    return await this.contactsRepository.findOne({
      where: {
        fk_id: customerID,
        contact_type: 'shipping',
        table: 'Customers',
      },
    });
  }

  /**
   * Get contact by foreign key ID, table name, and contact type
   * @param fk_id - The foreign key ID to search for
   * @param table - The table name to search in
   * @param contact_type - The type of contact to search for
   * @returns Promise<ContactsEntity | null> - The contact or null if not found
   */
  async getContactByFkIdAndTable(
    fk_id: number,
    table: string,
    contact_type: string
  ): Promise<ContactsEntity | null> {
    return await this.contactsRepository.findOne({
      where: {
        fk_id,
        table,
        contact_type,
      },
    });
  }
}
