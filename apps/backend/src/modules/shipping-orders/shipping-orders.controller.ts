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
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ShippingOrdersService } from './shipping-orders.service';
import { ShippingOrdersEntity } from './shipping-orders.entity';
import {
  CreateShippingOrdersDto,
  UpdateShippingOrdersDto,
} from './shipping-orders.dto';
import { CustomersService } from '../customers/customers.service';
import { ContactsService } from '../contacts/contacts.service';
import { AddressesService } from '../addresses/addresses.service';
import { ShippingOrderItemsService } from '../shipping-order-items/shipping-order-items.service';
import { StatusService } from '../status/status.service';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';

@Controller({ version: '1', path: 'shipping-orders' })
export class ShippingOrdersController {
  constructor(
    private readonly shippingOrdersService: ShippingOrdersService,
    private readonly customersService: CustomersService,
    private readonly contactsService: ContactsService,
    private readonly addressesService: AddressesService,
    private readonly shippingOrderItemsService: ShippingOrderItemsService,
    private readonly statusService: StatusService,
    private readonly serialEncoderService: SerialEncoderService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all shipping orders',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const shippingOrdersList = await this.shippingOrdersService.findAll({
      page,
      limit,
    });
    const dataMeta = shippingOrdersList.meta;

    const normalizeList = await Promise.all(
      shippingOrdersList.items.map(async (data) => {
        const customerID = data.fk_customer_id;
        const customerData = await this.customersService.findOne(customerID);
        const statusData = await this.statusService.findOne(data.fk_status_id);

        const normalizedItem = {
          pk_shipping_order_id: data.pk_shipping_order_id,
          customer: {
            pk_customer_id: customerData?.pk_customer_id,
            name: customerData?.name,
            owner_name: customerData?.owner_name,
          },
          status: {
            id: statusData?.id,
            process: statusData?.process,
            status: statusData?.status,
            color: statusData?.color,
          },
          shipping_order_number: data.shipping_order_number,
          order_date: data.order_date,
          expected_ship_date: data.expected_ship_date,
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

        return normalizedItem;
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
    console.log('Search endpoint hit with term:', searchTerm);

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
      decodedSearchTerm = decodeURIComponent(searchTerm);
      decodedSearchTerm = decodedSearchTerm.replace(/\+/g, ' ');
      decodedSearchTerm = decodedSearchTerm
        .replace(/%20/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (error) {
      decodedSearchTerm = searchTerm.replace(/\+/g, ' ').trim();
    }

    console.log('Decoded search term:', decodedSearchTerm);

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

    const searchFields = fields
      ? fields.split(',').map((f) => f.trim())
      : [
          'shipping_order_number',
          'customer_name',
          'customer_owner_name',
          'carrier',
        ];

    console.log('Search fields:', searchFields);

    try {
      const searchResults =
        await this.shippingOrdersService.searchShippingOrders(
          decodedSearchTerm,
          { page, limit },
          searchFields,
          matchType,
        );

      console.log('Search results found:', searchResults.items.length);

      const normalizeList = await Promise.all(
        searchResults.items.map(async (data: any) => {
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
            pk_shipping_order_id: data.pk_shipping_order_id,
            customer: {
              id: customerData?.pk_customer_id,
              name: customerData?.name,
              owner_name: customerData?.owner_name,
            },
            status: {
              id: statusData?.id,
              process: statusData?.process,
              status: statusData?.status,
              color: statusData?.color,
            },
            shipping_order_number: data.shipping_order_number,
            order_date: data.order_date,
            expected_ship_date: data.expected_ship_date,
            subtotal: data.subtotal,
            tax_total: data.tax_total,
            total_amount: data.total_amount,
            currency: data.currency,
            carrier: data.carrier,
            carrier_description: data.carrier_description,
            service: data.service,
            terms: data.terms,
            tags: data.tags,
            user_owner: data.user_owner,
          };
        }),
      );

      return {
        items: normalizeList,
        meta: searchResults.meta,
        searchTerm: decodedSearchTerm,
        originalSearchTerm: searchTerm,
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

  @Get('dashboard-summary')
  async getDashboardSummary() {
    try {
      const dashboardMetrics =
        await this.shippingOrdersService.getDashboardMetrics();
      const totalShippingOrders = await this.shippingOrdersService.findAll({
        page: 1,
        limit: 1,
      });
      const statusCounts =
        await this.shippingOrdersService.getShippingOrdersStatusCounts();
      const allStatuses =
        await this.shippingOrdersService.getShippingOrdersStatus();

      const processSummary = {
        pending: {
          label: 'PENDING SHIPMENTS',
          count: dashboardMetrics.pendingShipmentCount,
          description: 'Pending shipping orders',
        },
      };

      return {
        summary: {
          totalShipments: {
            label: 'TOTAL SHIPMENTS',
            count: dashboardMetrics.totalShipments,
            description: 'Total number of shipping orders',
          },
          pendingShipments: {
            label: 'PENDING SHIPMENTS',
            count: dashboardMetrics.pendingShipmentCount,
            description: 'Pending shipping orders',
          },
        },
        totalShippingOrders,
        processSummary: Object.values(processSummary),
        detailedCounts: statusCounts,
        availableStatuses: allStatuses,
        lastUpdated: new Date().toISOString(),
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
      const shippingOrdersList =
        await this.shippingOrdersService.findByCustomerId(customerId, {
          page,
          limit,
        });
      const dataMeta = shippingOrdersList.meta;

      const normalizeList = await Promise.all(
        shippingOrdersList.items.map(async (data) => {
          const customerData = await this.customersService.findOne(
            data.fk_customer_id,
          );
          const statusData = await this.statusService.findOne(
            data.fk_status_id,
          );

          const shippingOrderItems =
            await this.shippingOrderItemsService.findByShippingOrderId(
              data.pk_shipping_order_id,
              { page: 1, limit: 100 },
            );

          return {
            pk_shipping_order_id: data.pk_shipping_order_id,
            customer: {
              id: customerData?.pk_customer_id,
              name: customerData?.name,
              owner_name: customerData?.owner_name,
            },
            shipping_order_number: data.shipping_order_number,
            order_date: data.order_date,
            expected_ship_date: data.expected_ship_date,
            status: {
              id: statusData?.id,
              process: statusData?.process,
              status: statusData?.status,
              color: statusData?.color,
            },
            subtotal: data.subtotal,
            tax_total: data.tax_total,
            total_amount: data.total_amount,
            currency: data.currency,
            terms: data.terms,
            tags: data.tags,
            user_owner: data.user_owner,
            created_at: data.created_at,
            updated_at: data.updated_at,
            shipping_order_items: shippingOrderItems.items.map((item) => ({
              pk_shipping_order_item_id: item.pk_shipping_order_item_id,
              fk_product_id: item.fk_product_id,
              fk_packaging_id: item.fk_packaging_id,
              fk_trim_id: item.fk_trim_id,
              fk_yarn_id: item.fk_yarn_id,
              item_number: item.item_number,
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
      console.error('Error fetching shipping orders by customer ID:', error);
      throw new HttpException(
        'Failed to fetch shipping orders by customer ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    try {
      const shippingOrderData = await this.shippingOrdersService.findOne(id);
      if (!shippingOrderData) {
        throw new HttpException(
          'Shipping order not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const customerID = shippingOrderData.fk_customer_id;

      const customerData = await this.customersService.findOne(customerID);

      const statusData = await this.statusService.findOne(
        shippingOrderData.fk_status_id,
      );

      const contactPrimaryData =
        await this.contactsService.getContactByCustomerIDType(customerID);

      const billingAddressData =
        await this.addressesService.findAllByCustomerID(
          { page: 1, limit: 10 },
          customerID,
          'BILLING',
        );

      const shippingAddressData =
        await this.addressesService.findAllByCustomerID(
          { page: 1, limit: 5 },
          customerID,
          'SHIPPING',
        );

      const serialEncoderData = await this.serialEncoderService.findOne(
        shippingOrderData.fk_serial_encoder_id || -1,
      );

      return {
        pk_shipping_order_id: shippingOrderData.pk_shipping_order_id,
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
          addresses: [
            ...billingAddressData.items,
            ...shippingAddressData.items,
          ],
        },
        status: {
          id: statusData?.id,
          process: statusData?.process,
          status: statusData?.status,
          color: statusData?.color,
        },
        serial_encoder: {
          id: serialEncoderData?.id,
          serial_shipping_order_id:
            serialEncoderData?.purpose?.shipping_order_id || -1,
          serial_order_id: serialEncoderData?.purpose?.order_id || -1,
          serial_invoice_ids: serialEncoderData?.purpose?.invoice_ids || [],
        },
        shipping_order_number: shippingOrderData.shipping_order_number,
        order_date: shippingOrderData.order_date,
        expected_ship_date: shippingOrderData.expected_ship_date,
        subtotal: shippingOrderData.subtotal,
        tax_total: shippingOrderData.tax_total,
        total_amount: shippingOrderData.total_amount,
        currency: shippingOrderData.currency,
        // Package dimensions removed - now handled via ShippingPackageSpecifications
        insurance_value: shippingOrderData.insurance_value,
        notes: shippingOrderData.notes,
        terms: shippingOrderData.terms,
        tags: shippingOrderData.tags,
        user_owner: shippingOrderData.user_owner,
        created_at: shippingOrderData.created_at,
        updated_at: shippingOrderData.updated_at,
      };
    } catch (error) {
      console.error('Error in shipping orders controller GET :id:', error);
      throw new HttpException(
        `Failed to fetch shipping order: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  create(@Body() createShippingOrdersDto: CreateShippingOrdersDto) {
    return this.shippingOrdersService.create(createShippingOrdersDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.shippingOrdersService.remove(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() shippingOrders: UpdateShippingOrdersDto,
  ) {
    return this.shippingOrdersService.update(id, shippingOrders);
  }
}
