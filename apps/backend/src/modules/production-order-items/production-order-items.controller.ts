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
import { ProductionOrderItemsService } from './production-order-items.service';
import {
  CreateProductionOrderItemDto,
  UpdateProductionOrderItemDto,
  SearchProductionOrderItemsDto,
} from './production-order-items.dto';
import { ProductionOrderItemsEntity } from './production-order-items.entity';
import { ProductsService } from '../products/products.service';

@Controller({ version: '1', path: 'production-order-items' })
export class ProductionOrderItemsController {
  constructor(
    private readonly productionOrderItemsService: ProductionOrderItemsService,
    private productsService: ProductsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all production order items',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const productionOrderItems =
        await this.productionOrderItemsService.findAll({ page, limit });
      const meta = productionOrderItems.meta;

      const normalizedProductionOrderItems = await Promise.all(
        productionOrderItems.items.map(async (item) => {
          const product_data = await this.productsService.findOne(
            item.fk_product_id,
          );

          return {
            pk_production_order_item_id: item.pk_production_order_item_id,
            fk_production_order_id: item.fk_production_order_id,
            product: {
              id: product_data?.pk_product_id,
              name: product_data?.product_name,
              sku: product_data?.sku,
            },
            fk_category_id: item.fk_category_id,
            item_name: item.item_name,
            item_description: item.item_description,
            item_number: item.item_number,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
            tax_rate: item.tax_rate,
            created_at: item.created_at,
            updated_at: item.updated_at,
            knitcolors_production_order: item.knitcolors_production_order || [],
            body_production_order_color: item.body_production_order_color || [],
            packaging_production_order: item.packaging_production_order || [],
          };
        }),
      );

      return { items: normalizedProductionOrderItems, meta };
    } catch (error) {
      console.error('Error in getAll production order items:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch production order items',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('production-order/:orderId')
  async getByProductionOrderId(
    @Param('orderId') orderId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      const productionOrderItems =
        await this.productionOrderItemsService.findAllByProductionOrderId(
          orderId,
          { page, limit },
        );
      const meta = productionOrderItems.meta;

      const normalizedProductionOrderItems = await Promise.all(
        productionOrderItems.items.map(async (item) => {
          const product_data = await this.productsService.findOne(
            item.fk_product_id,
          );

          return {
            pk_production_order_item_id: item.pk_production_order_item_id,
            fk_production_order_id: item.fk_production_order_id,
            product: {
              id: product_data?.pk_product_id,
              name: product_data?.product_name,
              sku: product_data?.sku,
            },
            fk_category_id: item.fk_category_id,
            item_name: item.item_name,
            item_description: item.item_description,
            item_number: item.item_number,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
            tax_rate: item.tax_rate,
            created_at: item.created_at,
            updated_at: item.updated_at,
            knitcolors_production_order: item.knitcolors_production_order || [],
            body_production_order_color: item.body_production_order_color || [],
            packaging_production_order: item.packaging_production_order || [],
          };
        }),
      );

      return { items: normalizedProductionOrderItems, meta };
    } catch (error) {
      console.error('Error in getByProductionOrderId:', error);
      throw new HttpException(
        {
          message:
            'Failed to fetch production order items by production order ID',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  async searchProductionOrderItems(
    @Query() searchDto: SearchProductionOrderItemsDto,
  ) {
    try {
      const results =
        await this.productionOrderItemsService.searchProductionOrderItems(
          searchDto,
        );
      return {
        data: results.items,
        meta: results.meta,
        message: 'Production order items search completed successfully',
      };
    } catch (error) {
      console.error('Error in searchProductionOrderItems:', error);
      throw new HttpException(
        {
          message: 'Failed to search production order items',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const productionOrderItem =
        await this.productionOrderItemsService.findOne(id);

      if (!productionOrderItem) {
        throw new HttpException(
          'Production order item not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const product_data = await this.productsService.findOne(
        productionOrderItem.fk_product_id,
      );

      return {
        pk_production_order_item_id:
          productionOrderItem.pk_production_order_item_id,
        fk_production_order_id: productionOrderItem.fk_production_order_id,
        product: {
          id: product_data?.pk_product_id,
          name: product_data?.product_name,
          sku: product_data?.sku,
        },
        fk_category_id: productionOrderItem.fk_category_id,
        item_name: productionOrderItem.item_name,
        item_description: productionOrderItem.item_description,
        item_number: productionOrderItem.item_number,
        size: productionOrderItem.size,
        quantity: productionOrderItem.quantity,
        unit_price: productionOrderItem.unit_price,
        total: productionOrderItem.total,
        tax_rate: productionOrderItem.tax_rate,
        created_at: productionOrderItem.created_at,
        updated_at: productionOrderItem.updated_at,
        knitcolors_production_order:
          productionOrderItem.knitcolors_production_order || [],
        body_production_order_color:
          productionOrderItem.body_production_order_color || [],
        packaging_production_order:
          productionOrderItem.packaging_production_order || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch production order item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body() createProductionOrderItemDto: CreateProductionOrderItemDto,
  ) {
    try {
      return await this.productionOrderItemsService.create(
        createProductionOrderItemDto,
      );
    } catch (error) {
      console.log('error:', error);
      throw new HttpException(
        `Failed to create production order item: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductionOrderItemDto: UpdateProductionOrderItemDto,
  ): Promise<ProductionOrderItemsEntity> {
    try {
      return await this.productionOrderItemsService.update(
        id,
        updateProductionOrderItemDto,
      );
    } catch (error) {
      console.log('error:', error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update production order item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.productionOrderItemsService.remove(id);
      return { message: 'Production order item deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete production order item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
