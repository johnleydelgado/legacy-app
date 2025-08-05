import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ProductionOrdersBodyColorsEntity } from './production-orders-body-colors.entity';
import {
  CreateProductionOrdersBodyColorDto,
  UpdateProductionOrdersBodyColorDto,
} from './production-orders-body-colors.dto';

@Injectable()
export class ProductionOrdersBodyColorsService {
  constructor(
    @Inject('PRODUCTION_ORDERS_BODY_COLORS_REPOSITORY')
    private productionOrdersBodyColorsRepository: Repository<ProductionOrdersBodyColorsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.productionOrdersBodyColorsRepository, options, {
      order: { name: 'ASC' },
    });
  }

  async findAllActive() {
    return this.productionOrdersBodyColorsRepository.find({
      where: { status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }

  findOne(
    pk_production_orders_body_color_id: number,
  ): Promise<ProductionOrdersBodyColorsEntity | null> {
    return this.productionOrdersBodyColorsRepository.findOne({
      where: { pk_production_orders_body_color_id },
    });
  }

  async findByItemId(
    fk_production_order_item_id: number,
  ): Promise<ProductionOrdersBodyColorsEntity[]> {
    return this.productionOrdersBodyColorsRepository.find({
      where: { fk_production_order_item_id },
      order: { created_at: 'ASC' },
    });
  }

  async removeByItemId(fk_production_order_item_id: number): Promise<any> {
    return await this.productionOrdersBodyColorsRepository.delete({
      fk_production_order_item_id,
    });
  }

  async create(
    dto: CreateProductionOrdersBodyColorDto,
  ): Promise<ProductionOrdersBodyColorsEntity> {
    const newBodyColor = new ProductionOrdersBodyColorsEntity();

    newBodyColor.fk_production_order_item_id = dto.fkProductionOrderItemID;
    newBodyColor.name = dto.name;
    newBodyColor.fk_yarn_id = dto.fkYarnID;
    newBodyColor.description = dto.description || null;
    newBodyColor.status = dto.status || 'ACTIVE';
    newBodyColor.created_at = new Date();
    newBodyColor.updated_at = new Date();

    return this.productionOrdersBodyColorsRepository.save(newBodyColor);
  }

  async remove(id: number) {
    return await this.productionOrdersBodyColorsRepository.delete(id);
  }

  async update(
    pk_production_orders_body_color_id: number,
    dto: UpdateProductionOrdersBodyColorDto,
  ): Promise<ProductionOrdersBodyColorsEntity> {
    const toUpdate = await this.productionOrdersBodyColorsRepository.findOne({
      where: { pk_production_orders_body_color_id },
    });

    if (!toUpdate) {
      throw new BadRequestException('Production orders body color not found');
    }

    const updated = Object.assign(toUpdate, {
      fk_production_order_item_id:
        dto.fkProductionOrderItemID ?? toUpdate.fk_production_order_item_id,
      name: dto.name ?? toUpdate.name,
      fk_yarn_id: dto.fkYarnID ?? toUpdate.fk_yarn_id,
      description: dto.description ?? toUpdate.description,
      status: dto.status ?? toUpdate.status,
      updated_at: new Date(),
    });

    return this.productionOrdersBodyColorsRepository.save(updated);
  }
}
