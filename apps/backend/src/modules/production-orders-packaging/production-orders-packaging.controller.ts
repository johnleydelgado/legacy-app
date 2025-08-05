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
import { ProductionOrdersPackagingService } from './production-orders-packaging.service';
import {
  CreateProductionOrdersPackagingDto,
  UpdateProductionOrdersPackagingDto,
} from './production-orders-packaging.dto';
import { ProductionOrdersPackagingEntity } from './production-orders-packaging.entity';

@Controller({ version: '1', path: 'production-orders-packaging' })
export class ProductionOrdersPackagingController {
  constructor(
    private readonly productionOrdersPackagingService: ProductionOrdersPackagingService,
  ) {}

  @Get('ping')
  ping() {
    return {
      data: {
        message: 'This action returns all production orders packaging',
      },
    };
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const packaging = await this.productionOrdersPackagingService.findAll({
        page,
        limit,
      });
      return {
        data: packaging.items,
        meta: packaging.meta,
        message: 'Production orders packaging fetched successfully',
      };
    } catch (error) {
      console.error('Error in getAll production orders packaging:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch production orders packaging',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('item/:itemId')
  async getByItemId(@Param('itemId') itemId: number) {
    try {
      const packaging =
        await this.productionOrdersPackagingService.findByItemId(itemId);
      return packaging;
    } catch (error) {
      console.error('Error in getByItemId:', error);
      throw new HttpException(
        'Failed to fetch packaging for item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const packaging = await this.productionOrdersPackagingService.findOne(id);

      if (!packaging) {
        throw new HttpException(
          'Production orders packaging not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: packaging,
        message: 'Production orders packaging fetched successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch production orders packaging',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createDto: CreateProductionOrdersPackagingDto) {
    try {
      const packaging =
        await this.productionOrdersPackagingService.create(createDto);
      return {
        data: packaging,
        message: 'Production orders packaging created successfully',
      };
    } catch (error) {
      console.error('Error creating production orders packaging:', error);
      throw new HttpException(
        `Failed to create production orders packaging: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateProductionOrdersPackagingDto,
  ): Promise<{ data: ProductionOrdersPackagingEntity; message: string }> {
    try {
      const packaging = await this.productionOrdersPackagingService.update(
        id,
        updateDto,
      );
      return {
        data: packaging,
        message: 'Production orders packaging updated successfully',
      };
    } catch (error) {
      console.error('Error updating production orders packaging:', error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update production orders packaging',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.productionOrdersPackagingService.remove(id);
      return {
        message: 'Production orders packaging deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete production orders packaging',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('item/:itemId')
  async removeByItemId(@Param('itemId') itemId: number) {
    try {
      const result =
        await this.productionOrdersPackagingService.removeByItemId(itemId);
      return {
        data: result,
        message: 'Packaging for item deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete packaging for item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
