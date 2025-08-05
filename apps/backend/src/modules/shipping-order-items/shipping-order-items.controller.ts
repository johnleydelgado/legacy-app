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
import { ShippingOrderItemsService } from './shipping-order-items.service';
import { ShippingOrderItemsEntity } from './shipping-order-items.entity';
import {
  CreateShippingOrderItemsDto,
  UpdateShippingOrderItemsDto,
} from './shipping-order-items.dto';
import { ShippingOrdersService } from '../shipping-orders/shipping-orders.service';
import { ProductsService } from '../products/products.service';
import { TrimsService } from '../trims/trims.service';
import { PackagingService } from '../packaging/packaging.service';
import { YarnsService } from '../yarns/yarns.service';

@Controller({ version: '1', path: 'shipping-order-items' })
export class ShippingOrderItemsController {
  constructor(
    private readonly shippingOrderItemsService: ShippingOrderItemsService,
    private readonly shippingOrdersService: ShippingOrdersService,
    private readonly productsService: ProductsService,
    private readonly trimsService: TrimsService,
    private readonly packagingService: PackagingService,
    private readonly yarnsService: YarnsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all shipping order items',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const shippingOrderItems = await this.shippingOrderItemsService.findAll({
      page,
      limit,
    });
    const meta = shippingOrderItems.meta;

    const normalizeData = await Promise.all(
      shippingOrderItems.items.map(async (data) => {
        const shippingOrderID = data.fk_shipping_order_id;
        const shippingOrderData =
          await this.shippingOrdersService.findOne(shippingOrderID);

        const productsID = data.fk_product_id;
        const productsData = await this.productsService.findOne(productsID);

        const trimsID = data.fk_trim_id;
        const trimsData = await this.trimsService.findOne(trimsID);

        const packagingID = data.fk_packaging_id;
        const packagingData = await this.packagingService.findOne(packagingID);

        const yarnID = data.fk_yarn_id;
        const yarnData = await this.yarnsService.findOne(yarnID);

        return {
          pk_shipping_order_item_id: data.pk_shipping_order_item_id,
          // fk_shipping_package_id removed - now handled via ShippingPackageSpecItems
          shipping_order_data:
            Object.values(shippingOrderData || {}).length === 0
              ? { shipping_order_id: data.fk_shipping_order_id }
              : shippingOrderData,
          product_data:
            Object.values(productsData || {}).length === 0
              ? { product_id: data.fk_product_id }
              : {
                  pk_product_id: productsData?.pk_product_id,
                  fk_category_id: productsData?.fk_category_id,
                  product_name: productsData?.product_name,
                  sku: productsData?.sku,
                  product_price: productsData?.product_price,
                  inventory: productsData?.inventory,
                  style: productsData?.style,
                  status: productsData?.status,
                  image_url: productsData?.image_url,
                  image_urls: productsData?.image_urls,
                  yarn: productsData?.yarn,
                  trims: productsData?.trims,
                  packaging: productsData?.packaging,
                  created_at: productsData?.created_at,
                  updated_at: productsData?.updated_at,
                },
          trims_data:
            Object.values(trimsData || {}).length === 0
              ? { trim_id: data.fk_trim_id }
              : trimsData,
          packaging_data:
            Object.values(packagingData || {}).length === 0
              ? { packaging_id: data.fk_packaging_id }
              : packagingData,
          yarn_data:
            Object.values(yarnData || {}).length === 0
              ? { yarn_id: data.fk_yarn_id }
              : yarnData,
          item_number: data.item_number,
          item_name: data.item_name,
          item_description: data.item_description,
          quantity: data.quantity,
          unit_price: data.unit_price,
          tax_rate: data.tax_rate,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }),
    );

    return { items: normalizeData, meta };
  }

  @Get('shipping-orders/:shippingOrderId/totals')
  async getShippingOrderTotals(
    @Param('shippingOrderId') shippingOrderId: number,
  ) {
    return this.shippingOrderItemsService.getShippingOrderTotals(
      shippingOrderId,
    );
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const shippingOrderItemData =
      await this.shippingOrderItemsService.findOne(id);

    if (!shippingOrderItemData) {
      throw new HttpException(
        'Shipping order item not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const shippingOrderID = shippingOrderItemData.fk_shipping_order_id;
    const shippingOrderData =
      await this.shippingOrdersService.findOne(shippingOrderID);

    const productsID = shippingOrderItemData.fk_product_id || -1;
    const productsData = await this.productsService.findOne(productsID);

    const trimsID = shippingOrderItemData.fk_trim_id || -1;
    const trimsData = await this.trimsService.findOne(trimsID);

    const packagingID = shippingOrderItemData.fk_packaging_id || -1;
    const packagingData = await this.packagingService.findOne(packagingID);

    const yarnID = shippingOrderItemData.fk_yarn_id || -1;
    const yarnData = await this.yarnsService.findOne(yarnID);

    return {
      pk_shipping_order_item_id:
        shippingOrderItemData.pk_shipping_order_item_id,
      // fk_shipping_package_id removed - now handled via ShippingPackageSpecItems
      shipping_order_data:
        Object.values(shippingOrderData || {}).length === 0
          ? { shipping_order_id: shippingOrderItemData.fk_shipping_order_id }
          : shippingOrderData,
      product_data:
        Object.values(productsData || {}).length === 0
          ? { product_id: shippingOrderItemData.fk_product_id }
          : productsData,
      trims_data:
        Object.values(trimsData || {}).length === 0
          ? { trim_id: shippingOrderItemData.fk_trim_id }
          : trimsData,
      packaging_data:
        Object.values(packagingData || {}).length === 0
          ? { packaging_id: shippingOrderItemData.fk_packaging_id }
          : packagingData,
      yarn_data:
        Object.values(yarnData || {}).length === 0
          ? { yarn_id: shippingOrderItemData.fk_yarn_id }
          : yarnData,
      item_number: shippingOrderItemData.item_number,
      item_name: shippingOrderItemData.item_name,
      item_description: shippingOrderItemData.item_description,
      quantity: shippingOrderItemData.quantity,
      unit_price: shippingOrderItemData.unit_price,
      tax_rate: shippingOrderItemData.tax_rate,
      created_at: shippingOrderItemData.created_at,
      updated_at: shippingOrderItemData.updated_at,
    };
  }

  @Post()
  create(@Body() createShippingOrderItemsDto: CreateShippingOrderItemsDto) {
    return this.shippingOrderItemsService.create(createShippingOrderItemsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.shippingOrderItemsService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() shippingOrderItems: UpdateShippingOrderItemsDto,
  ): Promise<ShippingOrderItemsEntity | null> {
    return this.shippingOrderItemsService.update(id, shippingOrderItems);
  }

  @Get('by-shipping-order/:shippingOrderId/all')
  async getAllByShippingOrderId(
    @Param('shippingOrderId') shippingOrderId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ) {
    const shippingOrderItems =
      await this.shippingOrderItemsService.findByShippingOrderId(
        shippingOrderId,
        { page, limit },
      );

    return shippingOrderItems;
  }

  @Delete('shipping-order/:shippingOrderId')
  deleteByShippingOrderId(@Param('shippingOrderId') shippingOrderId: number) {
    return this.shippingOrderItemsService.removeByShippingOrderId(
      shippingOrderId,
    );
  }
}
