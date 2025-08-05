import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ProductionOrdersKnitColorsEntity } from './production-orders-knit-colors.entity';
import {
  CreateProductionOrdersKnitColorDto,
  UpdateProductionOrdersKnitColorDto,
} from './production-orders-knit-colors.dto';

@Injectable()
export class ProductionOrdersKnitColorsService {
  constructor(
    @Inject('PRODUCTION_ORDERS_KNIT_COLORS_REPOSITORY')
    private productionOrdersKnitColorsRepository: Repository<ProductionOrdersKnitColorsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.productionOrdersKnitColorsRepository, options, {
      order: { name: 'ASC' },
    });
  }

  async findAllActive() {
    return this.productionOrdersKnitColorsRepository.find({
      where: { status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }

  findOne(
    pk_production_orders_knit_color_id: number,
  ): Promise<ProductionOrdersKnitColorsEntity | null> {
    return this.productionOrdersKnitColorsRepository.findOne({
      where: { pk_production_orders_knit_color_id },
    });
  }

  async findByItemId(
    fk_production_order_item_id: number,
  ): Promise<ProductionOrdersKnitColorsEntity[]> {
    return this.productionOrdersKnitColorsRepository.find({
      where: { fk_production_order_item_id },
      order: { created_at: 'ASC' },
    });
  }

  async removeByItemId(fk_production_order_item_id: number): Promise<any> {
    return await this.productionOrdersKnitColorsRepository.delete({
      fk_production_order_item_id,
    });
  }

  async create(
    dto: CreateProductionOrdersKnitColorDto,
  ): Promise<ProductionOrdersKnitColorsEntity> {
    const newKnitColor = new ProductionOrdersKnitColorsEntity();

    newKnitColor.fk_production_order_item_id = dto.fk_production_order_item_id;
    newKnitColor.name = dto.name;
    newKnitColor.fk_yarn_id = dto.fk_yarn_id;
    newKnitColor.description = dto.description || null;
    newKnitColor.status = dto.status || 'ACTIVE';
    newKnitColor.created_at = new Date();
    newKnitColor.updated_at = new Date();

    return this.productionOrdersKnitColorsRepository.save(newKnitColor);
  }

  async remove(id: number) {
    return await this.productionOrdersKnitColorsRepository.delete(id);
  }

  async update(
    pk_production_orders_knit_color_id: number,
    dto: UpdateProductionOrdersKnitColorDto,
  ): Promise<ProductionOrdersKnitColorsEntity> {
    const toUpdate = await this.productionOrdersKnitColorsRepository.findOne({
      where: { pk_production_orders_knit_color_id },
    });

    if (!toUpdate) {
      throw new BadRequestException('Production orders knit color not found');
    }

    const updated = Object.assign(toUpdate, {
      fk_production_order_item_id:
        dto.fk_production_order_item_id ?? toUpdate.fk_production_order_item_id,
      name: dto.name ?? toUpdate.name,
      fk_yarn_id: dto.fk_yarn_id ?? toUpdate.fk_yarn_id,
      description: dto.description ?? toUpdate.description,
      status: dto.status ?? toUpdate.status,
      updated_at: new Date(),
    });

    return this.productionOrdersKnitColorsRepository.save(updated);
  }
}
