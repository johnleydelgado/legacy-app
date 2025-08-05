import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import {
  ProductionOrdersEntity,
  ProductionOrderShippingMethod,
  ProductionOrderStatus,
} from './production-orders.entity';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  SearchProductionOrdersDto,
} from './production-orders.dto';
import * as moment from 'moment';

@Injectable()
export class ProductionOrdersService {
  constructor(
    @Inject('PRODUCTION_ORDERS_REPOSITORY')
    private productionOrdersRepository: Repository<ProductionOrdersEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.productionOrdersRepository, options, {
      order: { created_at: 'DESC' },
    });
  }

  findOne(
    pk_production_order_id: number,
  ): Promise<ProductionOrdersEntity | null> {
    return this.productionOrdersRepository.findOne({
      where: { pk_production_order_id },
    });
  }

  async create(
    productionOrderDto: CreateProductionOrderDto,
  ): Promise<ProductionOrdersEntity> {
    const newProductionOrder = new ProductionOrdersEntity();

    const normalizeOrderDate = moment(
      productionOrderDto.order_date,
      'YYYY-MM-DD',
    );
    const normalizeExpectedDeliveryDate = moment(
      productionOrderDto.expected_delivery_date,
      'YYYY-MM-DD',
    );
    const normalizeActualDeliveryDate = productionOrderDto.actual_delivery_date
      ? moment(productionOrderDto.actual_delivery_date, 'YYYY-MM-DD')
      : null;

    newProductionOrder.fk_customer_id = productionOrderDto.fk_customer_id;
    newProductionOrder.fk_factory_id = productionOrderDto.fk_factory_id;
    newProductionOrder.po_number = productionOrderDto.po_number;
    newProductionOrder.order_date = normalizeOrderDate.toDate();
    newProductionOrder.expected_delivery_date =
      normalizeExpectedDeliveryDate.toDate();
    newProductionOrder.actual_delivery_date =
      normalizeActualDeliveryDate?.toDate() || null;
    newProductionOrder.shipping_method =
      productionOrderDto.shipping_method || ProductionOrderShippingMethod.OCEAN;
    newProductionOrder.status =
      productionOrderDto.status || ProductionOrderStatus.PENDING;
    newProductionOrder.total_quantity = productionOrderDto.total_quantity || 0;
    newProductionOrder.total_amount = productionOrderDto.total_amount || 0;
    newProductionOrder.notes = productionOrderDto.notes || null;
    newProductionOrder.user_owner = productionOrderDto.user_owner || null;
    newProductionOrder.created_at = new Date();
    newProductionOrder.updated_at = new Date();

    return this.productionOrdersRepository.save(newProductionOrder);
  }

  async remove(id: number) {
    return await this.productionOrdersRepository.delete(id);
  }

  async update(
    pk_production_order_id: number,
    updateProductionOrderDto: UpdateProductionOrderDto,
  ): Promise<ProductionOrdersEntity> {
    const toUpdate = await this.productionOrdersRepository.findOne({
      where: { pk_production_order_id },
    });

    if (!toUpdate) {
      throw new BadRequestException('Production order not found');
    }

    const normalizeOrderDate = updateProductionOrderDto.order_date
      ? moment(updateProductionOrderDto.order_date, 'YYYY-MM-DD').toDate()
      : toUpdate.order_date;

    const normalizeExpectedDeliveryDate =
      updateProductionOrderDto.expected_delivery_date
        ? moment(
            updateProductionOrderDto.expected_delivery_date,
            'YYYY-MM-DD',
          ).toDate()
        : toUpdate.expected_delivery_date;

    const normalizeActualDeliveryDate =
      updateProductionOrderDto.actual_delivery_date
        ? moment(
            updateProductionOrderDto.actual_delivery_date,
            'YYYY-MM-DD',
          ).toDate()
        : toUpdate.actual_delivery_date;

    const updated = Object.assign(toUpdate, {
      fk_customer_id:
        updateProductionOrderDto.fk_customer_id ?? toUpdate.fk_customer_id,
      fk_factory_id:
        updateProductionOrderDto.fk_factory_id ?? toUpdate.fk_factory_id,
      po_number: updateProductionOrderDto.po_number ?? toUpdate.po_number,
      order_date: normalizeOrderDate,
      expected_delivery_date: normalizeExpectedDeliveryDate,
      actual_delivery_date: normalizeActualDeliveryDate,
      shipping_method:
        updateProductionOrderDto.shipping_method ?? toUpdate.shipping_method,
      status: updateProductionOrderDto.status ?? toUpdate.status,
      total_quantity:
        updateProductionOrderDto.total_quantity ?? toUpdate.total_quantity,
      total_amount:
        updateProductionOrderDto.total_amount ?? toUpdate.total_amount,
      notes: updateProductionOrderDto.notes ?? toUpdate.notes,
      user_owner: updateProductionOrderDto.user_owner ?? toUpdate.user_owner,
      updated_at: new Date(),
    });

    return this.productionOrdersRepository.save(updated);
  }

  async searchProductionOrders(searchDto: SearchProductionOrdersDto) {
    const { q, page = 1, limit = 10 } = searchDto;

    const queryBuilder = this.productionOrdersRepository
      .createQueryBuilder('po')
      .leftJoin(
        'Factories',
        'factory',
        'factory.pk_factories_id = po.fk_factory_id',
      )
      .leftJoin(
        'Customers',
        'customer',
        'customer.pk_customer_id = po.fk_customer_id',
      )
      .select([
        'po.pk_production_order_id',
        'po.po_number',
        'po.order_date',
        'po.expected_delivery_date',
        'po.actual_delivery_date',
        'po.shipping_method',
        'po.status',
        'po.total_quantity',
        'po.total_amount',
        'po.notes',
        'po.user_owner',
        'po.created_at',
        'po.updated_at',
        'po.fk_customer_id',
        'po.fk_factory_id',
        'customer.name as customer_name',
        'factory.name as factory_name',
      ]);

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;

      queryBuilder.where(
        '(po.po_number LIKE :searchTerm OR ' +
          'po.notes LIKE :searchTerm OR ' +
          'po.user_owner LIKE :searchTerm OR ' +
          'customer.name LIKE :searchTerm OR ' +
          'factory.name LIKE :searchTerm)',
        { searchTerm },
      );
    }

    queryBuilder
      .orderBy('po.created_at', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    // Get count for pagination
    const countQueryBuilder = this.productionOrdersRepository
      .createQueryBuilder('po')
      .leftJoin(
        'Factories',
        'factory',
        'factory.pk_factories_id = po.fk_factory_id',
      )
      .leftJoin(
        'Customers',
        'customer',
        'customer.pk_customer_id = po.fk_customer_id',
      );

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      countQueryBuilder.where(
        '(po.po_number LIKE :searchTerm OR ' +
          'po.notes LIKE :searchTerm OR ' +
          'po.user_owner LIKE :searchTerm OR ' +
          'customer.name LIKE :searchTerm OR ' +
          'factory.name LIKE :searchTerm)',
        { searchTerm },
      );
    }

    const [results, total] = await Promise.all([
      queryBuilder.getRawMany(),
      countQueryBuilder.getCount(),
    ]);

    const searchResults = results.map((result) => {
      return {
        pk_production_order_id: result.po_pk_production_order_id,
        po_number: result.po_po_number,
        order_date: result.po_order_date,
        expected_delivery_date: result.po_expected_delivery_date,
        actual_delivery_date: result.po_actual_delivery_date,
        shipping_method: result.po_shipping_method,
        status: result.po_status,
        total_quantity: result.po_total_quantity,
        total_amount: result.po_total_amount,
        notes: result.po_notes,
        user_owner: result.po_user_owner,
        created_at: result.po_created_at,
        updated_at: result.po_updated_at,
        customer: {
          id: result.po_fk_customer_id,
          name: result.customer_name,
        },
        factory: {
          id: result.po_fk_factory_id,
          name: result.factory_name,
        },
      };
    });

    return {
      data: searchResults,
      meta: {
        totalItems: total,
        itemCount: searchResults.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }
}
