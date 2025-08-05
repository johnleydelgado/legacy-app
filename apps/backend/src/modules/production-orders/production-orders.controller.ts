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
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProductionOrdersService } from './production-orders.service';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  SearchProductionOrdersDto,
} from './production-orders.dto';
import { ProductionOrdersEntity } from './production-orders.entity';
import { CustomersService } from '../customers/customers.service';
import { FactoriesService } from '../factories/factories.service';
import { ContactsService } from '../contacts/contacts.service';
import { FkIdTableEnums } from 'src/utils/json_tools';

@Controller({ version: '1', path: 'production-orders' })
export class ProductionOrdersController {
  constructor(
    private readonly productionOrdersService: ProductionOrdersService,
    private customersService: CustomersService,
    private factoriesService: FactoriesService,
    private contactsService: ContactsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all production orders',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const productionOrders = await this.productionOrdersService.findAll({
        page,
        limit,
      });
      const meta = productionOrders.meta;

      const normalizedProductionOrders = await Promise.all(
        productionOrders.items.map(async (productionOrder) => {
          const customer_data = await this.customersService.findOne(
            productionOrder.fk_customer_id,
          );
          const customer_contacts_data =
            await this.contactsService.getContactByFkIdAndTable(
              productionOrder.fk_customer_id,
              FkIdTableEnums.Customer,
              'PRIMARY',
            );

          const factory_data = await this.factoriesService.findOne(
            productionOrder.fk_factory_id,
          );
          const factory_contacts_data =
            await this.contactsService.getContactByFkIdAndTable(
              productionOrder.fk_factory_id,
              FkIdTableEnums.Factories,
              'PRIMARY',
            );

          return {
            pk_production_order_id: productionOrder.pk_production_order_id,
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
            po_number: productionOrder.po_number,
            order_date: productionOrder.order_date,
            expected_delivery_date: productionOrder.expected_delivery_date,
            actual_delivery_date: productionOrder.actual_delivery_date,
            shipping_method: productionOrder.shipping_method,
            status: productionOrder.status,
            total_quantity: productionOrder.total_quantity,
            total_amount: productionOrder.total_amount,
            user_owner: productionOrder.user_owner,
            created_at: productionOrder.created_at,
            updated_at: productionOrder.updated_at,
          };
        }),
      );

      return { items: normalizedProductionOrders, meta };
    } catch (error) {
      console.error('Error in getAll production orders:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch production orders',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  async searchProductionOrders(@Query() searchDto: SearchProductionOrdersDto) {
    try {
      const results =
        await this.productionOrdersService.searchProductionOrders(searchDto);
      return {
        data: results.data,
        meta: results.meta,
        message: 'Production orders search completed successfully',
      };
    } catch (error) {
      console.error('Error in searchProductionOrders:', error);
      throw new HttpException(
        {
          message: 'Failed to search production orders',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const productionOrder = await this.productionOrdersService.findOne(id);

      if (!productionOrder) {
        throw new HttpException(
          'Production order not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const customer_data = await this.customersService.findOne(
        productionOrder.fk_customer_id,
      );
      const customer_contacts_data =
        await this.contactsService.getContactByFkIdAndTable(
          productionOrder.fk_customer_id,
          FkIdTableEnums.Customer,
          'PRIMARY',
        );

      const factory_data = await this.factoriesService.findOne(
        productionOrder.fk_factory_id,
      );
      const factory_contacts_data =
        await this.contactsService.getContactByFkIdAndTable(
          productionOrder.fk_factory_id,
          FkIdTableEnums.Factories,
          'PRIMARY',
        );

      return {
        pk_production_order_id: productionOrder.pk_production_order_id,
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
        po_number: productionOrder.po_number,
        order_date: productionOrder.order_date,
        expected_delivery_date: productionOrder.expected_delivery_date,
        actual_delivery_date: productionOrder.actual_delivery_date,
        shipping_method: productionOrder.shipping_method,
        status: productionOrder.status,
        total_quantity: productionOrder.total_quantity,
        total_amount: productionOrder.total_amount,
        notes: productionOrder.notes,
        user_owner: productionOrder.user_owner,
        created_at: productionOrder.created_at,
        updated_at: productionOrder.updated_at,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch production order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createProductionOrderDto: CreateProductionOrderDto) {
    try {
      return await this.productionOrdersService.create(
        createProductionOrderDto,
      );
    } catch (error) {
      console.log('error:', error);
      throw new HttpException(
        `Failed to create production order: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductionOrderDto: UpdateProductionOrderDto,
  ): Promise<ProductionOrdersEntity> {
    try {
      return await this.productionOrdersService.update(
        id,
        updateProductionOrderDto,
      );
    } catch (error) {
      console.log('error:', error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update production order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.productionOrdersService.remove(id);
      return { message: 'Production order deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete production order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
