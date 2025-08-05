import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ProductionOrderItemsEntity } from './production-order-items.entity';
import {
  CreateProductionOrderItemDto,
  UpdateProductionOrderItemDto,
  SearchProductionOrderItemsDto,
} from './production-order-items.dto';

@Injectable()
export class ProductionOrderItemsService {
  constructor(
    @Inject('PRODUCTION_ORDER_ITEMS_REPOSITORY')
    private productionOrderItemsRepository: Repository<ProductionOrderItemsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    const result = await paginate(
      this.productionOrderItemsRepository,
      options,
      {
        order: { created_at: 'DESC' },
      },
    );

    // Fetch related data for each item
    const itemsWithRelatedData = await Promise.all(
      result.items.map(async (item) => {
        // Get knit colors IDs
        const knitColors = await this.productionOrderItemsRepository.query(
          'SELECT pk_production_orders_knit_color_id FROM ProductionOrdersKnitColors WHERE fk_production_order_item_id = ?',
          [item.pk_production_order_item_id],
        );

        // Get body colors IDs
        const bodyColors = await this.productionOrderItemsRepository.query(
          'SELECT pk_production_orders_body_color_id FROM ProductionOrdersBodyColors WHERE fk_production_order_item_id = ?',
          [item.pk_production_order_item_id],
        );

        // Get packaging IDs
        const packaging = await this.productionOrderItemsRepository.query(
          'SELECT pk_production_orders_packaging_id FROM ProductionOrdersPackaging WHERE fk_production_order_item_id = ?',
          [item.pk_production_order_item_id],
        );

        return {
          ...item,
          knitcolors_production_order: knitColors.map(
            (k) => k.pk_production_orders_knit_color_id,
          ),
          body_production_order_color: bodyColors.map(
            (b) => b.pk_production_orders_body_color_id,
          ),
          packaging_production_order: packaging.map(
            (p) => p.pk_production_orders_packaging_id,
          ),
        };
      }),
    );

    return {
      ...result,
      items: itemsWithRelatedData,
    };
  }

  async findAllByProductionOrderId(
    productionOrderId: number,
    options: IPaginationOptions,
  ) {
    const result = await paginate(
      this.productionOrderItemsRepository,
      options,
      {
        where: { fk_production_order_id: productionOrderId },
        order: { created_at: 'DESC' },
      },
    );

    // Fetch related data for each item
    const itemsWithRelatedData = await Promise.all(
      result.items.map(async (item) => {
        // Get knit colors IDs
        const knitColors = await this.productionOrderItemsRepository.query(
          'SELECT pk_production_orders_knit_color_id FROM ProductionOrdersKnitColors WHERE fk_production_order_item_id = ?',
          [item.pk_production_order_item_id],
        );

        // Get body colors IDs
        const bodyColors = await this.productionOrderItemsRepository.query(
          'SELECT pk_production_orders_body_color_id FROM ProductionOrdersBodyColors WHERE fk_production_order_item_id = ?',
          [item.pk_production_order_item_id],
        );

        // Get packaging IDs
        const packaging = await this.productionOrderItemsRepository.query(
          'SELECT pk_production_orders_packaging_id FROM ProductionOrdersPackaging WHERE fk_production_order_item_id = ?',
          [item.pk_production_order_item_id],
        );

        return {
          ...item,
          knitcolors_production_order: knitColors.map(
            (k) => k.pk_production_orders_knit_color_id,
          ),
          body_production_order_color: bodyColors.map(
            (b) => b.pk_production_orders_body_color_id,
          ),
          packaging_production_order: packaging.map(
            (p) => p.pk_production_orders_packaging_id,
          ),
        };
      }),
    );

    return {
      ...result,
      items: itemsWithRelatedData,
    };
  }

