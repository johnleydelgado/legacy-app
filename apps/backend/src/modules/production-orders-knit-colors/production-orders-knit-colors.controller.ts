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
import { ProductionOrdersKnitColorsService } from './production-orders-knit-colors.service';
import {
  CreateProductionOrdersKnitColorDto,
  UpdateProductionOrdersKnitColorDto,
} from './production-orders-knit-colors.dto';
import { ProductionOrdersKnitColorsEntity } from './production-orders-knit-colors.entity';
import { YarnsService } from '../yarns/yarns.service';

@Controller({ version: '1', path: 'production-orders-knit-colors' })
export class ProductionOrdersKnitColorsController {
  constructor(
    private readonly productionOrdersKnitColorsService: ProductionOrdersKnitColorsService,
    private yarnsService: YarnsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all production orders knit colors',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const knitColors = await this.productionOrdersKnitColorsService.findAll({
        page,
        limit,
      });
      const meta = knitColors.meta;

      const normalizedKnitColors = await Promise.all(
        knitColors.items.map(async (knitColor) => {
          const yarn_data = await this.yarnsService.findOne(
            knitColor.fk_yarn_id,
          );

          return {
            pk_production_orders_knit_color_id:
              knitColor.pk_production_orders_knit_color_id,
            name: knitColor.name,
            yarn: {
              id: yarn_data?.pk_yarn_id,
              yarn_color: yarn_data?.yarn_color,
              color_code: yarn_data?.color_code,
              card_number: yarn_data?.card_number,
              yarn_type: yarn_data?.yarn_type,
            },
            status: knitColor.status,
            created_at: knitColor.created_at,
            updated_at: knitColor.updated_at,
          };
        }),
      );

      return { items: normalizedKnitColors, meta };
    } catch (error) {
      console.error('Error in getAll production orders knit colors:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch production orders knit colors',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active')
  async getAllActive() {
    try {
      const knitColors =
        await this.productionOrdersKnitColorsService.findAllActive();

      const normalizedKnitColors = await Promise.all(
        knitColors.map(async (knitColor) => {
          const yarn_data = await this.yarnsService.findOne(
            knitColor.fk_yarn_id,
          );

          return {
            pk_production_orders_knit_color_id:
              knitColor.pk_production_orders_knit_color_id,
            name: knitColor.name,
            yarn: {
              id: yarn_data?.pk_yarn_id,
              yarn_color: yarn_data?.yarn_color,
              color_code: yarn_data?.color_code,
              card_number: yarn_data?.card_number,
              yarn_type: yarn_data?.yarn_type,
            },
            status: knitColor.status,
            created_at: knitColor.created_at,
            updated_at: knitColor.updated_at,
          };
        }),
      );

      return { items: normalizedKnitColors };
    } catch (error) {
      console.error(
        'Error in getAllActive production orders knit colors:',
        error,
      );
      throw new HttpException(
        {
          message: 'Failed to fetch active production orders knit colors',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const knitColor =
        await this.productionOrdersKnitColorsService.findOne(id);

      if (!knitColor) {
        throw new HttpException(
          'Production orders knit color not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const yarn_data = await this.yarnsService.findOne(knitColor.fk_yarn_id);

      return {
        pk_production_orders_knit_color_id:
          knitColor.pk_production_orders_knit_color_id,
        name: knitColor.name,
        yarn: {
          id: yarn_data?.pk_yarn_id,
          name: yarn_data?.yarn_color,
          yarn_color: yarn_data?.yarn_color,
          color_code: yarn_data?.color_code,
          card_number: yarn_data?.card_number,
          yarn_type: yarn_data?.yarn_type,
        },
        status: knitColor.status,
        created_at: knitColor.created_at,
        updated_at: knitColor.updated_at,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch production orders knit color',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('item/:itemId')
  async getByItemId(@Param('itemId') itemId: number) {
    try {
      const knitColors =
        await this.productionOrdersKnitColorsService.findByItemId(itemId);

      const normalizedKnitColors = await Promise.all(
        knitColors.map(async (knitColor) => {
          const yarn_data = await this.yarnsService.findOne(
            knitColor.fk_yarn_id,
          );

          return {
            pk_production_orders_knit_color_id:
              knitColor.pk_production_orders_knit_color_id,
            fk_production_order_item_id: knitColor.fk_production_order_item_id,
            name: knitColor.name,
            fk_yarn_id: knitColor.fk_yarn_id,
            description: knitColor.description,
            yarn: {
              id: yarn_data?.pk_yarn_id,
              yarn_color: yarn_data?.yarn_color,
              color_code: yarn_data?.color_code,
              card_number: yarn_data?.card_number,
              yarn_type: yarn_data?.yarn_type,
            },
            status: knitColor.status,
            created_at: knitColor.created_at,
            updated_at: knitColor.updated_at,
          };
        }),
      );

      return normalizedKnitColors;
    } catch (error) {
      console.error('Error in getByItemId:', error);
      throw new HttpException(
        'Failed to fetch production orders knit colors by item ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createDto: CreateProductionOrdersKnitColorDto) {
    try {
      return await this.productionOrdersKnitColorsService.create(createDto);
    } catch (error) {
      console.log('error:', error);
      throw new HttpException(
        `Failed to create production orders knit color: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateProductionOrdersKnitColorDto,
  ): Promise<ProductionOrdersKnitColorsEntity> {
    try {
      return await this.productionOrdersKnitColorsService.update(id, updateDto);
    } catch (error) {
      console.log('error:', error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update production orders knit color',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.productionOrdersKnitColorsService.remove(id);
      return { message: 'Production orders knit color deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete production orders knit color',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('item/:itemId')
  async removeByItemId(@Param('itemId') itemId: number) {
    try {
      const result =
        await this.productionOrdersKnitColorsService.removeByItemId(itemId);
      return {
        message: 'Production orders knit colors deleted successfully for item',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete production orders knit colors for item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
