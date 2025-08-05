import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ShippingDimensionPresetsService } from './shipping-dimension-presets.service';
import {
  CreateShippingDimensionPresetDto,
  UpdateShippingDimensionPresetDto,
} from './shipping-dimension-presets.dto';
import { ShippingDimensionPresetsEntity } from './shipping-dimension-presets.entity';

@Controller({ version: '1', path: 'shipping-dimension-presets' })
export class ShippingDimensionPresetsController {
  constructor(
    private shippingDimensionPresetsService: ShippingDimensionPresetsService,
  ) {}

  @Get('ping')
  ping() {
    return {
      data: {
        message: 'Shipping dimension presets service is running',
      },
    };
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      return await this.shippingDimensionPresetsService.findAll({
        page,
        limit,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch shipping dimension presets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active')
  async getAllActive() {
    try {
      const presets =
        await this.shippingDimensionPresetsService.findAllActive();
      return {
        data: presets,
        message: `Found ${presets.length} active dimension presets`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch active dimension presets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('unit/:measurementUnit')
  async getByMeasurementUnit(
    @Param('measurementUnit') measurementUnit: 'metric' | 'imperial',
  ) {
    try {
      const presets =
        await this.shippingDimensionPresetsService.findByMeasurementUnit(
          measurementUnit,
        );
      return {
        data: presets,
        message: `Found ${presets.length} ${measurementUnit} dimension presets`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch dimension presets by measurement unit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const preset = await this.shippingDimensionPresetsService.findOne(id);
      if (!preset) {
        throw new HttpException(
          'Dimension preset not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        data: preset,
        message: 'Dimension preset found',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch dimension preset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body() createShippingDimensionPresetDto: CreateShippingDimensionPresetDto,
  ) {
    try {
      // Check if preset with same name already exists
      const existingPreset =
        await this.shippingDimensionPresetsService.findByName(
          createShippingDimensionPresetDto.name,
        );

      if (existingPreset) {
        throw new HttpException(
          'Dimension preset with this name already exists',
          HttpStatus.CONFLICT,
        );
      }

      const newPreset = await this.shippingDimensionPresetsService.create(
        createShippingDimensionPresetDto,
      );
      return {
        data: newPreset,
        message: 'Dimension preset created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create dimension preset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateShippingDimensionPresetDto: UpdateShippingDimensionPresetDto,
  ) {
    try {
      const updatedPreset = await this.shippingDimensionPresetsService.update(
        id,
        updateShippingDimensionPresetDto,
      );
      return {
        data: updatedPreset,
        message: 'Dimension preset updated successfully',
      };
    } catch (error) {
      if (error.message === 'Dimension preset not found') {
        throw new HttpException(
          'Dimension preset not found',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to update dimension preset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.shippingDimensionPresetsService.remove(id);
      return {
        message: 'Dimension preset deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete dimension preset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
