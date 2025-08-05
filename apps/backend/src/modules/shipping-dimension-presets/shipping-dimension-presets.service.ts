import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ShippingDimensionPresetsEntity } from './shipping-dimension-presets.entity';
import {
  CreateShippingDimensionPresetDto,
  UpdateShippingDimensionPresetDto,
} from './shipping-dimension-presets.dto';

@Injectable()
export class ShippingDimensionPresetsService {
  constructor(
    @Inject('SHIPPING_DIMENSION_PRESETS_REPOSITORY')
    private shippingDimensionPresetsRepository: Repository<ShippingDimensionPresetsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.shippingDimensionPresetsRepository, options, {
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findAllActive(): Promise<ShippingDimensionPresetsEntity[]> {
    return await this.shippingDimensionPresetsRepository.find({
      where: { is_active: true },
      order: {
        created_at: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<ShippingDimensionPresetsEntity | null> {
    return this.shippingDimensionPresetsRepository.findOne({
      where: { pk_dimension_preset_id: id },
    });
  }

  async create(
    createShippingDimensionPresetDto: CreateShippingDimensionPresetDto,
  ): Promise<ShippingDimensionPresetsEntity> {
    const newDimensionPreset = new ShippingDimensionPresetsEntity();

    newDimensionPreset.name = createShippingDimensionPresetDto.name;
    newDimensionPreset.length = createShippingDimensionPresetDto.length;
    newDimensionPreset.width = createShippingDimensionPresetDto.width;
    newDimensionPreset.height = createShippingDimensionPresetDto.height;
    newDimensionPreset.description =
      createShippingDimensionPresetDto.description || null;
    newDimensionPreset.measurement_unit =
      createShippingDimensionPresetDto.measurement_unit || 'imperial';
    newDimensionPreset.is_active =
      createShippingDimensionPresetDto.is_active !== undefined
        ? createShippingDimensionPresetDto.is_active
        : true;

    return await this.shippingDimensionPresetsRepository.save(
      newDimensionPreset,
    );
  }

  async update(
    id: number,
    updateShippingDimensionPresetDto: UpdateShippingDimensionPresetDto,
  ): Promise<ShippingDimensionPresetsEntity> {
    const toUpdate = await this.shippingDimensionPresetsRepository.findOne({
      where: { pk_dimension_preset_id: id },
    });

    if (!toUpdate) {
      throw new Error('Dimension preset not found');
    }

    const updated = Object.assign(toUpdate, updateShippingDimensionPresetDto);
    return await this.shippingDimensionPresetsRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    await this.shippingDimensionPresetsRepository.delete(id);
  }

  async findByMeasurementUnit(
    measurementUnit: 'metric' | 'imperial',
  ): Promise<ShippingDimensionPresetsEntity[]> {
    return await this.shippingDimensionPresetsRepository.find({
      where: {
        measurement_unit: measurementUnit,
        is_active: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByName(
    name: string,
  ): Promise<ShippingDimensionPresetsEntity | null> {
    return await this.shippingDimensionPresetsRepository.findOne({
      where: { name },
    });
  }
}
