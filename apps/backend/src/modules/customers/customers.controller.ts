import {
  Controller,
  Get,
  Req,
  HttpStatus,
  Res,
  Query,
  Param,
  Post,
  Body,
  Delete,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CustomersService } from './customers.service';
import { customersURL } from './customer.constants';
import { CustomersEntity } from './customers.entity';
import { CreateContactsDto, UpdateContactsDto } from '../contacts/contacts.dto';
import { ContactsEntity } from '../contacts/contacts.entity';
import { CreateCustomersDto, UpdateCustomersDto } from './customers.dto';
import { ContactsService } from '../contacts/contacts.service';
import { AddressesService } from '../addresses/addresses.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { OrdersService } from '../orders/orders.service';

@ApiTags('customers')
@Controller({ version: '1', path: customersURL })
export class CustomersController {
  constructor(
    private customersService: CustomersService,
    private organizationsService: OrganizationsService,
    private contactsService: ContactsService,
    private addressesService: AddressesService,
    private ordersService: OrdersService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all customers',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const customersList = await this.customersService.findAll({ page, limit });
    const dataMeta = customersList.meta;

    const normalizeData = await Promise.all(
      customersList.items.map(async (data) => {
        const customerID = data.pk_customer_id;

        const organizationData = await this.organizationsService.findOne(data.fk_organization_id);

        const primaryContact =
          await this.contactsService.getContactByCustomerIDType(customerID);

        const ordersData = await this.ordersService.findAllByCustomerID(data.pk_customer_id, {page: 1, limit: 10})
        const ordersTotalAmount = await this.ordersService.getTotalAmountByCustomerID(data.pk_customer_id)

        return {
          pk_customer_id: data.pk_customer_id,
          name: data.name,
          owner_name: data.owner_name,
          email: data.email,
          phone_number: data.phone_number,
          mobile_number: data.mobile_number,
          website_url: data.website_url,
          industry: data.industry,
          customer_type: data.customer_type,
          status: data.status,
          source: data.source,
          converted_at: data.converted_at,
          notes: data.notes,
          vat_number: data.vat_number,
          tax_id: data.tax_id,
          tags: data.tags,
          organization_data: {
            id: organizationData?.pk_organization_id || data.fk_organization_id,
            name: organizationData?.name,
            industry: organizationData?.industry,
            website_url: organizationData?.website_url,
            email: organizationData?.email,
          },
          primary_contact: {
            pk_contact_id: primaryContact?.pk_contact_id,
            first_name: primaryContact?.first_name,
            last_name: primaryContact?.last_name,
            email: primaryContact?.email,
            phone_number: primaryContact?.phone_number,
            mobile_number: primaryContact?.mobile_number,
            position_title: primaryContact?.position_title,
          },
          total_orders: ordersData.meta.totalItems,
          total_orders_spent: ordersTotalAmount,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }),
    );

    return { items: normalizeData, meta: dataMeta };
  }

  @Get('/with-contacts')
  async getAllV2(@Query('page') page = 1, @Query('limit') limit = 10) {
    const customersList = await this.customersService.findAllV2({
      page,
      limit,
    });
    const dataMeta = customersList.meta;

    const customerContactsList = await Promise.all(
      customersList.items.map(async (data) => {
        const contactList = await this.contactsService.findAllByCustomerID(
          null,
          data.pk_customer_id,
        );
        const addressList = await this.addressesService.findAllByCustomerID(
          null,
          data.pk_customer_id,
        );

        return {
          ...data,
          contacts: contactList.items,
          addresses: addressList.items,
        };
      }),
    );

    return { items: customerContactsList, meta: dataMeta };
  }

  // Search with contacts and addresses included
  @Get('/search')
  async searchCustomersWithDetails(
    @Query('q') searchTerm: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new BadRequestException('Search term is required');
    }

    const decodedSearchTerm = decodeURIComponent(searchTerm);
    const customersList = await this.customersService.advancedSearch(
      decodedSearchTerm,
      { page, limit },
    );

    const dataMeta = customersList.meta;

    const customerDetailsListList = await Promise.all(
      customersList.items.map(async (data) => {
        const contactList = await this.contactsService.findAllByCustomerID(
          null,
          data.pk_customer_id,
        );
        const addressList = await this.addressesService.findAllByCustomerID(
          null,
          data.pk_customer_id,
        );

        return {
          ...data,
          contacts: contactList.items,
          addresses: addressList.items,
        };
      }),
    );

    return { items: customerDetailsListList, meta: dataMeta };
  }

