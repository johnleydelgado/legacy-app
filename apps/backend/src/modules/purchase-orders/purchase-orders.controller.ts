import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus, Req, Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderKpiDto, SearchPurchaseOrdersDto } from './purchase-orders.dto';
import { PurchaseOrdersEntity } from './purchase-orders.entity';
import { VendorsService } from '../vendors/vendors.service';
import { StatusService } from '../status/status.service';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';
import { FactoriesService } from '../factories/factories.service';
import { CustomersService } from '../customers/customers.service';
import { FkIdTableEnums } from 'src/utils/json_tools';
import { PurchaseOrdersLeadNumbersService } from '../purchase-orders-lead-numbers/purchase-orders-lead-numbers.services';
import { PurchaseOrdersShippingMethodsService } from '../purchase-orders-shipping-methods/purchase-orders-shipping-methods.services';
import { LocationTypesService } from '../location-types/location-types.service';
import { ContactsService } from '../contacts/contacts.service';


@Controller({ version: '1', path: 'purchase-orders' })
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private customersService: CustomersService,
    private contactsService: ContactsService,
    private vendorsService: VendorsService,
    private factoriesService: FactoriesService,
    private locationTypesService: LocationTypesService,
    private statusService: StatusService,
    private serialEncoderService: SerialEncoderService,
    private purchaseOrdersLeadNumbersService: PurchaseOrdersLeadNumbersService,
    private purchaseOrdersShippingMethodsService: PurchaseOrdersShippingMethodsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all purchase orders"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const purchaseOrders = await this.purchaseOrdersService.findAll({ page, limit });
      const meta = purchaseOrders.meta;

      const normalizedPurchaseOrders = await Promise.all(purchaseOrders.items.map(async (purchaseOrder) => {
        const customer_data = await this.customersService.findOne(purchaseOrder.fk_customer_id);
        const customer_contacts_data = await this.contactsService.getContactByFkIdAndTable(purchaseOrder.fk_customer_id, FkIdTableEnums.Customer, 'PRIMARY');

        const vendor_data = await this.vendorsService.findOne(purchaseOrder.fk_vendor_id);
        const vendor_contacts_data = await this.contactsService.getContactByFkIdAndTable(purchaseOrder.fk_vendor_id, FkIdTableEnums.Vendor, 'PRIMARY');
        
        const factory_data = await this.factoriesService.findOne(purchaseOrder.fk_factory_id);
        const factory_contacts_data = await this.contactsService.getContactByFkIdAndTable(purchaseOrder.fk_factory_id, FkIdTableEnums.Factories, 'PRIMARY');

        const location_type_data = await this.locationTypesService.findOne(purchaseOrder.fk_location_type_id);
        const status_data = await this.statusService.findOne(purchaseOrder.status);

        return {
          pk_purchase_order_id: purchaseOrder.pk_purchase_order_id,
          customer: {
            id: customer_data?.pk_customer_id,
            name: customer_data?.name,
            contacts: {
              id: customer_contacts_data?.pk_contact_id,
              name: customer_contacts_data?.first_name,
              last_name: customer_contacts_data?.last_name,
              email: customer_contacts_data?.email,
              phone: customer_contacts_data?.phone_number,
              mobile: customer_contacts_data?.mobile_number,
              position: customer_contacts_data?.position_title,
            },
          },
          vendor: {
            id: vendor_data?.pk_vendor_id,
            name: vendor_data?.name,
            contacts: {
              id: vendor_contacts_data?.pk_contact_id,
              name: vendor_contacts_data?.first_name,
              last_name: vendor_contacts_data?.last_name,
              email: vendor_contacts_data?.email,
              phone: vendor_contacts_data?.phone_number,
              mobile: vendor_contacts_data?.mobile_number,
              position: vendor_contacts_data?.position_title,
            },
          },
          factory: {
            id: factory_data?.pk_factories_id,
            name: factory_data?.name,
            contacts: {
              id: factory_contacts_data?.pk_contact_id,
              name: factory_contacts_data?.first_name,
              last_name: factory_contacts_data?.last_name,
              email: factory_contacts_data?.email,
              phone: factory_contacts_data?.phone_number,
              mobile: factory_contacts_data?.mobile_number,
              position: factory_contacts_data?.position_title,
            },
          },
          location_type: {
            id: location_type_data?.pk_location_type_id,
            name: location_type_data?.name,
            color: location_type_data?.color,
          },
          purchase_order_number: purchaseOrder.purchase_order_number,
          status: {
            id: status_data?.id,
            platform: status_data?.platform,
            process: status_data?.process,
            status: status_data?.status,
            color: status_data?.color,
          },
          priority: purchaseOrder.priority,
          client_name: purchaseOrder.client_name,
          quote_approved_date: purchaseOrder.quote_approved_date,
          pd_signed_date: purchaseOrder.pd_signed_date,
          shipping_date: purchaseOrder.shipping_date,
          total_quantity: purchaseOrder.total_quantity,
          user_owner: purchaseOrder.user_owner,
          created_at: purchaseOrder.created_at,
          updated_at: purchaseOrder.updated_at,
        };
      }));

      return { items: normalizedPurchaseOrders, meta };
    } catch (error) {
      console.error('Error in getAll vendors:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch vendors',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  async searchPurchaseOrders(@Query() searchDto: SearchPurchaseOrdersDto) {
    try {
      const results = await this.purchaseOrdersService.searchPurchaseOrders(searchDto);
      return {
        data: results.items,
        meta: results.meta,
        message: 'Purchase orders search completed successfully'
      };
    } catch (error) {
      console.error('Error in searchPurchaseOrders:', error);
      throw new HttpException(
        {
          message: 'Failed to search purchase orders',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const purchaseOrder = await this.purchaseOrdersService.findOne(id);

      if (!purchaseOrder) {
        throw new HttpException('Purchase order not found', HttpStatus.NOT_FOUND);
      }

      const serial_encoder_data = await this.serialEncoderService.findOne(purchaseOrder.fk_serial_encoder_id);
      
      const customer_data = await this.customersService.findOne(purchaseOrder.fk_customer_id);
      const customer_contacts_data = await this.contactsService.getContactByFkIdAndTable(purchaseOrder.fk_customer_id, FkIdTableEnums.Customer, 'PRIMARY');

      const vendor_data = await this.vendorsService.findOne(purchaseOrder.fk_vendor_id);
      const vendor_contacts_data = await this.contactsService.getContactByFkIdAndTable(purchaseOrder.fk_vendor_id, FkIdTableEnums.Vendor, 'PRIMARY');
        
      const factory_data = await this.factoriesService.findOne(purchaseOrder.fk_factory_id);
      const factory_contacts_data = await this.contactsService.getContactByFkIdAndTable(purchaseOrder.fk_factory_id, FkIdTableEnums.Factories, 'PRIMARY');

      const location_type_data = await this.locationTypesService.findOne(purchaseOrder.fk_location_type_id);
      const lead_number_data = await this.purchaseOrdersLeadNumbersService.findOne(purchaseOrder.fk_lead_numbers_id);
      const shipping_method_data = await this.purchaseOrdersShippingMethodsService.findOne(purchaseOrder.fk_shipping_method_id);
      const status_data = await this.statusService.findOne(purchaseOrder.status);

      return {
        pk_purchase_order_id: purchaseOrder.pk_purchase_order_id,
        serial_encoder: {
          id: serial_encoder_data?.id,
          ...serial_encoder_data?.purpose
        },
        customer: {
          id: customer_data?.pk_customer_id,
          name: customer_data?.name,
          contacts: {
            id: customer_contacts_data?.pk_contact_id,
            name: customer_contacts_data?.first_name,
            last_name: customer_contacts_data?.last_name,
            email: customer_contacts_data?.email,
            phone: customer_contacts_data?.phone_number,
            mobile: customer_contacts_data?.mobile_number,
            position: customer_contacts_data?.position_title,
          },
        },
        vendor: {
          id: vendor_data?.pk_vendor_id,
          name: vendor_data?.name,
          contacts: {
            id: vendor_contacts_data?.pk_contact_id,
            name: vendor_contacts_data?.first_name,
            last_name: vendor_contacts_data?.last_name,
            email: vendor_contacts_data?.email,
            phone: vendor_contacts_data?.phone_number,
            mobile: vendor_contacts_data?.mobile_number,
            position: vendor_contacts_data?.position_title,
          },
        },
        factory: {
          id: factory_data?.pk_factories_id,
          name: factory_data?.name,
          contacts: {
            id: factory_contacts_data?.pk_contact_id,
            name: factory_contacts_data?.first_name,
            last_name: factory_contacts_data?.last_name,
            email: factory_contacts_data?.email,
            phone: factory_contacts_data?.phone_number,
            mobile: factory_contacts_data?.mobile_number,
            position: factory_contacts_data?.position_title,
          },
        },
        location_type: {
          id: location_type_data?.pk_location_type_id,
          name: location_type_data?.name,
          color: location_type_data?.color,
        },
        lead_number: {
          id: lead_number_data?.pk_po_lead_number_id,
          name: lead_number_data?.name,
          color: lead_number_data?.color,
        },
        shipping_method: {  
          id: shipping_method_data?.pk_po_shipping_method_id,
          name: shipping_method_data?.name,
          color: shipping_method_data?.color,
        },
        purchase_order_number: purchaseOrder.purchase_order_number,
        status: {
          id: status_data?.id,
          platform: status_data?.platform,
          process: status_data?.process,
          status: status_data?.status,
          color: status_data?.color,
        },
        priority: purchaseOrder.priority,
        client_name: purchaseOrder.client_name,
        client_description: purchaseOrder.client_description,
        quote_approved_date: purchaseOrder.quote_approved_date,
        pd_signed_date: purchaseOrder.pd_signed_date,
        shipping_date: purchaseOrder.shipping_date,
        total_quantity: purchaseOrder.total_quantity,
        notes: purchaseOrder.notes,
        tags: purchaseOrder.tags,
        user_owner: purchaseOrder.user_owner,
        created_at: purchaseOrder.created_at,
        updated_at: purchaseOrder.updated_at,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch purchase order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    try {
      return await this.purchaseOrdersService.create(createPurchaseOrderDto);
    } catch (error) {
      console.log("error:", error);
      throw new HttpException(
        `Failed to create purchase order got ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrdersEntity> {
    try {
      return await this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
    } catch (error) {
      console.log("error:", error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update purchase order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.purchaseOrdersService.remove(id);
      return { message: 'Purchase order deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete purchase order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpi/overall')
  async getOverallKpi(@Query() filters: PurchaseOrderKpiDto) {
    try {
      const kpi = await this.purchaseOrdersService.getOverallKpi(filters);
      return {
        data: kpi,
        message: 'Overall KPI data retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getOverallKpi:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch overall KPI data',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpi/status-breakdown')
  async getStatusBreakdown(@Query() filters: PurchaseOrderKpiDto) {
    try {
      const breakdown = await this.purchaseOrdersService.getStatusBreakdown(filters);
      return {
        data: breakdown,
        message: 'Status breakdown retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getStatusBreakdown:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch status breakdown',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpi/priority-breakdown')
  async getPriorityBreakdown(@Query() filters: PurchaseOrderKpiDto) {
    try {
      const breakdown = await this.purchaseOrdersService.getPriorityBreakdown(filters);
      return {
        data: breakdown,
        message: 'Priority breakdown retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getPriorityBreakdown:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch priority breakdown',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpi/monthly-trends')
  async getMonthlyTrends(@Query() filters: PurchaseOrderKpiDto) {
    try {
      const trends = await this.purchaseOrdersService.getMonthlyTrends(filters);
      return {
        data: trends,
        message: 'Monthly trends retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getMonthlyTrends:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch monthly trends',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpi/top-customers')
  async getTopCustomers(@Query() filters: PurchaseOrderKpiDto, @Query('limit') limit = 10) {
    try {
      const topCustomers = await this.purchaseOrdersService.getTopCustomers(limit, filters);
      return {
        data: topCustomers,
        message: 'Top customers retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getTopCustomers:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch top customers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpi/top-vendors')
  async getTopVendors(@Query() filters: PurchaseOrderKpiDto, @Query('limit') limit = 10) {
    try {
      const topVendors = await this.purchaseOrdersService.getTopVendors(limit, filters);
      return {
        data: topVendors,
        message: 'Top vendors retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getTopVendors:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch top vendors',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpi/top-factories')
  async getTopFactories(@Query() filters: PurchaseOrderKpiDto, @Query('limit') limit = 10) {
    try {
      const topFactories = await this.purchaseOrdersService.getTopFactories(limit, filters);
      return {
        data: topFactories,
        message: 'Top factories retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getTopFactories:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch top factories',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpi/comprehensive')
  async getComprehensiveKpi(@Query() filters: PurchaseOrderKpiDto) {
    try {
      const kpi = await this.purchaseOrdersService.getComprehensiveKpi(filters);
      return {
        data: kpi,
        message: 'Comprehensive KPI data retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getComprehensiveKpi:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch comprehensive KPI data',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
