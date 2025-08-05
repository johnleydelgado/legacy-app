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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderItemsService } from './order-items.service';
import { OrderItemsEntity } from './order-items.entity';
import { CreateOrderItemsDTO, UpdateOrderItemsDTO } from './order-items.dto';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { ProductsCategoryService } from '../products-category/products-category.service';
import { AddressesService } from '../addresses/addresses.service';
import { PackagingService } from '../packaging/packaging.service';
import { TrimsService } from '../trims/trims.service';
import { YarnsService } from '../yarns/yarns.service';


@Controller({ version: '1', path: 'order-items' })
export class OrderItemsController{
  constructor(
    private readonly orderItemsService: OrderItemsService,
    private readonly orderService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly productsCategoryService: ProductsCategoryService,
    private readonly addressesService: AddressesService,
    private readonly packagingService: PackagingService,
    private readonly trimsService: TrimsService,
    private readonly yarnsService: YarnsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all order items"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    const orderItemsData = await this.orderItemsService.findAll({ page, limit });
    const meta = orderItemsData.meta;

    const normalizeData = await Promise.all(orderItemsData.items.map(async (data, index) => {
      const ordersData = await this.orderService.findOne(data.fk_order_id);
      const productsData = await this.productsService.findOne(data.fk_product_id);
      const productsCategoryData = await this.productsCategoryService.findOne(productsData?.fk_category_id || 1);
      const addressesData = await this.addressesService.findOne(data.fk_shipping_address_id);
      const packagingData = await this.packagingService.findOne(data.fk_packaging_id);
      const trimsData = await this.trimsService.findOne(data.fk_trim_id);
      const yarnsData = await this.yarnsService.findOne(data.fk_yarn_id);

      return {
        pk_order_item_id: data.pk_order_item_id,
        orders_data: {
          id: ordersData?.pk_order_id || data.fk_order_id,
          order_number: ordersData?.order_number || -1,
          total_amount: ordersData?.total_amount || -1,
        },
        products_data: {
          id: productsData?.pk_product_id || data.fk_product_id,
          style: productsData?.style || "",
          product_name: productsData?.product_name || "",
          product_price: productsData?.product_price || -1,
        },
        products_category_data: {
          id: productsCategoryData?.pk_product_category_id || -1,
          name: productsCategoryData?.category_name || "",
        },
        address_data: {
          id: addressesData?.pk_address_id || data.fk_shipping_address_id,
          address1: addressesData?.address1 || "",
          city: addressesData?.city || "",
          state: addressesData?.state || "",
          zip: addressesData?.zip || "",
          country: addressesData?.country || "",
          address_type: addressesData?.address_type || "",
        },
        packaging_data: {
          id: packagingData?.pk_packaging_id || data.fk_packaging_id,
          packaging: packagingData?.packaging || "",
        },
        trim_data: {
          id: trimsData?.pk_trim_id || -1,
          trim: trimsData?.trim || "",
        },
        yarn_data: {
          id: yarnsData?.pk_yarn_id || -1,
          yarn_color: yarnsData?.yarn_color || "",
          yarn_type: yarnsData?.yarn_type || "",
        },
        item_number: data.item_number,
        item_name: data.item_name,
        item_description: data.item_description,
        artwork_url: data.artwork_url,
        quantity: data.quantity,
        unit_price: data.unit_price,
        tax_rate: data.tax_rate,
        line_total: data.line_total,
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get('/orders/:orderID')
  async getAllByOrderID(
    @Param('orderID') orderID: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const orderItemsData = await this.orderItemsService.findByOrderId(orderID, { page, limit });
    const meta = orderItemsData.meta;

    const normalizeData = await Promise.all(orderItemsData.items.map(async (data) => {
      const ordersData = await this.orderService.findOne(data.fk_order_id);
      const productsData = await this.productsService.findOne(data.fk_product_id);
      const productsCategoryData = await this.productsCategoryService.findOne(productsData?.fk_category_id || 1);
      const addressesData = await this.addressesService.findOne(data.fk_shipping_address_id);
      const packagingData = await this.packagingService.findOne(data.fk_packaging_id);
      const trimsData = await this.trimsService.findOne(data.fk_trim_id);
      const yarnsData = await this.yarnsService.findOne(data.fk_yarn_id);

      return {
        pk_order_item_id: data.pk_order_item_id,
        orders_data: {
          id: ordersData?.pk_order_id || data.fk_order_id,
          order_number: ordersData?.order_number || -1,
          total_amount: ordersData?.total_amount || -1,
        },
        products_data: {
          id: productsData?.pk_product_id || data.fk_product_id,
          style: productsData?.style || "",
          product_name: productsData?.product_name || "",
          product_price: productsData?.product_price || -1,
          product_sku: productsData?.sku || "",
        },
        products_category_data: {
          id: productsCategoryData?.pk_product_category_id || -1,
          name: productsCategoryData?.category_name || "",
        },
        address_data: {
          id: addressesData?.pk_address_id || data.fk_shipping_address_id,
          address1: addressesData?.address1 || "",
          city: addressesData?.city || "",
          state: addressesData?.state || "",
          zip: addressesData?.zip || "",
          country: addressesData?.country || "",
          address_type: addressesData?.address_type || "",
        },
        packaging_data: {
          id: packagingData?.pk_packaging_id || data.fk_packaging_id,
          packaging: packagingData?.packaging || "",
        },
        trim_data: {
          id: trimsData?.pk_trim_id || -1,
          trim: trimsData?.trim || "",
        },
        yarn_data: {
          id: yarnsData?.pk_yarn_id || -1,
          yarn_color: yarnsData?.yarn_color || "",
          yarn_type: yarnsData?.yarn_type || "",
        },
        item_number: data.item_number,
        item_name: data.item_name,
        item_description: data.item_description,
        artwork_url: data.artwork_url,
        quantity: data.quantity,
        unit_price: data.unit_price,
        tax_rate: data.tax_rate,
        line_total: data.line_total,
      }
    }));

    return {
      items: normalizeData,
      meta
    }
  }

  @Get('/orders/:orderID/totals')
  async getOrderItemsWithTotals(
    @Param('orderID') orderID: number
  ) {
    const data = await this.orderItemsService.getOrderTotals(orderID);

    return {
      totalQuantity: parseInt(data.totalQuantity, 10),
      totalUnitPrice: parseFloat(data.totalUnitPrice),
      totalTaxRate: parseFloat(data.totalTaxRate),
      totalLineTotal: parseFloat(data.totalLineTotal)
    };
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const orderItemsData = await this.orderItemsService.findOne(id);

    const ordersData = await this.orderService.findOne(orderItemsData?.fk_order_id || 1);
    const productsData = await this.productsService.findOne(orderItemsData?.fk_product_id || 1);
    const productsCategoryData = await this.productsCategoryService.findOne(productsData?.fk_category_id || 1);
    const addressesData = await this.addressesService.findOne(orderItemsData?.fk_shipping_address_id || 1);
    const packagingData = await this.packagingService.findOne(orderItemsData?.fk_packaging_id || 1);
    const trimsData = await this.trimsService.findOne(orderItemsData?.fk_trim_id || 1);
    const yarnsData = await this.yarnsService.findOne(orderItemsData?.fk_yarn_id || 1);

    if (!orderItemsData) {
      return null
    }

    return {
      pk_order_item_id: orderItemsData.pk_order_item_id,
      orders_data: {
        id: ordersData?.pk_order_id || orderItemsData.fk_order_id,
        order_number: ordersData?.order_number || -1,
        total_amount: ordersData?.total_amount || -1,
      },
      products_data: {
        id: productsData?.pk_product_id || orderItemsData.fk_product_id,
        style: productsData?.style || "",
        product_name: productsData?.product_name || "",
        product_price: productsData?.product_price || -1,
      },
      products_category_data: {
        id: productsCategoryData?.pk_product_category_id || -1,
        name: productsCategoryData?.category_name || "",
      },
      address_data: {
        id: addressesData?.pk_address_id || orderItemsData.fk_shipping_address_id,
        address1: addressesData?.address1 || "",
        city: addressesData?.city || "",
        state: addressesData?.state || "",
        zip: addressesData?.zip || "",
        country: addressesData?.country || "",
        address_type: addressesData?.address_type || "",
      },
      packaging_data: {
        id: packagingData?.pk_packaging_id || orderItemsData.fk_packaging_id,
        packaging: packagingData?.packaging || "",
      },
      trim_data: {
        id: trimsData?.pk_trim_id || -1,
        trim: trimsData?.trim || "",
      },
      yarn_data: {
        id: yarnsData?.pk_yarn_id || -1,
        yarn_color: yarnsData?.yarn_color || "",
        yarn_type: yarnsData?.yarn_type || "",
      },
      item_number: orderItemsData.item_number,
      item_name: orderItemsData.item_name,
      item_description: orderItemsData.item_description,
      artwork_url: orderItemsData.artwork_url,
      quantity: orderItemsData.quantity,
      unit_price: orderItemsData.unit_price,
      tax_rate: orderItemsData.tax_rate,
      line_total: orderItemsData.line_total,
    };
  }

  @Post()
  create(@Body() createOrderItemsDTO: CreateOrderItemsDTO) {
    return this.orderItemsService.create(createOrderItemsDTO);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.orderItemsService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() orderItems: UpdateOrderItemsDTO): Promise<OrderItemsEntity> {
    return this.orderItemsService.update(id, orderItems);
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
