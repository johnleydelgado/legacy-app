import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ShippingWeightPresetsEntity } from './shipping-weight-presets.entity';
import {
  CreateShippingWeightPresetDto,
  UpdateShippingWeightPresetDto,
} from './shipping-weight-presets.dto';

@Injectable()
export class ShippingWeightPresetsService {
  constructor(
    @Inject('SHIPPING_WEIGHT_PRESETS_REPOSITORY')
    private shippingWeightPresetsRepository: Repository<ShippingWeightPresetsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.shippingWeightPresetsRepository, options, {
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findAllActive(): Promise<ShippingWeightPresetsEntity[]> {
    return await this.shippingWeightPresetsRepository.find({
      where: { is_active: true },
      order: {
        created_at: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<ShippingWeightPresetsEntity | null> {
    return this.shippingWeightPresetsRepository.findOne({
      where: { pk_weight_preset_id: id },
    });
  }

  async create(
    createShippingWeightPresetDto: CreateShippingWeightPresetDto,
  ): Promise<ShippingWeightPresetsEntity> {
    const newWeightPreset = new ShippingWeightPresetsEntity();

    newWeightPreset.name = createShippingWeightPresetDto.name;
    newWeightPreset.weight = createShippingWeightPresetDto.weight;
    newWeightPreset.description =
      createShippingWeightPresetDto.description || null;
    newWeightPreset.measurement_unit =
      createShippingWeightPresetDto.measurement_unit || 'imperial';
    newWeightPreset.is_active =
      createShippingWeightPresetDto.is_active !== undefined
        ? createShippingWeightPresetDto.is_active
        : true;

    return await this.shippingWeightPresetsRepository.save(newWeightPreset);
  }

  async update(
    id: number,
    updateShippingWeightPresetDto: UpdateShippingWeightPresetDto,
  ): Promise<ShippingWeightPresetsEntity> {
    const toUpdate = await this.shippingWeightPresetsRepository.findOne({
      where: { pk_weight_preset_id: id },
    });

    if (!toUpdate) {
      throw new Error('Weight preset not found');
    }

    const updated = Object.assign(toUpdate, updateShippingWeightPresetDto);
    return await this.shippingWeightPresetsRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    await this.shippingWeightPresetsRepository.delete(id);
  }

  async findByMeasurementUnit(
    measurementUnit: 'metric' | 'imperial',
  ): Promise<ShippingWeightPresetsEntity[]> {
    return await this.shippingWeightPresetsRepository.find({
      where: {
        measurement_unit: measurementUnit,
        is_active: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByName(name: string): Promise<ShippingWeightPresetsEntity | null> {
    return await this.shippingWeightPresetsRepository.findOne({
      where: { name },
    });
  }
}
