import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ShippingOrderItemsEntity } from './shipping-order-items.entity';
import {
  CreateShippingOrderItemsDto,
  UpdateShippingOrderItemsDto,
} from './shipping-order-items.dto';

@Injectable()
export class ShippingOrderItemsService {
  constructor(
    @Inject('SHIPPING_ORDER_ITEMS_REPOSITORY')
    private shippingOrderItemsRepository: Repository<ShippingOrderItemsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.shippingOrderItemsRepository, options);
  }

  findOne(
    pk_shipping_order_item_id: number,
  ): Promise<ShippingOrderItemsEntity | null> {
    return this.shippingOrderItemsRepository.findOne({
      where: { pk_shipping_order_item_id },
    });
  }

  async findByShippingOrderId(
    shippingOrderId: number,
    options: IPaginationOptions,
  ) {
    const query = `
      SELECT 
        soi.pk_shipping_order_item_id,
        soi.fk_shipping_order_id,
        soi.fk_product_id,
        soi.fk_packaging_id,
        soi.fk_trim_id,
        soi.fk_yarn_id,
        soi.item_number,
        soi.item_name,
        soi.item_description,
        soi.quantity,
        soi.unit_price,
        soi.tax_rate,
        soi.created_at,
        soi.updated_at,
        p.product_name,
        p.fk_category_id as product_category_id,
        pk.packaging,
        t.trim,
        y.yarn_color,
        so.shipping_order_number,
        so.order_date,
        so.expected_ship_date,
        so.subtotal,
        so.tax_total,
        so.total_amount,
        so.currency,
        so.insurance_value,
        so.notes,
        so.terms,
        so.tags,
        so.user_owner
      FROM ShippingOrderItems soi
      LEFT JOIN Products p ON soi.fk_product_id = p.pk_product_id
      LEFT JOIN Packaging pk ON soi.fk_packaging_id = pk.pk_packaging_id
      LEFT JOIN Trims t ON soi.fk_trim_id = t.pk_trim_id
      LEFT JOIN Yarn y ON soi.fk_yarn_id = y.pk_yarn_id
      LEFT JOIN ShippingOrders so ON soi.fk_shipping_order_id = so.pk_shipping_order_id
      WHERE soi.fk_shipping_order_id = ?
      ORDER BY soi.created_at ASC
    `;

    try {
      const results = await this.shippingOrderItemsRepository.query(query, [
        shippingOrderId,
      ]);

      // Transform the results to match the expected format
      const transformedResults = results.map((row: any) => ({
        pk_shipping_order_item_id: row.pk_shipping_order_item_id,
        fk_shipping_order_id: row.fk_shipping_order_id,
        fk_product_id: row.fk_product_id,
        fk_packaging_id: row.fk_packaging_id,
        fk_trim_id: row.fk_trim_id,
        fk_yarn_id: row.fk_yarn_id,
        item_number: row.item_number,
        item_name: row.item_name,
        item_description: row.item_description,
        quantity: row.quantity,
        unit_price: row.unit_price,
        tax_rate: row.tax_rate,
        created_at: row.created_at,
        updated_at: row.updated_at,
        // Related data
        product_data: row.fk_product_id
          ? {
              pk_product_id: row.fk_product_id,
              product_name: row.product_name,
              fk_category_id: row.product_category_id,
            }
          : null,
        packaging_data: row.fk_packaging_id
          ? {
              pk_packaging_id: row.fk_packaging_id,
              packaging_name: row.packaging,
            }
          : null,
        trims_data: row.fk_trim_id
          ? {
              pk_trim_id: row.fk_trim_id,
              trim_name: row.trim,
            }
          : null,
        yarn_data: row.fk_yarn_id
          ? {
              pk_yarn_id: row.fk_yarn_id,
              yarn_name: row.yarn_color,
            }
          : null,
        shipping_order_data: {
          pk_shipping_order_id: row.fk_shipping_order_id,
          shipping_order_number: row.shipping_order_number,
          order_date: row.order_date,
          expected_ship_date: row.expected_ship_date,
          subtotal: row.subtotal,
          tax_total: row.tax_total,
          total_amount: row.total_amount,
          currency: row.currency,
          insurance_value: row.insurance_value,
          notes: row.notes,
          terms: row.terms,
          tags: row.tags,
          user_owner: row.user_owner,
        },
      }));

      // Manual pagination
      const page = Number(options.page) || 1;
      const limit = Number(options.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = transformedResults.slice(startIndex, endIndex);

      return {
        items: paginatedResults,
        meta: {
          itemCount: paginatedResults.length,
          totalItems: transformedResults.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(transformedResults.length / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error('Error in findByShippingOrderId:', error);
      throw error;
    }
  }

  async create(
    createShippingOrderItemsDto: CreateShippingOrderItemsDto,
  ): Promise<ShippingOrderItemsEntity> {
    const newShippingOrderItem = this.shippingOrderItemsRepository.create({
      fk_shipping_order_id: createShippingOrderItemsDto.fkShippingOrderID,
      fk_product_id: createShippingOrderItemsDto.fkProductID,
      fk_packaging_id: createShippingOrderItemsDto.fkPackagingID,
      fk_trim_id: createShippingOrderItemsDto.fkTrimID,
      fk_yarn_id: createShippingOrderItemsDto.fkYarnID,
      item_number: createShippingOrderItemsDto.itemNumber,
      item_name: createShippingOrderItemsDto.itemName,
      item_description: createShippingOrderItemsDto.itemDescription,
      quantity: createShippingOrderItemsDto.quantity,
      unit_price: createShippingOrderItemsDto.unitPrice,
      tax_rate: createShippingOrderItemsDto.taxRate,
    });

    return this.shippingOrderItemsRepository.save(newShippingOrderItem);
  }

  async remove(pk_shipping_order_item_id: number) {
    return this.shippingOrderItemsRepository.delete({
      pk_shipping_order_item_id,
    });
  }

  async update(
    id: number,
    updateShippingOrderItemsDto: UpdateShippingOrderItemsDto,
  ) {
    const updateData: any = {};

    if (updateShippingOrderItemsDto.fkProductID !== undefined) {
      updateData.fk_product_id = updateShippingOrderItemsDto.fkProductID;
    }
    if (updateShippingOrderItemsDto.fkPackagingID !== undefined) {
      updateData.fk_packaging_id = updateShippingOrderItemsDto.fkPackagingID;
    }
    if (updateShippingOrderItemsDto.fkTrimID !== undefined) {
      updateData.fk_trim_id = updateShippingOrderItemsDto.fkTrimID;
    }
    if (updateShippingOrderItemsDto.fkYarnID !== undefined) {
      updateData.fk_yarn_id = updateShippingOrderItemsDto.fkYarnID;
    }
    if (updateShippingOrderItemsDto.itemNumber !== undefined) {
      updateData.item_number = updateShippingOrderItemsDto.itemNumber;
    }
    if (updateShippingOrderItemsDto.itemName !== undefined) {
      updateData.item_name = updateShippingOrderItemsDto.itemName;
    }
    if (updateShippingOrderItemsDto.itemDescription !== undefined) {
      updateData.item_description = updateShippingOrderItemsDto.itemDescription;
    }
    if (updateShippingOrderItemsDto.quantity !== undefined) {
      updateData.quantity = updateShippingOrderItemsDto.quantity;
    }
    if (updateShippingOrderItemsDto.unitPrice !== undefined) {
      updateData.unit_price = updateShippingOrderItemsDto.unitPrice;
    }
    if (updateShippingOrderItemsDto.taxRate !== undefined) {
      updateData.tax_rate = updateShippingOrderItemsDto.taxRate;
    }

    updateData.updated_at = new Date();

    await this.shippingOrderItemsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async removeByShippingOrderId(shippingOrderId: number) {
    return this.shippingOrderItemsRepository.delete({
      fk_shipping_order_id: shippingOrderId,
    });
  }

  async getShippingOrderTotals(shippingOrderId: number) {
    const query = `
      SELECT 
        COUNT(*) as total_items,
        COALESCE(SUM(quantity), 0) as total_quantity
      FROM ShippingOrderItems 
      WHERE fk_shipping_order_id = ?
    `;

    const result = await this.shippingOrderItemsRepository.query(query, [
      shippingOrderId,
    ]);

    return {
      shipping_order_id: shippingOrderId,
      total_items: parseInt(result[0]?.total_items || 0, 10),
      total_quantity: parseFloat(result[0]?.total_quantity || 0),
    };
  }
}
