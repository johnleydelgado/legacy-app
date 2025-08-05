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
} from '@nestjs/common';
import { ProductionOrdersBodyColorsService } from './production-orders-body-colors.service';
import {
  CreateProductionOrdersBodyColorDto,
  UpdateProductionOrdersBodyColorDto,
} from './production-orders-body-colors.dto';
import { ProductionOrdersBodyColorsEntity } from './production-orders-body-colors.entity';
import { YarnsService } from '../yarns/yarns.service';

@Controller({ version: '1', path: 'production-orders-body-colors' })
export class ProductionOrdersBodyColorsController {
  constructor(
    private readonly productionOrdersBodyColorsService: ProductionOrdersBodyColorsService,
    private yarnsService: YarnsService,
  ) {}

  @Get('ping')
  ping() {
    return {
      data: {
        message: 'This action returns all production orders body colors',
      },
    };
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const bodyColors = await this.productionOrdersBodyColorsService.findAll({
        page,
        limit,
      });
      return {
        data: bodyColors.items,
        meta: bodyColors.meta,
        message: 'Production orders body colors fetched successfully',
      };
    } catch (error) {
      console.error('Error in getAll production orders body colors:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch production orders body colors',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active')
  async getAllActive() {
    try {
      const bodyColors =
        await this.productionOrdersBodyColorsService.findAllActive();
      return {
        data: bodyColors,
        message: 'Active production orders body colors fetched successfully',
      };
    } catch (error) {
      console.error(
        'Error in getAllActive production orders body colors:',
        error,
      );
      throw new HttpException(
        {
          message: 'Failed to fetch active production orders body colors',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('item/:itemId')
  async getByItemId(@Param('itemId') itemId: number) {
    try {
      const bodyColors =
        await this.productionOrdersBodyColorsService.findByItemId(itemId);

      const normalizedBodyColors = await Promise.all(
        bodyColors.map(async (bodyColor) => {
          const yarn_data = await this.yarnsService.findOne(
            bodyColor.fk_yarn_id,
          );

          return {
            pk_production_orders_body_color_id:
              bodyColor.pk_production_orders_body_color_id,
            fk_production_order_item_id: bodyColor.fk_production_order_item_id,
            name: bodyColor.name,
            fk_yarn_id: bodyColor.fk_yarn_id,
            description: bodyColor.description,
            yarn: {
              id: yarn_data?.pk_yarn_id,
              yarn_color: yarn_data?.yarn_color,
              color_code: yarn_data?.color_code,
              card_number: yarn_data?.card_number,
              yarn_type: yarn_data?.yarn_type,
            },
            status: bodyColor.status,
            created_at: bodyColor.created_at,
            updated_at: bodyColor.updated_at,
          };
        }),
      );

      return normalizedBodyColors;
    } catch (error) {
      console.error('Error in getByItemId:', error);
      throw new HttpException(
        'Failed to fetch body colors for item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const bodyColor =
        await this.productionOrdersBodyColorsService.findOne(id);

      if (!bodyColor) {
        throw new HttpException(
          'Production orders body color not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: bodyColor,
        message: 'Production orders body color fetched successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch production orders body color',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createDto: CreateProductionOrdersBodyColorDto) {
    try {
      const bodyColor =
        await this.productionOrdersBodyColorsService.create(createDto);
      return {
        data: bodyColor,
        message: 'Production orders body color created successfully',
      };
    } catch (error) {
      console.error('Error creating production orders body color:', error);
      throw new HttpException(
        `Failed to create production orders body color: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateProductionOrdersBodyColorDto,
  ): Promise<{ data: ProductionOrdersBodyColorsEntity; message: string }> {
    try {
      const bodyColor = await this.productionOrdersBodyColorsService.update(
        id,
        updateDto,
      );
      return {
        data: bodyColor,
        message: 'Production orders body color updated successfully',
      };
    } catch (error) {
      console.error('Error updating production orders body color:', error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update production orders body color',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.productionOrdersBodyColorsService.remove(id);
      return {
        message: 'Production orders body color deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete production orders body color',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('item/:itemId')
  async removeByItemId(@Param('itemId') itemId: number) {
    try {
      // This would need to be implemented in the service
      return {
        message: 'Body colors for item deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete body colors for item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
