import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ShippingOrdersEntity } from './shipping-orders.entity';
import {
  CreateShippingOrdersDto,
  UpdateShippingOrdersDto,
} from './shipping-orders.dto';
import { StatusService } from '../status/status.service';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';

@Injectable()
export class ShippingOrdersService {
  constructor(
    @Inject('SHIPPING_ORDERS_REPOSITORY')
    private shippingOrdersRepository: Repository<ShippingOrdersEntity>,
    private statusService: StatusService,
    private serialEncoderService: SerialEncoderService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.shippingOrdersRepository, options);
  }

  findOne(pk_shipping_order_id: number): Promise<ShippingOrdersEntity | null> {
    return this.shippingOrdersRepository.findOne({
      where: { pk_shipping_order_id },
    });
  }

  async findByCustomerId(customerId: number, options: IPaginationOptions) {
    const queryBuilder = this.shippingOrdersRepository
      .createQueryBuilder('shipping_orders')
      .where('shipping_orders.fk_customer_id = :customerId', { customerId })
      .orderBy('shipping_orders.order_date', 'DESC')
      .addOrderBy('shipping_orders.shipping_order_number', 'ASC');

    return paginate(queryBuilder, options);
  }

  async searchShippingOrders(
    searchTerm: string,
    options: IPaginationOptions,
    searchFields: string[] = [
      'shipping_order_number',
      'customer_name',
      'customer_owner_name',
    ],
    matchType: 'partial' | 'exact' | 'phrase' = 'partial',
  ) {
    const cleanSearchTerm = searchTerm
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-_.,@]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const queryBuilder = this.shippingOrdersRepository
      .createQueryBuilder('shipping_orders')
      .leftJoinAndSelect(
        'Customers',
        'customer',
        'shipping_orders.fk_customer_id = customer.pk_customer_id',
      );

    const buildFieldCondition = (field: string, paramName: string): string => {
      switch (field) {
        case 'shipping_order_number':
          return `LOWER(REPLACE(shipping_orders.shipping_order_number, ' ', '')) LIKE :${paramName} OR LOWER(shipping_orders.shipping_order_number) LIKE :${paramName}`;
        case 'customer_name':
          return `LOWER(REPLACE(customer.name, ' ', '')) LIKE :${paramName} OR LOWER(customer.name) LIKE :${paramName}`;
        case 'customer_owner_name':
          return `LOWER(REPLACE(customer.owner_name, ' ', '')) LIKE :${paramName} OR LOWER(customer.owner_name) LIKE :${paramName}`;
        case 'carrier':
          return `LOWER(REPLACE(shipping_orders.carrier, ' ', '')) LIKE :${paramName} OR LOWER(shipping_orders.carrier) LIKE :${paramName}`;
        default:
          return '';
      }
    };

    if (matchType === 'exact') {
      const conditions: string[] = [];
      const parameters: any = {};

      searchFields.forEach((field, index) => {
        const paramName = `exactTerm${index}`;
        const condition = buildFieldCondition(field, paramName);
        if (condition) {
          conditions.push(condition);
          parameters[paramName] = `%${cleanSearchTerm}%`;
        }
      });

      if (conditions.length > 0) {
        queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
      }
    } else if (matchType === 'phrase') {
      const conditions: string[] = [];
      const parameters: any = {};

      searchFields.forEach((field, index) => {
        const paramName = `phraseTerm${index}`;
        const condition = buildFieldCondition(field, paramName);
        if (condition) {
          conditions.push(condition);
          parameters[paramName] = `%${cleanSearchTerm}%`;
        }
      });

      if (conditions.length > 0) {
        queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
      }
    } else {
      const searchWords = cleanSearchTerm
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .map((word) => word.trim());

      if (searchWords.length === 0) {
        queryBuilder.where('1 = 0');
      } else if (searchWords.length === 1) {
        const conditions: string[] = [];
        const parameters: any = {
          singleTerm: `%${searchWords[0]}%`,
        };

        searchFields.forEach((field) => {
          const condition = buildFieldCondition(field, 'singleTerm');
          if (condition) {
            conditions.push(condition);
          }
        });

        if (conditions.length > 0) {
          queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
        }
      } else {
        const parameters: any = {};

        searchWords.forEach((word, wordIndex) => {
          const paramName = `word${wordIndex}`;
          const conditions: string[] = [];

          searchFields.forEach((field) => {
            const condition = buildFieldCondition(field, paramName);
            if (condition) {
              conditions.push(condition);
            }
          });

          parameters[paramName] = `%${word}%`;

          if (wordIndex === 0) {
            queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
          } else {
            queryBuilder.andWhere(`(${conditions.join(' OR ')})`, parameters);
          }
        });
      }
    }

    return paginate(queryBuilder, options);
  }

  async create(
    createShippingOrdersDto: CreateShippingOrdersDto,
  ): Promise<ShippingOrdersEntity> {
    const newShippingOrder = this.shippingOrdersRepository.create({
      fk_customer_id: createShippingOrdersDto.customerID,
      fk_status_id: createShippingOrdersDto.statusID,
      fk_order_id: createShippingOrdersDto.orderID,
      order_date: new Date(createShippingOrdersDto.orderDate),
      expected_ship_date: createShippingOrdersDto.expectedShipDate
        ? new Date(createShippingOrdersDto.expectedShipDate)
        : undefined,
      subtotal: createShippingOrdersDto.subtotal,
      tax_total: createShippingOrdersDto.taxTotal,
      currency: createShippingOrdersDto.currency || 'USD',
      // Package dimensions removed - now handled via ShippingPackageSpecifications
      insurance_value: createShippingOrdersDto.insuranceValue,
      notes: createShippingOrdersDto.notes,
      terms: createShippingOrdersDto.terms,
      tags: createShippingOrdersDto.tags,
      user_owner: createShippingOrdersDto.userOwner,
    });

    const newShippingOrderData = await this.shippingOrdersRepository.save(newShippingOrder);
    
    // Check if shipping order was created from an order (has orderID)
    const orderID = createShippingOrdersDto.orderID;
    let serialEncoderID = -1;

    if (orderID) {
      // Try to find existing serial encoder from the order
      const serialEncoderData = await this.serialEncoderService.findByPurposeOrderId(orderID);
      
      if (serialEncoderData) {
        // Update existing serial encoder to include shipping_order_id
        const serialEncoderPurpose = JSON.stringify({
          ...serialEncoderData.purpose,
          shipping_order_id: newShippingOrderData.pk_shipping_order_id
        });
        
        await this.serialEncoderService.update(serialEncoderData.id, { purpose: serialEncoderPurpose });
        serialEncoderID = serialEncoderData.id;
      } else {
        // Create new serial encoder with order_id and shipping_order_id
        const serialEncoderParams = {
          purpose: JSON.stringify({
            order_id: orderID,
            shipping_order_id: newShippingOrderData.pk_shipping_order_id
          })
        };
        
        const newSerialEncoder = await this.serialEncoderService.create(serialEncoderParams);
        serialEncoderID = newSerialEncoder.id;
      }
    } else {
      // Create new serial encoder with just shipping_order_id
      const serialEncoderParams = {
        purpose: JSON.stringify({
          shipping_order_id: newShippingOrderData.pk_shipping_order_id
        })
      };
      
      const newSerialEncoder = await this.serialEncoderService.create(serialEncoderParams);
      serialEncoderID = newSerialEncoder.id;
    }

    // Update shipping order with serial encoder info
    newShippingOrderData.shipping_order_number = `${serialEncoderID}`;
    newShippingOrderData.fk_serial_encoder_id = serialEncoderID;
    newShippingOrderData.updated_at = new Date();

    return await this.shippingOrdersRepository.save(newShippingOrderData);
  }

  async remove(pk_shipping_order_id: number) {
    return this.shippingOrdersRepository.delete({ pk_shipping_order_id });
  }

  async update(
    id: number,
    updateShippingOrdersDto: UpdateShippingOrdersDto,
  ): Promise<ShippingOrdersEntity | null> {
    const updateData: any = {};

    if (updateShippingOrdersDto.customerID !== undefined) {
      updateData.fk_customer_id = updateShippingOrdersDto.customerID;
    }
    if (updateShippingOrdersDto.statusID !== undefined) {
      updateData.fk_status_id = updateShippingOrdersDto.statusID;
    }
    if (updateShippingOrdersDto.serialEncoderID !== undefined) {
      updateData.fk_serial_encoder_id = updateShippingOrdersDto.serialEncoderID;
    }
    if (updateShippingOrdersDto.shippingOrderNumber !== undefined) {
      updateData.shipping_order_number =
        updateShippingOrdersDto.shippingOrderNumber;
    }
    if (updateShippingOrdersDto.orderDate !== undefined) {
      updateData.order_date = new Date(updateShippingOrdersDto.orderDate);
    }
    if (updateShippingOrdersDto.expectedShipDate !== undefined) {
      updateData.expected_ship_date = updateShippingOrdersDto.expectedShipDate
        ? new Date(updateShippingOrdersDto.expectedShipDate)
        : null;
    }
    if (updateShippingOrdersDto.subtotal !== undefined) {
      updateData.subtotal = updateShippingOrdersDto.subtotal;
    }
    if (updateShippingOrdersDto.taxTotal !== undefined) {
      updateData.tax_total = updateShippingOrdersDto.taxTotal;
    }
    if (updateShippingOrdersDto.currency !== undefined) {
      updateData.currency = updateShippingOrdersDto.currency;
    }
    // Package dimensions removed - now handled via ShippingPackageSpecifications
    if (updateShippingOrdersDto.insuranceValue !== undefined) {
      updateData.insurance_value = updateShippingOrdersDto.insuranceValue;
    }
    if (updateShippingOrdersDto.notes !== undefined) {
      updateData.notes = updateShippingOrdersDto.notes;
    }
    if (updateShippingOrdersDto.terms !== undefined) {
      updateData.terms = updateShippingOrdersDto.terms;
    }
    if (updateShippingOrdersDto.tags !== undefined) {
      updateData.tags = updateShippingOrdersDto.tags;
    }
    if (updateShippingOrdersDto.userOwner !== undefined) {
      updateData.user_owner = updateShippingOrdersDto.userOwner;
    }

    updateData.updated_at = new Date();

    await this.shippingOrdersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async getShippingOrdersStatus() {
    const statusData = await this.statusService.findAll({
      page: 1,
      limit: 100,
    });
    return statusData.items;
  }

  async getShippingOrdersStatusCounts() {
    const query = `
      SELECT 
        s.id as status_id,
        s.process,
        s.status,
        s.color,
        COUNT(so.pk_shipping_order_id) as count
      FROM Status s
      LEFT JOIN ShippingOrders so ON s.id = so.fk_status_id
      GROUP BY s.id, s.process, s.status, s.color
      ORDER BY s.process, s.status;
    `;

    return this.shippingOrdersRepository.query(query);
  }

  async getDashboardMetrics(): Promise<{
    totalShipments: number;
    pendingShipmentCount: number;
  }> {
    const totalShipmentsQuery = `
      SELECT 
        COUNT(*) as total_shipments
      FROM ShippingOrders
    `;

    const pendingShipmentCountQuery = `
      SELECT 
        COUNT(*) as pending_count
      FROM ShippingOrders so
      JOIN Status s ON so.fk_status_id = s.id
      WHERE s.process = 'PENDING'
    `;

    const [totalShipmentsResult, pendingCountResult] = await Promise.all([
      this.shippingOrdersRepository.query(totalShipmentsQuery),
      this.shippingOrdersRepository.query(pendingShipmentCountQuery),
    ]);

    const totalShipments = parseInt(
      totalShipmentsResult[0]?.total_shipments || 0,
      10,
    );
    const pendingShipmentCount = parseInt(
      pendingCountResult[0]?.pending_count || 0,
      10,
    );

    return {
      totalShipments,
      pendingShipmentCount,
    };
  }
}
