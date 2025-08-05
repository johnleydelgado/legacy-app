import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomersEntity } from './customers.entity';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CreateCustomersDto, CustomerKpiDto, UpdateCustomersDto } from './customers.dto';
import { AddressesService } from '../addresses/addresses.service';
import { ContactsService } from '../contacts/contacts.service';
import { DataSource, Between, LessThan} from 'typeorm';
import { OrdersService } from '../orders/orders.service';
import { DashboardMetricDto } from '../orders/orders.dto';

import { AddressesEntity } from '../addresses/addresses.entity';
import { ContactsEntity } from '../contacts/contacts.entity';
import { calculatePercentChange } from './customers.helpers.functions';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class CustomersService {
  constructor(
    @Inject('CUSTOMERS_REPOSITORY')
    private customersRepository: Repository<CustomersEntity>,
    private addressesService: AddressesService,
    private contactsService: ContactsService,
    private dataSource: DataSource,
    private ordersService: OrdersService,
    private organizationsService: OrganizationsService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return await paginate(this.customersRepository, options, {
      order: { name: 'ASC' }
    }); 
  }

  async findAllV2(options: IPaginationOptions) {
    return await paginate(this.customersRepository, options);
  }

  async findAllWithoutPagination() {
    return await this.customersRepository.find();
  }

  async findAllWithoutPaginationV2() {
    return await this.customersRepository.find();
  }

  findOne(pk_customer_id: number): Promise<CustomersEntity | null> {
    return this.customersRepository.findOne({ where: { pk_customer_id } });
  }

  // Advanced search with multiple criteria and space handling (MySQL compatible)
  async advancedSearch(
    searchTerm: string,
    options: IPaginationOptions,
    searchFields: string[] = ['name', 'owner_name'],
    matchType: 'partial' | 'exact' = 'partial',
  ) {
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    const queryBuilder =
      this.customersRepository.createQueryBuilder('customer');

    if (matchType === 'exact') {
      // Exact phrase matching across specified fields
      searchFields.forEach((field, index) => {
        if (index === 0) {
          queryBuilder.where(`LOWER(customer.${field}) LIKE :searchTerm`, {
            searchTerm: `%${cleanSearchTerm}%`,
          });
        } else {
          queryBuilder.orWhere(`LOWER(customer.${field}) LIKE :searchTerm`, {
            searchTerm: `%${cleanSearchTerm}%`,
          });
        }
      });
    } else {
      // Partial word matching - each word must be found in at least one field
      const searchWords = cleanSearchTerm
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (searchWords.length === 1) {
        // Single word
        searchFields.forEach((field, index) => {
          if (index === 0) {
            queryBuilder.where(`LOWER(customer.${field}) LIKE :searchTerm`, {
              searchTerm: `%${cleanSearchTerm}%`,
            });
          } else {
            queryBuilder.orWhere(`LOWER(customer.${field}) LIKE :searchTerm`, {
              searchTerm: `%${cleanSearchTerm}%`,
            });
          }
        });
      } else {
        // Multiple words - each word must appear in at least one of the specified fields
        searchWords.forEach((word, wordIndex) => {
          const paramName = `searchTerm${wordIndex}`;
          const fieldConditions = searchFields
            .map((field) => `LOWER(customer.${field}) LIKE :${paramName}`)
            .join(' OR ');

          if (wordIndex === 0) {
            queryBuilder.where(`(${fieldConditions})`, {
              [paramName]: `%${word}%`,
            });
          } else {
            queryBuilder.andWhere(`(${fieldConditions})`, {
              [paramName]: `%${word}%`,
            });
          }
        });
      }
    }

    queryBuilder.orderBy('customer.name', 'ASC');
    return paginate(queryBuilder, options);
  }

  async create(
    createCustomerDto: CreateCustomersDto,
  ): Promise<CustomersEntity> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the customer
      const newCustomer = new CustomersEntity();
      const converted_at = new Date(createCustomerDto.convertedAt);
      const tags =
        createCustomerDto.tags?.length <= 0 ? '[]' : createCustomerDto.tags;

      newCustomer.fk_organization_id = createCustomerDto.organizationID;
      newCustomer.name = createCustomerDto.name;
      newCustomer.owner_name = createCustomerDto.ownerName;
      newCustomer.email = createCustomerDto.email;
      newCustomer.phone_number = createCustomerDto.phoneNumber;
      newCustomer.mobile_number = createCustomerDto.mobileNumber;
      newCustomer.website_url = createCustomerDto.websiteURL;
      newCustomer.industry = createCustomerDto.industry;
      newCustomer.customer_type = createCustomerDto.customerType;
      newCustomer.status = createCustomerDto.status;
      newCustomer.source = createCustomerDto.source;
      newCustomer.converted_at = converted_at;
      newCustomer.notes = createCustomerDto.notes;
      newCustomer.vat_number = createCustomerDto.vatNumber;
      newCustomer.tax_id = createCustomerDto.taxID;
      newCustomer.tags = tags;
      newCustomer.created_at = new Date();
      newCustomer.updated_at = new Date();

      const savedCustomer = await queryRunner.manager.save(
        CustomersEntity,
        newCustomer,
      );

      // 2. Create addresses if provided
      if (
        createCustomerDto.addresses &&
        createCustomerDto.addresses.length > 0
      ) {
        for (const addressDto of createCustomerDto.addresses) {
          const address = {
            ...addressDto,
            fk_id: savedCustomer.pk_customer_id,
            table: 'Customers',
          };
          await this.addressesService.create(address);
        }
      }

      // 3. Create contacts if provided
      if (createCustomerDto.contacts && createCustomerDto.contacts.length > 0) {
        for (const contactDto of createCustomerDto.contacts) {
          const contact = {
            ...contactDto,
            fk_id: savedCustomer.pk_customer_id,
            table: 'Customers',
          };
          await this.contactsService.create(contact);
        }
      }

      await queryRunner.commitTransaction();
      return savedCustomer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(pk_customer_id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete related addresses
      await queryRunner.manager.delete('Addresses', {
        fk_id: pk_customer_id,
        table: 'Customers',
      });

      // Delete related contacts
      await queryRunner.manager.delete('Contacts', {
        fk_id: pk_customer_id,
        table: 'Customers',
      });

      // Delete the customer
      const result = await queryRunner.manager.delete(
        CustomersEntity,
        pk_customer_id,
      );

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateCustomersDto: UpdateCustomersDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const toUpdate = await this.customersRepository.findOne({
        where: { pk_customer_id: id },
      });
      if (!toUpdate) {
        throw new Error('Customer not found');
      }

      const converted_at = updateCustomersDto.convertedAt
        ? new Date(updateCustomersDto.convertedAt)
        : toUpdate.converted_at;

      const updated = Object.assign({
        pk_customer_id: toUpdate.pk_customer_id,
        fk_organization_id: toUpdate.fk_organization_id,
        name: updateCustomersDto.name ?? toUpdate.name,
        owner_name: updateCustomersDto.ownerName ?? toUpdate.owner_name,
        email: updateCustomersDto.email ?? toUpdate.email,
        phone_number: updateCustomersDto.phoneNumber ?? toUpdate.phone_number,
        mobile_number:
          updateCustomersDto.mobileNumber ?? toUpdate.mobile_number,
        website_url: updateCustomersDto.websiteURL ?? toUpdate.website_url,
        industry: updateCustomersDto.industry ?? toUpdate.industry,
        customer_type:
          updateCustomersDto.customerType ?? toUpdate.customer_type,
        status: updateCustomersDto.status ?? toUpdate.status,
        source: updateCustomersDto.source ?? toUpdate.source,
        converted_at: converted_at,
        notes: updateCustomersDto.notes ?? toUpdate.notes,
        vat_number: updateCustomersDto.vatNumber ?? toUpdate.vat_number,
        tax_id: updateCustomersDto.taxID ?? toUpdate.tax_id,
        tags: updateCustomersDto.tags ?? toUpdate.tags,
        created_at: toUpdate.created_at,
        updated_at: new Date(),
      });

      const savedCustomer = await queryRunner.manager.save(
        CustomersEntity,
        updated,
      );

      // Update addresses if provided
      if (
        updateCustomersDto.addresses &&
        updateCustomersDto.addresses.length > 0
      ) {
        // Delete existing addresses
        await queryRunner.manager.delete('Addresses', {
          fk_id: id,
          table: 'Customers',
        });

        // Create new addresses using the same query runner
        for (const addressDto of updateCustomersDto.addresses) {
          const newAddress = new AddressesEntity();
          newAddress.fk_id = savedCustomer.pk_customer_id;
          newAddress.address1 = addressDto.address1;
          newAddress.address2 = addressDto.address2 ?? '';
          newAddress.city = addressDto.city;
          newAddress.state = addressDto.state;
          newAddress.zip = addressDto.zip;
          newAddress.country = addressDto.country;
          newAddress.address_type = addressDto.address_type;
          newAddress.table = 'Customers';
          await queryRunner.manager.save(AddressesEntity, newAddress);
        }
      }

      // Update contacts if provided
      if (
        updateCustomersDto.contacts &&
        updateCustomersDto.contacts.length > 0
      ) {
        // Delete existing contacts
        await queryRunner.manager.delete('Contacts', {
          fk_id: id,
          table: 'Customers',
        });

        // Create new contacts using the same query runner
        for (const contactDto of updateCustomersDto.contacts) {
          const newContact = new ContactsEntity();
          newContact.fk_id = savedCustomer.pk_customer_id;
          newContact.first_name = contactDto.firstname;
          newContact.last_name = contactDto.lastname;
          newContact.email = contactDto.email;
          newContact.phone_number = contactDto.phoneNumber;
          newContact.mobile_number = contactDto.mobileNumber;
          newContact.position_title = contactDto.positionTitle;
          newContact.contact_type = contactDto.contactType;
          newContact.table = 'Customers';
          await queryRunner.manager.save(ContactsEntity, newContact);
        }
      }

      await queryRunner.commitTransaction();
      return savedCustomer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Optimized method to get all customers with contacts and addresses using joins
  async findAllWithContactsAndAddressesOptimized() {
    const query = `
      SELECT 
        c.*,
        CASE 
          WHEN COUNT(DISTINCT contacts.pk_contact_id) = 0 THEN JSON_ARRAY()
          ELSE JSON_ARRAYAGG(
            CASE WHEN contacts.pk_contact_id IS NOT NULL THEN
              JSON_OBJECT(
                'pk_contact_id', contacts.pk_contact_id,
                'first_name', contacts.first_name,
                'last_name', contacts.last_name,
                'email', contacts.email,
                'phone_number', contacts.phone_number,
                'mobile_number', contacts.mobile_number,
                'position_title', contacts.position_title,
                'contact_type', contacts.contact_type
              )
            END
          )
        END as contacts,
        CASE 
          WHEN COUNT(DISTINCT addresses.pk_address_id) = 0 THEN JSON_ARRAY()
          ELSE JSON_ARRAYAGG(
            CASE WHEN addresses.pk_address_id IS NOT NULL THEN
              JSON_OBJECT(
                'pk_address_id', addresses.pk_address_id,
                'address1', addresses.address1,
                'address2', addresses.address2,
                'city', addresses.city,
                'state', addresses.state,
                'zip', addresses.zip,
                'country', addresses.country,
                'address_type', addresses.address_type
              )
            END
          )
        END as addresses
      FROM Customers c
      LEFT JOIN Contacts contacts ON contacts.fk_id = c.pk_customer_id AND contacts.table = 'Customers'
      LEFT JOIN Addresses addresses ON addresses.fk_id = c.pk_customer_id AND addresses.table = 'Customers'
      GROUP BY c.pk_customer_id
      ORDER BY c.name ASC
    `;

    try {
      const result = await this.dataSource.query(query);
      return result.map((row) => ({
        ...row,
        contacts: row.contacts || [],
        addresses: row.addresses || [],
      }));
    } catch (error) {
      console.error(
        'Error in findAllWithContactsAndAddressesOptimized:',
        error,
      );
      throw error;
    }
  }

  async getCustomerKpis(): Promise<CustomerKpiDto> {
    try {
      // Get current date information
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Calculate first day of current month and previous month
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
      const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1);

      // Get total customers count
      const totalCustomers = await this.customersRepository.count();

      // Get total customers one month ago for comparison
      const totalCustomersLastMonth = await this.customersRepository.count({
        where: {
          created_at: LessThan(firstDayCurrentMonth)
        }
      });

      // Get active customers (status = 'ACTIVE')
      const activeCustomers = await this.customersRepository.count({
        where: {
          status: 'ACTIVE'
        }
      });

      // Get active customers one month ago
      const activeCustomersLastMonth = await this.customersRepository.count({
        where: {
          status: 'ACTIVE',
          created_at: LessThan(firstDayCurrentMonth)
        }
      });

      // Get new customers this month
      const newCustomersThisMonth = await this.customersRepository.count({
        where: {
          created_at: Between(firstDayCurrentMonth, now)
        }
      });

      // Get new customers in previous month
      const newCustomersLastMonth = await this.customersRepository.count({
        where: {
          created_at: Between(firstDayPreviousMonth, firstDayCurrentMonth)
        }
      });

      // Use the OrdersService to get real revenue data
      const revenueMetric = await this.ordersService.getTotalRevenue();

      // Calculate percentage changes
      const totalPercentChange = calculatePercentChange(totalCustomers, totalCustomersLastMonth);
      const activePercentChange = calculatePercentChange(activeCustomers, activeCustomersLastMonth);
      const newCustomersPercentChange = calculatePercentChange(newCustomersThisMonth, newCustomersLastMonth);

      return {
        totalCustomers: {
          value: totalCustomers,
          percentage: totalPercentChange,
          label: 'All customers'
        },
        activeCustomers: {
          value: activeCustomers,
          percentage: activePercentChange,
          label: 'Active customers'
        },
        newThisMonth: {
          value: newCustomersThisMonth,
          percentage: newCustomersPercentChange,
          label: 'New this month'
        },
        totalRevenue: {
          value: revenueMetric.value,
          percentage: revenueMetric?.percentage || 0,
          label: 'All customers'
        }
      }
    } catch (error) {
      console.error('Error in getCustomerKpis:', error);
      throw error;
    }
  }

  async unifiedSearch(
    searchTerm: string,
    options: IPaginationOptions,
  ) {
    const cleanSearchTerm = searchTerm.trim().toLowerCase();

    // Check if the entire term is a number for ID searches
    const isNumeric = !isNaN(parseInt(cleanSearchTerm)) && !isNaN(parseFloat(cleanSearchTerm));
    const numericValue = isNumeric ? parseInt(cleanSearchTerm) : -1;

    // Split search term into individual words
    const searchWords = cleanSearchTerm.split(/\s+/).filter(word => word.length > 0);

    // Generate dynamic SQL based on number of search words
    let whereClause = '';
    // Explicitly type the arrays to fix TypeScript errors
    let params: (string | number)[] = [];
    let countParams: (string | number)[] = [];

    // Add ID-based search conditions
    if (isNumeric) {
      whereClause += 'c.pk_customer_id = ? OR contacts.pk_contact_id = ?';
      params.push(numericValue, numericValue);
      countParams.push(numericValue, numericValue);
    }

    // For single-word searches or multi-word searches
    if (searchWords.length > 0) {
      // If we already have ID conditions, add OR
      if (whereClause.length > 0) {
        whereClause += ' OR ';
      }

      // For each searchable text field, create conditions
      const textFields = [
        'c.name',
        'c.owner_name',
        'contacts.first_name',
        'contacts.last_name'
      ];

      // For multi-word searches, each word must be found in at least one field
      if (searchWords.length > 1) {
        // For each word, at least one field must contain it
        searchWords.forEach((word, i) => {
          if (i > 0) {
            whereClause += ' AND ';
          }

          whereClause += '(';
          textFields.forEach((field, j) => {
            if (j > 0) {
              whereClause += ' OR ';
            }
            whereClause += `LOWER(${field}) LIKE ?`;
            params.push(`%${word}%`);
            countParams.push(`%${word}%`);
          });
          whereClause += ')';
        });
      } else {
        // For single word searches, create simple OR conditions
        whereClause += '(';
        textFields.forEach((field, j) => {
          if (j > 0) {
            whereClause += ' OR ';
          }
          whereClause += `LOWER(${field}) LIKE ?`;
          params.push(`%${searchWords[0]}%`);
          countParams.push(`%${searchWords[0]}%`);
        });
        whereClause += ')';
      }
    }

    // Construct the final query with our dynamic WHERE clause
    const query = `
    SELECT DISTINCT c.*
    FROM Customers c
    LEFT JOIN Contacts contacts ON contacts.fk_id = c.pk_customer_id AND contacts.table = 'Customers'
    WHERE ${whereClause}
    ORDER BY c.name ASC
    LIMIT ? OFFSET ?
  `;

    const countQuery = `
    SELECT COUNT(DISTINCT c.pk_customer_id) as total
    FROM Customers c
    LEFT JOIN Contacts contacts ON contacts.fk_id = c.pk_customer_id AND contacts.table = 'Customers'
    WHERE ${whereClause}
  `;

    // Add pagination parameters
    params.push(Number(options.limit), (Number(options.page) - 1) * Number(options.limit));

    try {
      // Execute the queries
      const customers = await this.dataSource.query(query, params);
      const countResult = await this.dataSource.query(countQuery, countParams);
      const total = countResult[0].total;

      // Fetch contacts and addresses for each customer
      const customersWithDetails = await Promise.all(
        customers.map(async (customer) => {
          const contactsList = await this.contactsService.findAllByCustomerID(
            null,
            customer.pk_customer_id,
          );

          const addressList = await this.addressesService.findAllByCustomerID(
            null,
            customer.pk_customer_id,
          );

          // Add organization data
          const organizationData = customer.fk_organization_id ?
            await this.organizationsService.findOne(customer.fk_organization_id) : null;

          // Get primary contact
          const primaryContact =
            await this.contactsService.getContactByCustomerIDType(customer.pk_customer_id);

          // Get orders data
          const ordersData = await this.ordersService.findAllByCustomerID(
            customer.pk_customer_id,
            { page: 1, limit: 5 }
          );
          const ordersTotalAmount = await this.ordersService.getTotalAmountByCustomerID(
            customer.pk_customer_id
          );

          return {
            ...customer,
            contacts: contactsList.items,
            addresses: addressList.items,
            primary_contact: primaryContact ? {
              pk_contact_id: primaryContact.pk_contact_id,
              first_name: primaryContact.first_name,
              last_name: primaryContact.last_name,
              email: primaryContact.email,
              phone_number: primaryContact.phone_number,
              mobile_number: primaryContact.mobile_number,
              position_title: primaryContact.position_title,
              contact_type: primaryContact.contact_type,
            } : null,
            organization_data: organizationData ? {
              id: organizationData.pk_organization_id,
              name: organizationData.name,
              industry: organizationData.industry,
              website_url: organizationData.website_url,
              email: organizationData.email,
            } : null,
            total_orders: ordersData.meta.totalItems,
            total_orders_spent: ordersTotalAmount
          };
        })
      );

      // Create pagination metadata
      const meta = {
        totalItems: total,
        itemCount: customers.length,
        itemsPerPage: Number(options.limit),
        totalPages: Math.ceil(total / Number(options.limit)),
        currentPage: Number(options.page),
      };

      return {
        items: customersWithDetails,
        meta,
      };
    } catch (error) {
      console.error('Error in unifiedSearch:', error);
      throw error;
    }
  }
}
