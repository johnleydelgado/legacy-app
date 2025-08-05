import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ShippingPackageSpecItemsService } from './shipping-package-spec-items.service';
import {
  CreateShippingPackageSpecItemsDto,
  UpdateShippingPackageSpecItemsDto,
} from './shipping-package-spec-items.dto';

@Controller({ version: '1', path: 'shipping-package-spec-items' })
export class ShippingPackageSpecItemsController {
  constructor(
    private readonly shippingPackageSpecItemsService: ShippingPackageSpecItemsService,
  ) {}

  @Post()
  async create(
    @Body()
    createShippingPackageSpecItemsDto: CreateShippingPackageSpecItemsDto,
  ) {
    try {
      console.log(
        'Creating shipping package spec item with data:',
        createShippingPackageSpecItemsDto,
      );

      const newShippingPackageSpecItem =
        await this.shippingPackageSpecItemsService.create(
          createShippingPackageSpecItemsDto,
        );

      return {
        data: newShippingPackageSpecItem,
        message: 'Shipping package spec item created successfully',
      };
    } catch (error) {
      console.error('Error creating shipping package spec item:', error);
      throw new HttpException(
        `Failed to create shipping package spec item: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const options = {
        page: Number(page),
        limit: Number(limit),
      };

      const result =
        await this.shippingPackageSpecItemsService.findAll(options);

      return {
        data: result,
        message: 'Shipping package spec items retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve shipping package spec items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const shippingPackageSpecItem =
        await this.shippingPackageSpecItemsService.findOne(Number(id));

      if (!shippingPackageSpecItem) {
        throw new HttpException(
          'Shipping package spec item not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: shippingPackageSpecItem,
        message: 'Shipping package spec item retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve shipping package spec item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('package/:packageSpecId')
  async findByPackageSpecId(
    @Param('packageSpecId') packageSpecId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      const options = {
        page: Number(page),
        limit: Number(limit),
      };

      const result =
        await this.shippingPackageSpecItemsService.findByPackageSpecId(
          Number(packageSpecId),
          options,
        );

      return {
        data: result,
        message: 'Shipping package spec items retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve shipping package spec items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('item/:shippingOrderItemId')
  async findByShippingOrderItemId(
    @Param('shippingOrderItemId') shippingOrderItemId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      const options = {
        page: Number(page),
        limit: Number(limit),
      };

      const result =
        await this.shippingPackageSpecItemsService.findByShippingOrderItemId(
          Number(shippingOrderItemId),
          options,
        );

      return {
        data: result,
        message: 'Shipping package spec items retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve shipping package spec items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('package/:packageSpecId/summary')
  async getPackageItemSummary(@Param('packageSpecId') packageSpecId: string) {
    try {
      const summary =
        await this.shippingPackageSpecItemsService.getPackageItemSummary(
          Number(packageSpecId),
        );

      return {
        data: summary,
        message: 'Package item summary retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve package item summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('item/:shippingOrderItemId/summary')
  async getItemPackageSummary(
    @Param('shippingOrderItemId') shippingOrderItemId: string,
  ) {
    try {
      const summary =
        await this.shippingPackageSpecItemsService.getItemPackageSummary(
          Number(shippingOrderItemId),
        );

      return {
        data: summary,
        message: 'Item package summary retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve item package summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateShippingPackageSpecItemsDto: UpdateShippingPackageSpecItemsDto,
  ) {
    try {
      const updatedShippingPackageSpecItem =
        await this.shippingPackageSpecItemsService.update(
          Number(id),
          updateShippingPackageSpecItemsDto,
        );

      if (!updatedShippingPackageSpecItem) {
        throw new HttpException(
          'Shipping package spec item not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: updatedShippingPackageSpecItem,
        message: 'Shipping package spec item updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update shipping package spec item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.shippingPackageSpecItemsService.remove(Number(id));

      return {
        message: 'Shipping package spec item deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete shipping package spec item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('package/:packageSpecId')
  async removeByPackageSpecId(@Param('packageSpecId') packageSpecId: string) {
    try {
      await this.shippingPackageSpecItemsService.removeByPackageSpecId(
        Number(packageSpecId),
      );

      return {
        message: 'Shipping package spec items deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete shipping package spec items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('item/:shippingOrderItemId')
  async removeByShippingOrderItemId(
    @Param('shippingOrderItemId') shippingOrderItemId: string,
  ) {
    try {
      await this.shippingPackageSpecItemsService.removeByShippingOrderItemId(
        Number(shippingOrderItemId),
      );

      return {
        message: 'Shipping package spec items deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete shipping package spec items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
