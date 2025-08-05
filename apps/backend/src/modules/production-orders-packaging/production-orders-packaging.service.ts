import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ProductionOrdersPackagingEntity } from './production-orders-packaging.entity';
import { CreateProductionOrdersPackagingDto, UpdateProductionOrdersPackagingDto } from './production-orders-packaging.dto';

@Injectable()
export class ProductionOrdersPackagingService {
  constructor(
    @Inject('PRODUCTION_ORDERS_PACKAGING_REPOSITORY')
    private productionOrdersPackagingRepository: Repository<ProductionOrdersPackagingEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.productionOrdersPackagingRepository, options, {
      order: { pk_production_orders_packaging_id: 'ASC' }
    });
  }

  findOne(pk_production_orders_packaging_id: number): Promise<ProductionOrdersPackagingEntity | null> {
    return this.productionOrdersPackagingRepository.findOne({ 
      where: { pk_production_orders_packaging_id } 
    });
  }

  async create(dto: CreateProductionOrdersPackagingDto): Promise<ProductionOrdersPackagingEntity> {
    const newPackaging = new ProductionOrdersPackagingEntity();

    newPackaging.fk_production_order_item_id = dto.fk_production_order_item_id;
    newPackaging.fk_packaging_id = dto.fk_packaging_id;
    newPackaging.quantity = dto.quantity || 1;
    newPackaging.created_at = new Date();
    newPackaging.updated_at = new Date();

    return this.productionOrdersPackagingRepository.save(newPackaging);
  }

  async remove(id: number) {
    return await this.productionOrdersPackagingRepository.delete(id);
  }

  async update(pk_production_orders_packaging_id: number, dto: UpdateProductionOrdersPackagingDto): Promise<ProductionOrdersPackagingEntity> {
    const toUpdate = await this.productionOrdersPackagingRepository.findOne({ 
      where: { pk_production_orders_packaging_id } 
    });
    
    if (!toUpdate) {
      throw new BadRequestException('Production orders packaging not found');
    }

    const updated = Object.assign(toUpdate, {
      fk_production_order_item_id: dto.fk_production_order_item_id ?? toUpdate.fk_production_order_item_id,
      fk_packaging_id: dto.fk_packaging_id ?? toUpdate.fk_packaging_id,
      quantity: dto.quantity ?? toUpdate.quantity,
      updated_at: new Date(),
    });

    return this.productionOrdersPackagingRepository.save(updated);
  }

  async findByItemId(fk_production_order_item_id: number): Promise<ProductionOrdersPackagingEntity[]> {
    return this.productionOrdersPackagingRepository.find({
      where: { fk_production_order_item_id },
      relations: ['packaging'],
      order: { pk_production_orders_packaging_id: 'ASC' }
    });
  }

  async removeByItemId(fk_production_order_item_id: number): Promise<any> {
    return this.productionOrdersPackagingRepository.delete({ fk_production_order_item_id });
  }
}