  // Optimized endpoint using database joins
  @Get('/all-with-contacts-optimized')
  async getAllWithContactsOptimized() {
    try {
      console.log('Starting optimized getAllWithContacts request');

      const customersWithDetails =
        await this.customersService.findAllWithContactsAndAddressesOptimized();

      console.log(
        `Successfully fetched ${customersWithDetails.length} customers with contacts and addresses`,
      );
      return customersWithDetails;
    } catch (error) {
      console.error('Error in getAllWithContactsOptimized:', error);
      throw new BadRequestException(
        `Failed to fetch customers: ${error.message}`,
      );
    }
  }

  @Get('/kpi')
  async getCustomerKpis() {
    try {
      return await this.customersService.getCustomerKpis();
    } catch (error) {
      console.error('Error in getCustomerKpis endpoint:', error);
      throw new BadRequestException(`Failed to fetch customer KPIs: ${error.message}`);
    }
  }

  @Get('/unified-search')
  async unifiedSearch(
    @Query('q') searchTerm: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new BadRequestException('Search term is required');
    }

    try {
      const decodedSearchTerm = decodeURIComponent(searchTerm);
      const searchWords = decodedSearchTerm.trim().split(/\s+/).filter(word => word.length > 0);

      console.log(`Performing unified search for term: "${decodedSearchTerm}" (${searchWords.length} words)`);

      const result = await this.customersService.unifiedSearch(
        decodedSearchTerm,
        { page, limit },
      );

      console.log(`Found ${result.meta.totalItems} customers matching search term "${decodedSearchTerm}"`);
      return result;
    } catch (error) {
      console.error('Error in unified search endpoint:', error);
      throw new BadRequestException(`Failed to perform search: ${error.message}`);
    }
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const customer = await this.customersService.findOne(id);
    if (!customer) {
      return null;
    }

    const contactList = await this.contactsService.findAllByCustomerID(
      null,
      customer.pk_customer_id,
    );
    const addressList = await this.addressesService.findAllByCustomerID(
      null,
      customer.pk_customer_id,
    );

    return {
      ...customer,
      contacts: contactList.items,
      addresses: addressList.items,
    };
  }

  @Get('/get-v2/:id')
  async getV2(@Param('id') id: number) {
    const customer = await this.customersService.findOne(id);

    if (!customer) {
      return null;
    }

    const primaryContact =
      await this.contactsService.getContactByCustomerIDType(id);
    const billingAddressData = await this.addressesService.findAllByCustomerID(
      { page: 1, limit: 5 },
      id,
      'BILLING',
    );
    const shippingAddressData = await this.addressesService.findAllByCustomerID(
      { page: 1, limit: 5 },
      id,
      'SHIPPING',
    );
    const allContactsData = await this.contactsService.findAllByCustomerID(
      null,
      id,
    );

    return {
      ...customer,
      primary_contact: {
        pk_contact_id: primaryContact?.pk_contact_id,
        first_name: primaryContact?.first_name,
        last_name: primaryContact?.last_name,
        email: primaryContact?.email,
        phone_number: primaryContact?.phone_number,
        mobile_number: primaryContact?.mobile_number,
        position_title: primaryContact?.position_title,
        contact_type: primaryContact?.contact_type,
      },
      contacts: allContactsData.items,
      addresses: [...billingAddressData.items, ...shippingAddressData.items],
    };
  }

  @Post()
  create(@Body() createCustomersDto: CreateCustomersDto) {
    return this.customersService.create(createCustomersDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.customersService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() customers: UpdateCustomersDto,
  ): Promise<CustomersEntity> {
    return this.customersService.update(id, customers);
  }
}
