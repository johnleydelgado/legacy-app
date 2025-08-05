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
import { ShippingWeightPresetsService } from './shipping-weight-presets.service';
import {
  CreateShippingWeightPresetDto,
  UpdateShippingWeightPresetDto,
} from './shipping-weight-presets.dto';
import { ShippingWeightPresetsEntity } from './shipping-weight-presets.entity';

@Controller({ version: '1', path: 'shipping-weight-presets' })
export class ShippingWeightPresetsController {
  constructor(
    private shippingWeightPresetsService: ShippingWeightPresetsService,
  ) {}

  @Get('ping')
  ping() {
    return {
      data: {
        message: 'Shipping weight presets service is running',
      },
    };
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      return await this.shippingWeightPresetsService.findAll({ page, limit });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch shipping weight presets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active')
  async getAllActive() {
    try {
      const presets = await this.shippingWeightPresetsService.findAllActive();
      return {
        data: presets,
        message: `Found ${presets.length} active weight presets`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch active weight presets',
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
        await this.shippingWeightPresetsService.findByMeasurementUnit(
          measurementUnit,
        );
      return {
        data: presets,
        message: `Found ${presets.length} ${measurementUnit} weight presets`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch weight presets by measurement unit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const preset = await this.shippingWeightPresetsService.findOne(id);
      if (!preset) {
        throw new HttpException(
          'Weight preset not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        data: preset,
        message: 'Weight preset found',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch weight preset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body() createShippingWeightPresetDto: CreateShippingWeightPresetDto,
  ) {
    try {
      // Check if preset with same name already exists
      const existingPreset = await this.shippingWeightPresetsService.findByName(
        createShippingWeightPresetDto.name,
      );

      if (existingPreset) {
        throw new HttpException(
          'Weight preset with this name already exists',
          HttpStatus.CONFLICT,
        );
      }

      const newPreset = await this.shippingWeightPresetsService.create(
        createShippingWeightPresetDto,
      );
      return {
        data: newPreset,
        message: 'Weight preset created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create weight preset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateShippingWeightPresetDto: UpdateShippingWeightPresetDto,
  ) {
    try {
      const updatedPreset = await this.shippingWeightPresetsService.update(
        id,
        updateShippingWeightPresetDto,
      );
      return {
        data: updatedPreset,
        message: 'Weight preset updated successfully',
      };
    } catch (error) {
      if (error.message === 'Weight preset not found') {
        throw new HttpException(
          'Weight preset not found',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to update weight preset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.shippingWeightPresetsService.remove(id);
      return {
        message: 'Weight preset deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete weight preset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
