import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrganizationsEntity } from './organizations.entity';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CreateContactsDto, UpdateContactsDto } from '../contacts/contacts.dto';
import { ContactsEntity } from '../contacts/contacts.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from './organizations.dto';


@Injectable()
export class OrganizationsService {
  constructor(
    @Inject('ORGANIZATION_REPOSITORY')
    private organizationsRepository: Repository<OrganizationsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.organizationsRepository, options);
  }

  findOne(pk_organization_id: number): Promise<OrganizationsEntity | null> {
    return this.organizationsRepository.findOne({ where: { pk_organization_id } });
  }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<OrganizationsEntity> {
    const newOrganization = new OrganizationsEntity()

    newOrganization.name = createOrganizationDto.name;
    newOrganization.industry = createOrganizationDto.industry;
    newOrganization.website_url = createOrganizationDto.websiteURL;
    newOrganization.email = createOrganizationDto.email;
    newOrganization.phone_number = createOrganizationDto.phoneNumber;
    newOrganization.billing_address = createOrganizationDto.billingAddress;
    newOrganization.shipping_address = createOrganizationDto.shippingAddress;
    newOrganization.city = createOrganizationDto.city;
    newOrganization.state = createOrganizationDto.state;
    newOrganization.postal_code = createOrganizationDto.postalCode;
    newOrganization.country = createOrganizationDto.country;
    newOrganization.notes = createOrganizationDto.notes;
    newOrganization.tags = createOrganizationDto.tags;
    newOrganization.created_at = new Date();
    newOrganization.updated_at = new Date();

    return await this.organizationsRepository.save(newOrganization);
  }

  async remove(pk_organization_id: number) {
    return await this.organizationsRepository.delete(pk_organization_id);
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    const toUpdate = await this.organizationsRepository.findOne({ where: { pk_organization_id: id } });

    const updated = Object.assign({
      pk_organization_id: toUpdate?.pk_organization_id,
      name: toUpdate?.name,
      industry: toUpdate?.industry,
      website_url: toUpdate?.website_url,
      email: toUpdate?.email,
      phone_number: toUpdate?.phone_number,
      billing_address: toUpdate?.billing_address,
      shipping_address: toUpdate?.shipping_address,
      city: toUpdate?.city,
      state: toUpdate?.state,
      postal_code: toUpdate?.postal_code,
      country: toUpdate?.country,
      notes: toUpdate?.notes,
      tags: toUpdate?.tags,
      created_at: toUpdate?.created_at,
      updated_at: toUpdate?.updated_at,
    }, {
      name: updateOrganizationDto.name,
      industry: updateOrganizationDto.industry,
      website_url: updateOrganizationDto.websiteURL,
      email: updateOrganizationDto.email,
      phone_number: updateOrganizationDto.phoneNumber,
      billing_address: updateOrganizationDto.billingAddress,
      shipping_address: updateOrganizationDto.shippingAddress,
      city: updateOrganizationDto.city,
      state: updateOrganizationDto.state,
      postal_code: updateOrganizationDto.postalCode,
      country: updateOrganizationDto.country,
      notes: updateOrganizationDto.notes,
      tags: updateOrganizationDto.tags,
      updated_at: new Date()
    });

    return await this.organizationsRepository.save(updated);
  }
}
