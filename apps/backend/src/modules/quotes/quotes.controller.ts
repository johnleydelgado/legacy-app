import {
  Controller,
  Get,
  Req,
  HttpStatus,
  Res,
  UseGuards,
  Query,
  Param,
  Post,
  Body,
  Delete,
  Put,
  HttpException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuotesService } from './quotes.service';
import { QuotesEntity } from './quotes.entity';
import { CreateQuotesDto, UpdateQuotesDto } from './quotes.dto';
import { CustomersService } from '../customers/customers.service';
import { ContactsService } from '../contacts/contacts.service';
import { AddressesService } from '../addresses/addresses.service';
import { QuotesItemsService } from '../quotes-items/quotes-items.service';
import { StatusService } from '../status/status.service';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';

@Controller({ version: '1', path: 'quotes' })
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly customersService: CustomersService,
    private readonly contactsService: ContactsService,
    private readonly addressesService: AddressesService,
    private readonly quotesItemsService: QuotesItemsService,
    private readonly statusService: StatusService,
    private readonly serialEncoderService: SerialEncoderService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all quotes',
      },
    });
  }

  @Get()
  async getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
  ) {
    // Parse sort parameter
    let sortOptions = {};
    if (sort) {
      try {
        sortOptions = JSON.parse(sort);
      } catch (error) {
        // Handle invalid JSON, use default sorting
        sortOptions = {};
      }
    }
    
    // Parse filter parameter
    let filterOptions = {};
    if (filter) {
      try {
        filterOptions = JSON.parse(filter);
      } catch (error) {
        // Handle invalid JSON, use no filtering
        filterOptions = {};
      }
    }
    
    const quotesList = await this.quotesService.findAll({ 
      page, 
      limit, 
      sort: sortOptions,
      filter: filterOptions,
    });
    const dataMeta = quotesList.meta;

    const normalizeList = await Promise.all(
      quotesList.items.map(async (data) => {
        const customerID = data.fk_customer_id;

        const customerData = await this.customersService.findOne(customerID);
        const statusData = await this.statusService.findOne(data.fk_status_id);

        return {
          pk_quote_id: data.pk_quote_id,
          customer: {
            id: customerData?.pk_customer_id,
            name: customerData?.name,
            owner_name: customerData?.owner_name,
          },
          status: {
            id: statusData?.id,
            process: statusData?.process,
            status: statusData?.status,
            color: statusData?.color
          },
          quote_number: data.quote_number,
          quote_date: data.quote_date,
          expiration_date: data.expiration_date,
          subtotal: data.subtotal,
          tax_total: data.tax_total,
          total_amount: data.total_amount,
          currency: data.currency,
          terms: data.terms,
          tags: data.tags,
          user_owner: data.user_owner,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }),
    );

    return { items: normalizeList, meta: dataMeta };
  }

  @Get('search')
  async search(
    @Query('q') searchTerm: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('fields') fields?: string,
    @Query('match') matchType: 'partial' | 'exact' | 'phrase' = 'phrase',
  ) {
    
    // Handle URL encoded search terms
    let decodedSearchTerm = '';

    if (!searchTerm) {
      console.log('No search term provided');
      return {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
      };
    }

    try {
      // Decode URL encoded characters
      // NestJS usually handles this, but let's be explicit for edge cases
      decodedSearchTerm = decodeURIComponent(searchTerm);

      // Handle + symbols that might represent spaces (application/x-www-form-urlencoded)
      decodedSearchTerm = decodedSearchTerm.replace(/\+/g, ' ');

      // Additional cleanup for various space encodings
      decodedSearchTerm = decodedSearchTerm
        .replace(/%20/g, ' ') // Handle any remaining %20
        .replace(/\s+/g, ' ') // Normalize multiple spaces to single spaces
        .trim(); // Remove leading/trailing spaces
    } catch (error) {
      // If decoding fails, use the original term
      decodedSearchTerm = searchTerm.replace(/\+/g, ' ').trim();
    }

    if (decodedSearchTerm.length === 0) {
      console.log('Search term empty after decoding');
      return {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
      };
    }

    // Parse search fields from query parameter
    const searchFields = fields
      ? fields.split(',').map((f) => f.trim())
      : ['quote_number', 'customer_name', 'customer_owner_name'];

    try {
      const searchResults = await this.quotesService.searchQuotes(
        decodedSearchTerm,
        { page, limit },
        searchFields,
        matchType,
      );

      // Transform the results to match your existing format
      const normalizeList = await Promise.all(
        searchResults.items.map(async (data: any) => {
          // If the join was successful, customer data should be available directly
          // Otherwise, fetch it separately
          let customerData;
          if (data.customer) {
            customerData = data.customer;
          } else {
            customerData = await this.customersService.findOne(
              data.fk_customer_id,
            );
          }

          let statusData;

          if (data.status) {
            statusData = data.status;
          } else {
            statusData = await this.statusService.findOne(data.fk_status_id);
          }

          return {
            pk_quote_id: data.pk_quote_id,
            customer: {
              id: customerData?.pk_customer_id,
              name: customerData?.name,
              owner_name: customerData?.owner_name,
            },
            status: {
              id: statusData?.id,
              process: statusData?.process,
              status: statusData?.status,
              color: statusData?.color
            },
            quote_number: data.quote_number,
            quote_date: data.quote_date,
            expiration_date: data.expiration_date,
            subtotal: data.subtotal,
            tax_total: data.tax_total,
            currency: data.currency,
            terms: data.terms,
            tags: data.tags,
            user_owner: data.user_owner,
          };
        }),
      );

      return {
        items: normalizeList,
        meta: searchResults.meta,
        searchTerm: decodedSearchTerm, // Return the decoded term for debugging
        originalSearchTerm: searchTerm, // Return original for debugging
        searchFields,
        matchType,
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new HttpException(
        `Search failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dashboard/summary')
  async getDashboardSummary() {
    try {
      const [statusCounts, allStatuses, dashboardMetrics] = await Promise.all([
        this.quotesService.getQuotesStatusCounts(),
        this.quotesService.getQuotesStatus(),
        this.quotesService.getDashboardMetrics()
      ]);

      // Calculate totals by process
      const processSummary = statusCounts.reduce((acc, item) => {
        if (!acc[item.process]) {
          acc[item.process] = {
            process: item.process,
            total: 0,
            statuses: []
          };
        }
        acc[item.process].total += parseInt(item.count, 10);
        acc[item.process].statuses.push({
          id: item.status_id,
          status: item.status,
          color: item.color,
          count: parseInt(item.count, 10)
        });
        return acc;
      }, {});

      const totalQuotes = statusCounts.reduce((sum, item) => sum + parseInt(item.count, 10), 0);

      return {
        // Main dashboard metrics (matching your UI)
        totalValue: dashboardMetrics.totalValue,
        summary: {
          totalValue: {
            label: 'TOTAL VALUE',
            amount: dashboardMetrics.outstandingAmount,
            description: 'Outstanding amount'
          },
          awaitingApproval: {
            label: 'AWAITING APPROVAL',
            count: dashboardMetrics.awaitingApprovalCount,
            description: 'Pending quotes'
          },
          ownerBreakdown: {
            label: 'OWNER BREAKDOWN',
            count: dashboardMetrics.topOwner?.count ?? 0,
            owner: dashboardMetrics.topOwner?.owner ?? 'Unknown',
            description: dashboardMetrics.topOwner?.owner ?? 'Top owner'
          }
        },

        // Detailed breakdown
        ownerBreakdown: dashboardMetrics.ownerBreakdown,

        // Existing data
        totalQuotes,
        processSummary: Object.values(processSummary),
        detailedCounts: statusCounts,
        availableStatuses: allStatuses,

        // Timestamps
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw new HttpException(
        'Failed to fetch dashboard summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('customer/:customerId')
  async getByCustomerId(
    @Param('customerId') customerId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      const quotesList = await this.quotesService.findByCustomerId(customerId, {
        page,
        limit,
      });
      const dataMeta = quotesList.meta;

      const normalizeList = await Promise.all(
        quotesList.items.map(async (data) => {
          const customerData = await this.customersService.findOne(
            data.fk_customer_id,
          );

          // Get quote items for this quote
          const quoteItems = await this.quotesItemsService.findByQuoteId(
            data.pk_quote_id,
            { page: 1, limit: 100 }, // Get all items for each quote
          );

          // Get Status Data
          const statusData = await this.statusService.findOne(data.fk_status_id);

          return {
            pk_quote_id: data.pk_quote_id,
            customer: {
              id: customerData?.pk_customer_id,
              name: customerData?.name,
              owner_name: customerData?.owner_name,
            },
            quote_number: data.quote_number,
            quote_date: data.quote_date,
            expiration_date: data.expiration_date,
            status: {
              id: statusData?.id,
              process: statusData?.process,
              status: statusData?.status,
              color: statusData?.color
            },
            subtotal: data.subtotal,
            tax_total: data.tax_total,
            currency: data.currency,
            terms: data.terms,
            tags: data.tags,
            user_owner: data.user_owner,
            created_at: data.created_at,
            updated_at: data.updated_at,
            quote_items: quoteItems.items.map((item) => ({
              pk_quote_item_id: item.pk_quote_item_id,
              fk_product_id: item.fk_product_id,
              fk_packaging_id: item.fk_packaging_id,
              fk_trim_id: item.fk_trim_id,
              fk_yarn_id: item.fk_yarn_id,
              item_name: item.item_name,
              item_description: item.item_description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              tax_rate: item.tax_rate,
              created_at: item.created_at,
              updated_at: item.updated_at,
            })),
          };
        }),
      );

      return { items: normalizeList, meta: dataMeta };
    } catch (error) {
      console.error('Error fetching quotes by customer ID:', error);
      throw new HttpException(
        'Failed to fetch quotes by customer ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const quotesData = await this.quotesService.findOne(id);
    const customerID = quotesData?.fk_customer_id || -1;

    const customerData = await this.customersService.findOne(customerID);
    const statusData = await this.statusService.findOne(quotesData?.fk_status_id || 1);
    const contactPrimaryData =
      await this.contactsService.getContactByCustomerIDType(customerID);

    const billingAddressData = await this.addressesService.findAllByCustomerID(
      { page: 1, limit: 10 },
      customerID,
      'BILLING',
    );
    const shippingAddressData = await this.addressesService.findAllByCustomerID(
      { page: 1, limit: 5 },
      customerID,
      'SHIPPING',
    );

    const serialEncoderData = await this.serialEncoderService.findOne(quotesData?.fk_serial_encoder_id || -1);

    return {
      pk_quote_id: quotesData?.pk_quote_id,
      customer: {
        pk_customer_id: customerData?.pk_customer_id,
        name: customerData?.name,
        owner_name: customerData?.owner_name,
        notes: customerData?.notes,
        tags: customerData?.tags,
        contact_primary: {
          pk_contact_id: contactPrimaryData?.pk_contact_id,
          first_name: contactPrimaryData?.first_name,
          last_name: contactPrimaryData?.last_name,
          email: contactPrimaryData?.email,
          phone_number: contactPrimaryData?.phone_number,
          mobile_number: contactPrimaryData?.mobile_number,
          contact_type: contactPrimaryData?.contact_type,
        },
        addresses: [...billingAddressData.items, ...shippingAddressData.items],
      },
      status: {
        id: statusData?.id,
        process: statusData?.process,
        status: statusData?.status,
        color: statusData?.color,
      },
      serial_encoder: {
        id: serialEncoderData?.id,
        serial_quote_id: serialEncoderData?.purpose?.quote_id || -1,
        serial_order_id: serialEncoderData?.purpose?.order_id || -1,
        serial_invoice_ids: serialEncoderData?.purpose?.invoice_ids || [],
        serial_purchase_order_ids: serialEncoderData?.purpose?.purchase_order_ids || [],
      },
      quote_number: quotesData?.quote_number,
      quote_date: quotesData?.quote_date,
      expiration_date: quotesData?.expiration_date,
      subtotal: quotesData?.subtotal,
      tax_total: quotesData?.tax_total,
      total_amount: quotesData?.total_amount,
      currency: quotesData?.currency,
      terms: quotesData?.terms,
      tags: quotesData?.tags,
      notes: quotesData?.notes,
      user_owner: quotesData?.user_owner,
      created_at: quotesData?.created_at,
      updated_at: quotesData?.updated_at,
    };
  }

  @Post()
  create(@Body() createQuotesDto: CreateQuotesDto) {
    return this.quotesService.create(createQuotesDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.quotesService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() quotes: UpdateQuotesDto,
  ): Promise<QuotesEntity> {
    return this.quotesService.update(id, quotes);
  }

  // constructor(private contactsService: ContactsService) {}
  // // @UseGuards(AuthGuard('jwt'))
  // @Get()
  // ping(@Req() request: Request, @Res() response: Response) {
  //   return response.status(HttpStatus.OK).json(
  //     {
  //       data: {
  //         message: "This action returns all contacts"
  //       }
  //     });
  // }
  //
  // // @UseGuards(JwtAuthGuard)
  // @Get(contactsAllURL)
  // async findAll(): Promise<ContactsEntity[]> {
  //   return this.contactsService.findAll();
  // }
}
