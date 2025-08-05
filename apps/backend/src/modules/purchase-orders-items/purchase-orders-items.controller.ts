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
import { PurchaseOrdersItemsService } from './purchase-orders-items.service';
import { CreatePurchaseOrdersItemsDto, UpdatePurchaseOrdersItemsDto } from './purchase-orders-items.dto';
import { PurchaseOrdersItemsEntity } from './purchase-orders-items.entity';
import { ProductsService } from '../products/products.service';


@Controller({ version: '1', path: 'purchase-orders-items' })
export class PurchaseOrdersItemsController {
  constructor(
    private readonly purchaseOrdersItemsService: PurchaseOrdersItemsService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all purchase orders items"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const purchaseOrdersItems = await this.purchaseOrdersItemsService.findAll({ page, limit });

      const normalizedPurchaseOrdersItems = await Promise.all(purchaseOrdersItems.items.map(async (purchaseOrderItem) => {
        const product = await this.productsService.findOne(purchaseOrderItem.fk_product_id);

        return {
          pk_purchase_order_item_id: purchaseOrderItem.pk_purchase_order_item_id,
          fk_purchase_order_id: purchaseOrderItem.fk_purchase_order_id,
          product: {
            id: product?.pk_product_id,
            category: {
              id: product?.product_category?.pk_product_category_id,
              name: product?.product_category?.category_name,
            }
          },
          item_number: purchaseOrderItem.item_number,
          item_sku: purchaseOrderItem.item_sku,
          item_name: purchaseOrderItem.item_name,
          item_description: purchaseOrderItem.item_description,
          item_specifications: purchaseOrderItem.item_specifications,
          item_notes: purchaseOrderItem.item_notes,
          packaging_instructions: purchaseOrderItem.packaging_instructions,
          quantity: purchaseOrderItem.quantity,
          unit_price: purchaseOrderItem.unit_price,
          rate: purchaseOrderItem.rate,
          line_total: purchaseOrderItem.line_total,
          currency: purchaseOrderItem.currency,
          created_at: purchaseOrderItem.created_at,
          updated_at: purchaseOrderItem.updated_at,
        }
      }));

      return {
        items: normalizedPurchaseOrdersItems,
        meta: purchaseOrdersItems.meta,
      }
    } catch (error) {
      console.error('Error in getAll purchase orders items:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch purchase orders items',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('purchase-order/:purchaseOrderId')
  async getByPurchaseOrderId(@Param('purchaseOrderId') purchaseOrderId: number, @Query('page') page = 1, @Query('limit') limit = 10) {
    const purchaseOrdersItems = await this.purchaseOrdersItemsService.findByPurchaseOrderId(purchaseOrderId, { page, limit });
  
    const normalizedPurchaseOrdersItems = await Promise.all(purchaseOrdersItems.items.map(async (purchaseOrderItem) => {
      const product = await this.productsService.findOne(purchaseOrderItem.fk_product_id);

      return {
        pk_purchase_order_item_id: purchaseOrderItem.pk_purchase_order_item_id,
        fk_purchase_order_id: purchaseOrderItem.fk_purchase_order_id,
        product: {
          id: product?.pk_product_id,
          category: {
            id: product?.product_category?.pk_product_category_id,
            name: product?.product_category?.category_name,
          }
        },
        item_number: purchaseOrderItem.item_number,
        item_sku: purchaseOrderItem.item_sku,
        item_name: purchaseOrderItem.item_name,
        item_description: purchaseOrderItem.item_description,
        item_specifications: purchaseOrderItem.item_specifications,
        item_notes: purchaseOrderItem.item_notes,
        packaging_instructions: purchaseOrderItem.packaging_instructions,
        quantity: purchaseOrderItem.quantity,
        unit_price: purchaseOrderItem.unit_price,
        rate: purchaseOrderItem.rate,
        line_total: purchaseOrderItem.line_total,
        currency: purchaseOrderItem.currency,
        created_at: purchaseOrderItem.created_at,
        updated_at: purchaseOrderItem.updated_at,
      }
    }));

    return {
      items: normalizedPurchaseOrdersItems,
      meta: purchaseOrdersItems.meta,
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const purchaseOrderItem = await this.purchaseOrdersItemsService.findOne(id);

      if (!purchaseOrderItem) {
        throw new HttpException('Purchase order item not found', HttpStatus.NOT_FOUND);
      }

      const product = await this.productsService.findOne(purchaseOrderItem.fk_product_id);

      return {
        pk_purchase_order_item_id: purchaseOrderItem.pk_purchase_order_item_id,
        fk_purchase_order_id: purchaseOrderItem.fk_purchase_order_id,
        product: {
          id: product?.pk_product_id,
          category: {
            id: product?.product_category?.pk_product_category_id,
            name: product?.product_category?.category_name,
          }
        },
        item_number: purchaseOrderItem.item_number,
        item_sku: purchaseOrderItem.item_sku,
        item_name: purchaseOrderItem.item_name,
        item_description: purchaseOrderItem.item_description,
        item_specifications: purchaseOrderItem.item_specifications,
        item_notes: purchaseOrderItem.item_notes,
        packaging_instructions: purchaseOrderItem.packaging_instructions,
        quantity: purchaseOrderItem.quantity,
        unit_price: purchaseOrderItem.unit_price,
        rate: purchaseOrderItem.rate,
        line_total: purchaseOrderItem.line_total,
        currency: purchaseOrderItem.currency,
        created_at: purchaseOrderItem.created_at,
        updated_at: purchaseOrderItem.updated_at,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch purchase order item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createPurchaseOrdersItemsDto: CreatePurchaseOrdersItemsDto) {
    try {
      return await this.purchaseOrdersItemsService.create(createPurchaseOrdersItemsDto);
    } catch (error) {
      console.log("error:", error);
      throw new HttpException(
        `Failed to create purchase order item got ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePurchaseOrdersItemsDto: UpdatePurchaseOrdersItemsDto,
  ): Promise<PurchaseOrdersItemsEntity> {
    try {
      return await this.purchaseOrdersItemsService.update(id, updatePurchaseOrdersItemsDto);
    } catch (error) {
      console.log("error:", error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update purchase order item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.purchaseOrdersItemsService.remove(id);
      return { message: 'Purchase order item deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete purchase order item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
