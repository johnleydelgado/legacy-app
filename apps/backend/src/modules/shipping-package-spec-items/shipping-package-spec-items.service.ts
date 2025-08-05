import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ShippingPackageSpecItemsEntity } from './shipping-package-spec-items.entity';
import {
  CreateShippingPackageSpecItemsDto,
  UpdateShippingPackageSpecItemsDto,
} from './shipping-package-spec-items.dto';

@Injectable()
export class ShippingPackageSpecItemsService {
  constructor(
    @Inject('SHIPPING_PACKAGE_SPEC_ITEMS_REPOSITORY')
    private shippingPackageSpecItemsRepository: Repository<ShippingPackageSpecItemsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    const queryBuilder = this.shippingPackageSpecItemsRepository
      .createQueryBuilder('shipping_package_spec_items')
      .orderBy('shipping_package_spec_items.created_at', 'ASC');

    return paginate(queryBuilder, options);
  }

  findOne(
    pk_sp_item_id: number,
  ): Promise<ShippingPackageSpecItemsEntity | null> {
    return this.shippingPackageSpecItemsRepository.findOne({
      where: { pk_sp_item_id },
    });
  }

  async findByPackageSpecId(
    packageSpecId: number,
    options: IPaginationOptions,
  ) {
    const queryBuilder = this.shippingPackageSpecItemsRepository
      .createQueryBuilder('shipping_package_spec_items')
      .where(
        'shipping_package_spec_items.fk_shipping_package_spec_id = :packageSpecId',
        { packageSpecId },
      )
      .orderBy('shipping_package_spec_items.created_at', 'ASC');

    return paginate(queryBuilder, options);
  }

  async findByShippingOrderItemId(
    shippingOrderItemId: number,
    options: IPaginationOptions,
  ) {
    const queryBuilder = this.shippingPackageSpecItemsRepository
      .createQueryBuilder('shipping_package_spec_items')
      .where(
        'shipping_package_spec_items.fk_shipping_order_item_id = :shippingOrderItemId',
        { shippingOrderItemId },
      )
      .orderBy('shipping_package_spec_items.created_at', 'ASC');

    return paginate(queryBuilder, options);
  }

  async create(
    createShippingPackageSpecItemsDto: CreateShippingPackageSpecItemsDto,
  ): Promise<ShippingPackageSpecItemsEntity> {
    try {
      console.log(
        'Service: Creating shipping package spec item with data:',
        createShippingPackageSpecItemsDto,
      );

      const newShippingPackageSpecItem =
        this.shippingPackageSpecItemsRepository.create({
          fk_shipping_package_spec_id:
            createShippingPackageSpecItemsDto.fkShippingPackageSpecId,
          fk_shipping_order_item_id:
            createShippingPackageSpecItemsDto.fkShippingOrderItemId,
          qty: createShippingPackageSpecItemsDto.qty,
        });

      console.log(
        'Service: Created entity object:',
        newShippingPackageSpecItem,
      );

      const savedItem = await this.shippingPackageSpecItemsRepository.save(
        newShippingPackageSpecItem,
      );

      console.log('Service: Successfully saved item:', savedItem);
      return savedItem;
    } catch (error) {
      console.error(
        'Service: Error creating shipping package spec item:',
        error,
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateShippingPackageSpecItemsDto: UpdateShippingPackageSpecItemsDto,
  ) {
    const updateData: any = {};

    if (
      updateShippingPackageSpecItemsDto.fkShippingPackageSpecId !== undefined
    ) {
      updateData.fk_shipping_package_spec_id =
        updateShippingPackageSpecItemsDto.fkShippingPackageSpecId;
    }
    if (updateShippingPackageSpecItemsDto.fkShippingOrderItemId !== undefined) {
      updateData.fk_shipping_order_item_id =
        updateShippingPackageSpecItemsDto.fkShippingOrderItemId;
    }
    if (updateShippingPackageSpecItemsDto.qty !== undefined) {
      updateData.qty = updateShippingPackageSpecItemsDto.qty;
    }

    updateData.updated_at = new Date();

    await this.shippingPackageSpecItemsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.shippingPackageSpecItemsRepository.delete(id);
  }

  async removeByPackageSpecId(packageSpecId: number): Promise<void> {
    await this.shippingPackageSpecItemsRepository.delete({
      fk_shipping_package_spec_id: packageSpecId,
    });
  }

  async removeByShippingOrderItemId(
    shippingOrderItemId: number,
  ): Promise<void> {
    await this.shippingPackageSpecItemsRepository.delete({
      fk_shipping_order_item_id: shippingOrderItemId,
    });
  }

  async getPackageItemSummary(packageSpecId: number) {
    const query = `
      SELECT 
        COUNT(*) as total_items,
        COALESCE(SUM(qty), 0) as total_quantity
      FROM ShippingPackageSpecItems 
      WHERE fk_shipping_package_spec_id = ?
    `;

    const result = await this.shippingPackageSpecItemsRepository.query(query, [
      packageSpecId,
    ]);

    return {
      package_spec_id: packageSpecId,
      total_items: parseInt(result[0]?.total_items || 0, 10),
      total_quantity: parseFloat(result[0]?.total_quantity || 0),
    };
  }

  async getItemPackageSummary(shippingOrderItemId: number) {
    const query = `
      SELECT 
        COUNT(*) as total_packages,
        COALESCE(SUM(qty), 0) as total_quantity
      FROM ShippingPackageSpecItems 
      WHERE fk_shipping_order_item_id = ?
    `;

    const result = await this.shippingPackageSpecItemsRepository.query(query, [
      shippingOrderItemId,
    ]);

    return {
      shipping_order_item_id: shippingOrderItemId,
      total_packages: parseInt(result[0]?.total_packages || 0, 10),
      total_quantity: parseFloat(result[0]?.total_quantity || 0),
    };
  }
}