  async findOne(
    pk_production_order_item_id: number,
  ): Promise<ProductionOrderItemsEntity | null> {
    const item = await this.productionOrderItemsRepository.findOne({
      where: { pk_production_order_item_id },
    });

    if (!item) {
      return null;
    }

    // Get knit colors IDs
    const knitColors = await this.productionOrderItemsRepository.query(
      'SELECT pk_production_orders_knit_color_id FROM ProductionOrdersKnitColors WHERE fk_production_order_item_id = ?',
      [item.pk_production_order_item_id],
    );

    // Get body colors IDs
    const bodyColors = await this.productionOrderItemsRepository.query(
      'SELECT pk_production_orders_body_color_id FROM ProductionOrdersBodyColors WHERE fk_production_order_item_id = ?',
      [item.pk_production_order_item_id],
    );

    // Get packaging IDs
    const packaging = await this.productionOrderItemsRepository.query(
      'SELECT pk_production_orders_packaging_id FROM ProductionOrdersPackaging WHERE fk_production_order_item_id = ?',
      [item.pk_production_order_item_id],
    );

    return {
      ...item,
      knitcolors_production_order: knitColors.map(
        (k) => k.pk_production_orders_knit_color_id,
      ),
      body_production_order_color: bodyColors.map(
        (b) => b.pk_production_orders_body_color_id,
      ),
      packaging_production_order: packaging.map(
        (p) => p.pk_production_orders_packaging_id,
      ),
    };
  }

  async create(
    productionOrderItemDto: CreateProductionOrderItemDto,
  ): Promise<ProductionOrderItemsEntity> {
    const newProductionOrderItem = new ProductionOrderItemsEntity();

    newProductionOrderItem.fk_production_order_id =
      productionOrderItemDto.fkProductionOrderID;
    newProductionOrderItem.fk_product_id = productionOrderItemDto.fkProductID;
    newProductionOrderItem.fk_category_id = productionOrderItemDto.fkCategoryID;
    newProductionOrderItem.item_name = productionOrderItemDto.itemName;
    newProductionOrderItem.item_description =
      productionOrderItemDto.itemDescription || null;
    newProductionOrderItem.item_number =
      productionOrderItemDto.itemNumber || null;
    newProductionOrderItem.size = productionOrderItemDto.size || null;
    newProductionOrderItem.quantity = productionOrderItemDto.quantity;
    newProductionOrderItem.unit_price = productionOrderItemDto.unitPrice;
    newProductionOrderItem.tax_rate = productionOrderItemDto.taxRate || 0.0;

    newProductionOrderItem.created_at = new Date();
    newProductionOrderItem.updated_at = new Date();

    return this.productionOrderItemsRepository.save(newProductionOrderItem);
  }

  async remove(id: number) {
    return await this.productionOrderItemsRepository.delete(id);
  }

  async update(
    pk_production_order_item_id: number,
    updateProductionOrderItemDto: UpdateProductionOrderItemDto,
  ): Promise<ProductionOrderItemsEntity> {
    const toUpdate = await this.productionOrderItemsRepository.findOne({
      where: { pk_production_order_item_id },
    });

    if (!toUpdate) {
      throw new BadRequestException('Production order item not found');
    }

    const updated = Object.assign(toUpdate, {
      fk_production_order_id:
        updateProductionOrderItemDto.fkProductionOrderID ??
        toUpdate.fk_production_order_id,
      fk_product_id:
        updateProductionOrderItemDto.fkProductID ?? toUpdate.fk_product_id,
      fk_category_id:
        updateProductionOrderItemDto.fkCategoryID ?? toUpdate.fk_category_id,
      item_name: updateProductionOrderItemDto.itemName ?? toUpdate.item_name,
      item_description:
        updateProductionOrderItemDto.itemDescription ??
        toUpdate.item_description,
      item_number:
        updateProductionOrderItemDto.itemNumber ?? toUpdate.item_number,
      size: updateProductionOrderItemDto.size ?? toUpdate.size,
      quantity: updateProductionOrderItemDto.quantity ?? toUpdate.quantity,
      unit_price: updateProductionOrderItemDto.unitPrice ?? toUpdate.unit_price,
      tax_rate: updateProductionOrderItemDto.taxRate ?? toUpdate.tax_rate,
      updated_at: new Date(),
    });

    return this.productionOrderItemsRepository.save(updated);
  }

  async searchProductionOrderItems(searchDto: SearchProductionOrderItemsDto) {
    const { q, page = 1, limit = 10 } = searchDto;

    if (!q || q.trim() === '') {
      return this.findAll({ page, limit });
    }

    const queryBuilder =
      this.productionOrderItemsRepository.createQueryBuilder('poi');

    queryBuilder
      .where('poi.item_name LIKE :search', { search: `%${q}%` })
      .orWhere('poi.item_description LIKE :search', { search: `%${q}%` })
      .orWhere('poi.item_number LIKE :search', { search: `%${q}%` })
      .orderBy('poi.created_at', 'DESC');

    return paginate(queryBuilder, { page, limit });
  }
}
