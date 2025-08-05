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
import { ShippingPackageSpecificationsService } from './shipping-package-specifications.service';
import { ShippingPackageSpecificationsEntity } from './shipping-package-specifications.entity';
import {
  CreateShippingPackageSpecificationsDto,
  UpdateShippingPackageSpecificationsDto,
} from './shipping-package-specifications.dto';
import { ShippingOrdersService } from '../shipping-orders/shipping-orders.service';

@Controller({ version: '1', path: 'shipping-package-specifications' })
export class ShippingPackageSpecificationsController {
  constructor(
    private readonly shippingPackageSpecificationsService: ShippingPackageSpecificationsService,
    private readonly shippingOrdersService: ShippingOrdersService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all shipping package specifications',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const shippingPackageSpecifications =
      await this.shippingPackageSpecificationsService.findAll({
        page,
        limit,
      });

    return {
      data: shippingPackageSpecifications,
    };
  }

  @Get('by-shipping-order/:shippingOrderId')
  async getByShippingOrderId(
    @Param('shippingOrderId') shippingOrderId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      // Verify shipping order exists
      const shippingOrder =
        await this.shippingOrdersService.findOne(shippingOrderId);
      if (!shippingOrder) {
        throw new HttpException(
          'Shipping order not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const shippingPackageSpecifications =
        await this.shippingPackageSpecificationsService.findByShippingOrderId(
          shippingOrderId,
          { page, limit },
        );

      return {
        data: shippingPackageSpecifications,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve shipping package specifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/shipping-order/:shippingOrderId')
  async getPackageStatsByShippingOrder(
    @Param('shippingOrderId') shippingOrderId: number,
  ) {
    try {
      // Verify shipping order exists
      const shippingOrder =
        await this.shippingOrdersService.findOne(shippingOrderId);
      if (!shippingOrder) {
        throw new HttpException(
          'Shipping order not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const stats =
        await this.shippingPackageSpecificationsService.getPackageSpecificationsByShippingOrder(
          shippingOrderId,
        );

      return {
        data: stats,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve package statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const shippingPackageSpecification =
        await this.shippingPackageSpecificationsService.findOne(id);

      if (!shippingPackageSpecification) {
        throw new HttpException(
          'Shipping package specification not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: shippingPackageSpecification,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve shipping package specification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body()
    createShippingPackageSpecificationsDto: CreateShippingPackageSpecificationsDto,
  ) {
    try {
      // Verify shipping order exists
      const shippingOrder = await this.shippingOrdersService.findOne(
        createShippingPackageSpecificationsDto.fkShippingOrderId,
      );
      if (!shippingOrder) {
        throw new HttpException(
          'Shipping order not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const newShippingPackageSpecification =
        await this.shippingPackageSpecificationsService.create(
          createShippingPackageSpecificationsDto,
        );

      return {
        data: newShippingPackageSpecification,
        message: 'Shipping package specification created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create shipping package specification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body()
    updateShippingPackageSpecificationsDto: UpdateShippingPackageSpecificationsDto,
  ) {
    try {
      const existingShippingPackageSpecification =
        await this.shippingPackageSpecificationsService.findOne(id);
      if (!existingShippingPackageSpecification) {
        throw new HttpException(
          'Shipping package specification not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedShippingPackageSpecification =
        await this.shippingPackageSpecificationsService.update(
          id,
          updateShippingPackageSpecificationsDto,
        );

      return {
        data: updatedShippingPackageSpecification,
        message: 'Shipping package specification updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update shipping package specification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      const shippingPackageSpecification =
        await this.shippingPackageSpecificationsService.findOne(id);
      if (!shippingPackageSpecification) {
        throw new HttpException(
          'Shipping package specification not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.shippingPackageSpecificationsService.remove(id);

      return {
        message: 'Shipping package specification deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete shipping package specification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('by-shipping-order/:shippingOrderId')
  async removeByShippingOrderId(
    @Param('shippingOrderId') shippingOrderId: number,
  ) {
    try {
      const shippingOrder =
        await this.shippingOrdersService.findOne(shippingOrderId);
      if (!shippingOrder) {
        throw new HttpException(
          'Shipping order not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.shippingPackageSpecificationsService.removeByShippingOrderId(
        shippingOrderId,
      );

      return {
        message:
          'All shipping package specifications for the order deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete shipping package specifications by shipping order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
