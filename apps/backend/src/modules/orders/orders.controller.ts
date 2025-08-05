import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put } from '@nestjs/common';
import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { ordersAllURL, ordersURL } from './orders.constants';
import { CustomersService } from '../customers/customers.service';
import { ContactsService } from '../contacts/contacts.service';
import { StatusService } from '../status/status.service';
import { AddressesService } from '../addresses/addresses.service';
import { CreateOrdersDto, UpdateOrdersDto, OrderSortDto, OrderFilterDto } from './orders.dto';
import { OrdersEntity } from './orders.entity';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';


@Controller({ version: '1', path: ordersURL })
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private customersService: CustomersService,
    private contactsService: ContactsService,
    private statusService: StatusService,
    private addressesService: AddressesService,
    private serialEncoderService: SerialEncoderService,
  ) {}

  @Get()
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all orders"
        }
      });
  }

  @Get(ordersAllURL)
  async getAll(
    @Query('page') page = 1, 
    @Query('limit') limit = 10,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string
  ) {
    // Parse sort parameter
    let sortParams: OrderSortDto | undefined;
    if (sort) {
      try {
        sortParams = JSON.parse(sort);
      } catch (error) {
        throw new Error('Invalid sort parameter format');
      }
    }

    // Parse filter parameter
    let filterParams: OrderFilterDto | undefined;
    if (filter) {
      try {
        filterParams = JSON.parse(filter);
      } catch (error) {
        throw new Error('Invalid filter parameter format');
      }
    }

    const ordersPageData = await this.ordersService.findAll({ 
      page, 
      limit, 
      sort: sortParams, 
      filter: filterParams 
    });
    const meta = ordersPageData.meta;

    const normalizeData = await Promise.all(ordersPageData.items.map(async (data, index) => {
      const customerData = await this.customersService.findOne(data.fk_customer_id);
      const contactsData = await this.contactsService.getContactByCustomerIDType(data.fk_customer_id);
      let statusData = await this.statusService.findOne(data.fk_status_id);

      if (!statusData)
        statusData = await this.statusService.findOne(4);

      return {
        pk_order_id: data.pk_order_id,
        customer_data: {
          id: customerData?.pk_customer_id,
          name: customerData?.name,
        },
        contact: {
          id: contactsData?.pk_contact_id,
          first_name: contactsData?.first_name,
          last_name: contactsData?.last_name,
        },
        status: statusData,
        order_number: data.order_number,
        order_date: data.order_date,
        delivery_date: data.delivery_date,
        subtotal: data.subtotal,
        tax_total: data.tax_total,
        total_amount: data.total_amount,
        currency: data.currency,
        notes: data.notes,
        terms: data.terms,
        tags: data.tags,
        user_owner: data.user_owner,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get('/search')
  async searchOrders(
    @Query('q') searchQuery: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string
  ) {
    if (!searchQuery || searchQuery.trim() === '') {
      return {
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: Number(limit),
          totalPages: 0,
          currentPage: Number(page)
        }
      };
    }

    // Parse sort parameter
    let sortParams: OrderSortDto | undefined;
    if (sort) {
      try {
        sortParams = JSON.parse(sort);
      } catch (error) {
        throw new Error('Invalid sort parameter format');
      }
    }

    // Parse filter parameter
    let filterParams: OrderFilterDto | undefined;
    if (filter) {
      try {
        filterParams = JSON.parse(filter);
      } catch (error) {
        throw new Error('Invalid filter parameter format');
      }
    }

    const searchResults = await this.ordersService.searchOrders(
      searchQuery.trim(), 
      { 
        page: Number(page), 
        limit: Number(limit),
        sort: sortParams,
        filter: filterParams
      }
    );
    const meta = searchResults.meta;

    const normalizeData = await Promise.all(searchResults.items.map(async (data) => {
      const customerData = await this.customersService.findOne(data.fk_customer_id);
      const contactsData = await this.contactsService.getContactByCustomerIDType(data.fk_customer_id);
      let statusData = await this.statusService.findOne(data.fk_status_id);

      if (!statusData)
        statusData = await this.statusService.findOne(4);

      return {
        pk_order_id: data.pk_order_id,
        customer_data: {
          id: customerData?.pk_customer_id,
          name: customerData?.name,
        },
        contact: {
          id: contactsData?.pk_contact_id,
          first_name: contactsData?.first_name,
          last_name: contactsData?.last_name,
        },
        status: statusData,
        order_number: data.order_number,
        order_date: data.order_date,
        delivery_date: data.delivery_date,
        subtotal: data.subtotal,
        tax_total: data.tax_total,
        total_amount: data.total_amount,
        currency: data.currency,
        notes: data.notes,
        terms: data.terms,
        tags: data.tags,
        user_owner: data.user_owner,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get('analytics/dashboard')
  async getDashboardSummary() {
    const [
      totalValue,
      pendingOrders,
      newThisMonth,
      totalRevenue
    ] = await Promise.all([
      this.ordersService.getTotalOrderValue(),
      this.ordersService.getPendingOrdersCount(),
      this.ordersService.getNewOrdersThisMonth(),
      this.ordersService.getTotalRevenue()
    ]);

    return {
      totalValue,
      pendingOrders,
      newThisMonth,
      totalRevenue
    };
  }

  @Get('analytics/process-summary')
  async getProcessSummary() {
    return await this.ordersService.getProcessSummary();
  }

  @Get('analytics/owner-breakdown')
  async getOwnerBreakdown(@Query('limit') limit = 10) {
    return await this.ordersService.getOwnerBreakdown(Number(limit));
  }

  @Get('analytics/status-distribution')
  async getStatusDistribution() {
    return await this.ordersService.getStatusDistribution();
  }

  @Get('analytics/monthly-trends')
  async getMonthlyTrends(@Query('months') months = 12) {
    return await this.ordersService.getMonthlyTrends(Number(months));
  }

  @Get('analytics/revenue-by-customer')
  async getRevenueByCustomer(@Query('limit') limit = 10) {
    return await this.ordersService.getRevenueByCustomer(Number(limit));
  }

  @Get('analytics/performance-metrics')
  async getPerformanceMetrics() {
    const [
      avgOrderValue,
      completionRate,
      monthlyGrowth,
      topPerformingMonth
    ] = await Promise.all([
      this.ordersService.getAverageOrderValue(),
      this.ordersService.getCompletionRate(),
      this.ordersService.getMonthlyGrowthRate(),
      this.ordersService.getTopPerformingMonth()
    ]);

    return {
      averageOrderValue: avgOrderValue,
      completionRate,
      monthlyGrowthRate: monthlyGrowth,
      topPerformingMonth
    };
  }

  @Get('/customer/:id')
  async getAllByCustomerID(@Param('id') id: number, @Query('page') page = 1, @Query('limit') limit = 10) {
    const ordersPaginationData = await this.ordersService.findAllByCustomerID(id, { page, limit });
    const meta = ordersPaginationData.meta;

    const normalizeData = await Promise.all(ordersPaginationData.items.map(async (data) => {
      const customerData = await this.customersService.findOne(data.fk_customer_id);
      const contactsData = await this.contactsService.getContactByCustomerIDType(data.fk_customer_id);
      let statusData = await this.statusService.findOne(data.fk_status_id);

      if (!statusData)
        statusData = await this.statusService.findOne(4);

      return {
        pk_order_id: data.pk_order_id,
        customer_data: {
          id: customerData?.pk_customer_id,
          name: customerData?.name,
        },
        contact: {
          id: contactsData?.pk_contact_id,
          first_name: contactsData?.first_name,
          last_name: contactsData?.last_name,
        },
        status: statusData,
        order_number: data.order_number,
        order_date: data.order_date,
        delivery_date: data.delivery_date,
        subtotal: data.subtotal,
        tax_total: data.tax_total,
        total_amount: data.total_amount,
        currency: data.currency,
        notes: data.notes,
        terms: data.terms,
        tags: data.tags,
        user_owner: data.user_owner,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get('/customer/:id/kpi')
  async getCustomerOrderKPIs(@Param('id') id: number) {
    return this.ordersService.getCustomerOrderKPIs(id);
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const orderItemsData = await this.ordersService.findOne(id);

    if (!orderItemsData) {
      return null
    }

    const customerData = await this.customersService.findOne(orderItemsData?.fk_customer_id || 1);
    const contactsData = await this.contactsService.findOne(orderItemsData?.fk_customer_id || 1);
    const addressesBillingData = await this.addressesService.findAllByCustomerID(null, orderItemsData?.fk_customer_id || 1, "BILLING");
    const addressesShippingData = await this.addressesService.findAllByCustomerID(null, orderItemsData?.fk_customer_id || 1, "SHIPPING");

    const status_id = (!orderItemsData?.fk_status_id || orderItemsData?.fk_status_id === 0) ? 4 : (orderItemsData?.fk_status_id || 4);
    const statusData = await this.statusService.findOne(status_id);

    const serialEncoderData = await this.serialEncoderService.findOne(orderItemsData?.fk_serial_encoder_id || -1);

    return {
      pk_order_id: orderItemsData?.pk_order_id,
      customer_data: {
        id: customerData?.pk_customer_id,
        name: customerData?.name,
        owner_name: customerData?.owner_name,
      },
      contact: {
        id: contactsData?.pk_contact_id,
        first_name: contactsData?.first_name,
        last_name: contactsData?.last_name,
        email: contactsData?.email,
        phone_number: contactsData?.phone_number,
        mobile_number: contactsData?.mobile_number,
        position_title: contactsData?.position_title
      },
      serial_encoder: {
        id: serialEncoderData?.id,
        serial_order_id: serialEncoderData?.purpose?.order_id || -1,
        serial_quote_id: serialEncoderData?.purpose?.quote_id || -1,
        serial_invoice_ids: serialEncoderData?.purpose?.invoice_ids || [],
        serial_purchase_order_ids: serialEncoderData?.purpose?.purchase_order_ids || [],
      },
      billing_address: addressesBillingData.items,
      shipping_address: addressesShippingData.items,
      status: statusData,
      order_number: orderItemsData?.order_number,
      order_date: orderItemsData?.order_date,
      delivery_date: orderItemsData?.delivery_date,
      subtotal: orderItemsData?.subtotal,
      tax_total: orderItemsData?.tax_total,
      total_amount: orderItemsData?.total_amount,
      currency: orderItemsData?.currency,
      notes: orderItemsData?.notes,
      terms: orderItemsData?.terms,
      tags: orderItemsData?.tags,
      user_owner: orderItemsData?.user_owner,
      created_at: orderItemsData?.created_at,
      updated_at: orderItemsData?.updated_at,
    };
  }

  @Post()
  create(@Body() createOrdersDto: CreateOrdersDto) {
    return this.ordersService.create(createOrdersDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.ordersService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() orders: UpdateOrdersDto,
  ): Promise<OrdersEntity> {
    return this.ordersService.update(id, orders);
  }
}
