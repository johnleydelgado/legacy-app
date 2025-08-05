import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { PurchaseOrdersEntity, PurchaseOrderPriority } from './purchase-orders.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderKpiDto, OverallKpiResponse, StatusBreakdownResponse, PriorityBreakdownResponse, TrendDataResponse, TopEntityResponse, ComprehensiveKpiResponse, SearchPurchaseOrderResponse, SearchPurchaseOrdersDto } from './purchase-orders.dto';
import * as moment from 'moment';
import { isValidJSON } from 'src/utils/string_tools';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';


@Injectable()
export class PurchaseOrdersService {
  constructor(
    @Inject('PURCHASE_ORDERS_REPOSITORY')
    private purchaseOrdersRepository: Repository<PurchaseOrdersEntity>,
    private serialEncoderService: SerialEncoderService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.purchaseOrdersRepository, options);
  }

  findOne(pk_purchase_order_id: number): Promise<PurchaseOrdersEntity | null> {
    return this.purchaseOrdersRepository.findOne({ where: { pk_purchase_order_id } });
  }

  async countByLeadNumberId(leadNumberId: number): Promise<number> {
    return await this.purchaseOrdersRepository.count({
      where: { fk_lead_numbers_id: leadNumberId }
    });
  }

  async create(purchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrdersEntity | null> {
    const newPurchaseOrder = new PurchaseOrdersEntity()

    const normalizeQuoteApprovedDate = moment(purchaseOrderDto.quoteApprovedDate, 'YYYY-MM-DD');
    const normalizePdSignedDate = moment(purchaseOrderDto.pdSignedDate, 'YYYY-MM-DD');
    const normalizeShippingDate = moment(purchaseOrderDto.shippingDate, 'YYYY-MM-DD');

    newPurchaseOrder.fk_customer_id = purchaseOrderDto.fkCustomerID;
    newPurchaseOrder.fk_vendor_id = purchaseOrderDto.fkVendorID;
    newPurchaseOrder.fk_factory_id = purchaseOrderDto.fkFactoryID;
    newPurchaseOrder.fk_location_type_id = purchaseOrderDto.fkLocationTypeID;
    newPurchaseOrder.fk_lead_numbers_id = purchaseOrderDto.fKLeadNumbersID;
    newPurchaseOrder.fk_shipping_method_id = purchaseOrderDto.fkShippingMethodID;
    newPurchaseOrder.status = purchaseOrderDto.status;
    newPurchaseOrder.priority = purchaseOrderDto.priority;
    newPurchaseOrder.client_name = purchaseOrderDto.clientName;
    newPurchaseOrder.client_description = purchaseOrderDto.clientDescription;
    newPurchaseOrder.quote_approved_date = normalizeQuoteApprovedDate.toDate();
    newPurchaseOrder.pd_signed_date = normalizePdSignedDate.toDate();
    newPurchaseOrder.shipping_date = normalizeShippingDate.toDate();
    newPurchaseOrder.total_quantity = purchaseOrderDto.totalQuantity;
    newPurchaseOrder.notes = purchaseOrderDto.notes;
    newPurchaseOrder.tags = isValidJSON(purchaseOrderDto.tags) ? JSON.parse(purchaseOrderDto.tags) : {};
    newPurchaseOrder.user_owner = purchaseOrderDto.userOwner;

    newPurchaseOrder.created_at = new Date();
    newPurchaseOrder.updated_at = new Date();

    const newPurchaseOrderData = await this.purchaseOrdersRepository.save(newPurchaseOrder);
    const serialEncoderData = await this.serialEncoderService.findByPurposeOrderId(purchaseOrderDto?.fkOrderID || 0);

    let serialEncoderID = serialEncoderData?.id || -1;

    if (serialEncoderData) {
      const serialEncoderPurpose = JSON.stringify({
        ...serialEncoderData?.purpose,
        purchase_order_ids: [
          ...(serialEncoderData?.purpose?.purchase_order_ids || []),
          newPurchaseOrderData.pk_purchase_order_id
        ]
      });

      await this.serialEncoderService.update(serialEncoderID, { purpose: serialEncoderPurpose })

    } else {
      const serialEncoderParams = {
        purpose: JSON.stringify({
          purchase_order_ids: [newPurchaseOrderData.pk_purchase_order_id]
        })
      };

      const newSerialEncoder = await this.serialEncoderService.create(serialEncoderParams);
      serialEncoderID = newSerialEncoder.id;
    }

    newPurchaseOrderData.purchase_order_number = `${serialEncoderID}-${newPurchaseOrderData.pk_purchase_order_id}`;
    newPurchaseOrderData.fk_serial_encoder_id = serialEncoderID;
    newPurchaseOrderData.updated_at = new Date();

    return this.purchaseOrdersRepository.save(newPurchaseOrderData);
  }

  async remove(id: number) {
    return await this.purchaseOrdersRepository.delete(id);
  }

  async update(pk_purchase_order_id: number, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const toUpdate = await this.purchaseOrdersRepository.findOne({ where: { pk_purchase_order_id } });

    const normalizeQuoteApprovedDate = moment(updatePurchaseOrderDto.quoteApprovedDate, 'YYYY-MM-DD');
    const normalizePdSignedDate = moment(updatePurchaseOrderDto.pdSignedDate, 'YYYY-MM-DD');
    const normalizeShippingDate = moment(updatePurchaseOrderDto.shippingDate, 'YYYY-MM-DD');

    const updated = Object.assign({
      pk_purchase_order_id: toUpdate?.pk_purchase_order_id,
      fk_serial_encoder_id: toUpdate?.fk_serial_encoder_id,
      fk_customer_id: toUpdate?.fk_customer_id,
      fk_vendor_id: toUpdate?.fk_vendor_id,
      fk_factory_id: toUpdate?.fk_factory_id,
      fk_location_type_id: toUpdate?.fk_location_type_id,
      fk_lead_numbers_id: toUpdate?.fk_lead_numbers_id,
      fk_shipping_method_id: toUpdate?.fk_shipping_method_id,
      purchase_order_number: toUpdate?.purchase_order_number,
      status: toUpdate?.status,
      priority: toUpdate?.priority,
      client_name: toUpdate?.client_name,
      client_description: toUpdate?.client_description,
      quote_approved_date: toUpdate?.quote_approved_date,
      pd_signed_date: toUpdate?.pd_signed_date,
      shipping_date: toUpdate?.shipping_date,
      total_quantity: toUpdate?.total_quantity,
      notes: toUpdate?.notes,
      tags: toUpdate?.tags,
      user_owner: toUpdate?.user_owner,
      created_at: toUpdate?.created_at,
      updated_at: toUpdate?.updated_at,
    }, {
      fk_customer_id: updatePurchaseOrderDto.fkCustomerID,
      fk_vendor_id: updatePurchaseOrderDto.fkVendorID,
      fk_factory_id: updatePurchaseOrderDto.fkFactoryID,
      fk_location_type_id: updatePurchaseOrderDto.fkLocationTypeID,
      fk_shipping_method_id: updatePurchaseOrderDto.fkShippingMethodID,
      status: updatePurchaseOrderDto.status,
      priority: updatePurchaseOrderDto.priority,
      client_name: updatePurchaseOrderDto.clientName,
      client_description: updatePurchaseOrderDto.clientDescription,
      quote_approved_date: normalizeQuoteApprovedDate.toDate(),
      pd_signed_date: normalizePdSignedDate.toDate(),
      shipping_date: normalizeShippingDate.toDate(),
      total_quantity: updatePurchaseOrderDto.totalQuantity,
      notes: updatePurchaseOrderDto.notes,
      tags: isValidJSON(updatePurchaseOrderDto.tags) ? JSON.parse(updatePurchaseOrderDto.tags) : toUpdate?.tags,
      updated_at: new Date()
    });

    return await this.purchaseOrdersRepository.save(updated);
  }

  async getOverallKpi(filters: PurchaseOrderKpiDto = {}): Promise<OverallKpiResponse> {
    const whereClause = this.buildWhereClause(filters);
    
    const [orders, totalCount] = await this.purchaseOrdersRepository.findAndCount({ 
      where: whereClause 
    });

    const totalQuantity = orders.reduce((sum, order) => sum + order.total_quantity, 0);
    const averageQuantity = totalCount > 0 ? totalQuantity / totalCount : 0;

    // Calculate average lead time (quote approved to shipping date)
    const leadTimes = orders
      .filter(order => order.quote_approved_date && order.shipping_date)
      .map(order => {
        const quoteDate = new Date(order.quote_approved_date);
        const shippingDate = new Date(order.shipping_date);
        return Math.ceil((shippingDate.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    const averageLeadTime = leadTimes.length > 0 
      ? leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length 
      : 0;

    // Count active vs completed orders (assuming status 1 = active, status 2 = completed)
    const activeOrders = orders.filter(order => order.status === 1).length;
    const completedOrders = orders.filter(order => order.status === 2).length;

    return {
      totalOrders: totalCount,
      totalQuantity,
      averageQuantity: Math.round(averageQuantity * 100) / 100,
      averageLeadTime: Math.round(averageLeadTime * 100) / 100,
      activeOrders,
      completedOrders
    };
  }

  async getStatusBreakdown(filters: PurchaseOrderKpiDto = {}): Promise<StatusBreakdownResponse[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const result = await this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .select('po.status as statusId')
      .addSelect('COUNT(*) as count')
      .where(whereClause)
      .groupBy('po.status')
      .getRawMany();

    const total = result.reduce((sum, item) => sum + parseInt(item.count), 0);

    return result.map(item => ({
      statusId: parseInt(item.statusId),
      statusName: `Status ${item.statusId}`, // You might want to join with status table for actual names
      count: parseInt(item.count),
      percentage: Math.round((parseInt(item.count) / total) * 100 * 100) / 100
    }));
  }

  async getPriorityBreakdown(filters: PurchaseOrderKpiDto = {}): Promise<PriorityBreakdownResponse[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const result = await this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .select('po.priority as priority')
      .addSelect('COUNT(*) as count')
      .where(whereClause)
      .groupBy('po.priority')
      .getRawMany();

    const total = result.reduce((sum, item) => sum + parseInt(item.count), 0);

    return result.map(item => ({
      priority: item.priority as PurchaseOrderPriority,
      count: parseInt(item.count),
      percentage: Math.round((parseInt(item.count) / total) * 100 * 100) / 100
    }));
  }

  async getMonthlyTrends(filters: PurchaseOrderKpiDto = {}): Promise<TrendDataResponse[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const result = await this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .select('DATE_FORMAT(po.created_at, "%Y-%m") as period')
      .addSelect('COUNT(*) as ordersCreated')
      .addSelect('SUM(po.total_quantity) as totalQuantity')
      .addSelect('AVG(DATEDIFF(po.shipping_date, po.quote_approved_date)) as averageLeadTime')
      .where(whereClause)
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return result.map(item => ({
      period: item.period,
      ordersCreated: parseInt(item.ordersCreated),
      totalQuantity: parseInt(item.totalQuantity) || 0,
      averageLeadTime: Math.round((parseFloat(item.averageLeadTime) || 0) * 100) / 100
    }));
  }

  async getTopCustomers(limit: number = 10, filters: PurchaseOrderKpiDto = {}): Promise<TopEntityResponse[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const result = await this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .select('po.fk_customer_id as id')
      .addSelect('COUNT(*) as count')
      .addSelect('SUM(po.total_quantity) as totalQuantity')
      .addSelect('AVG(DATEDIFF(po.shipping_date, po.quote_approved_date)) as averageLeadTime')
      .where(whereClause)
      .groupBy('po.fk_customer_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      id: parseInt(item.id),
      name: `Customer ${item.id}`, // You might want to join with customers table for actual names
      count: parseInt(item.count),
      totalQuantity: parseInt(item.totalQuantity) || 0,
      averageLeadTime: Math.round((parseFloat(item.averageLeadTime) || 0) * 100) / 100
    }));
  }

  async getTopVendors(limit: number = 10, filters: PurchaseOrderKpiDto = {}): Promise<TopEntityResponse[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const result = await this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .select('po.fk_vendor_id as id')
      .addSelect('COUNT(*) as count')
      .addSelect('SUM(po.total_quantity) as totalQuantity')
      .addSelect('AVG(DATEDIFF(po.shipping_date, po.quote_approved_date)) as averageLeadTime')
      .where(whereClause)
      .groupBy('po.fk_vendor_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      id: parseInt(item.id),
      name: `Vendor ${item.id}`, // You might want to join with vendors table for actual names
      count: parseInt(item.count),
      totalQuantity: parseInt(item.totalQuantity) || 0,
      averageLeadTime: Math.round((parseFloat(item.averageLeadTime) || 0) * 100) / 100
    }));
  }

  async getTopFactories(limit: number = 10, filters: PurchaseOrderKpiDto = {}): Promise<TopEntityResponse[]> {
    const whereClause = this.buildWhereClause(filters);
    
    const result = await this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .select('po.fk_factory_id as id')
      .addSelect('COUNT(*) as count')
      .addSelect('SUM(po.total_quantity) as totalQuantity')
      .addSelect('AVG(DATEDIFF(po.shipping_date, po.quote_approved_date)) as averageLeadTime')
      .where(whereClause)
      .groupBy('po.fk_factory_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      id: parseInt(item.id),
      name: `Factory ${item.id}`, // You might want to join with factories table for actual names
      count: parseInt(item.count),
      totalQuantity: parseInt(item.totalQuantity) || 0,
      averageLeadTime: Math.round((parseFloat(item.averageLeadTime) || 0) * 100) / 100
    }));
  }

  async getComprehensiveKpi(filters: PurchaseOrderKpiDto = {}): Promise<ComprehensiveKpiResponse> {
    const [
      overall,
      statusBreakdown,
      priorityBreakdown,
      monthlyTrends,
      topCustomers,
      topVendors,
      topFactories
    ] = await Promise.all([
      this.getOverallKpi(filters),
      this.getStatusBreakdown(filters),
      this.getPriorityBreakdown(filters),
      this.getMonthlyTrends(filters),
      this.getTopCustomers(5, filters),
      this.getTopVendors(5, filters),
      this.getTopFactories(5, filters)
    ]);

    // Calculate performance metrics
    const whereClause = this.buildWhereClause(filters);
    const allOrders = await this.purchaseOrdersRepository.find({ where: whereClause });
    
    const urgentOrders = allOrders.filter(order => order.priority === PurchaseOrderPriority.URGENT);
    const urgentOrdersPercentage = allOrders.length > 0 ? (urgentOrders.length / allOrders.length) * 100 : 0;

    // Calculate on-time delivery rate (orders delivered on or before shipping date)
    const ordersWithDates = allOrders.filter(order => order.shipping_date && order.updated_at);
    const onTimeOrders = ordersWithDates.filter(order => 
      new Date(order.updated_at) <= new Date(order.shipping_date)
    );
    const onTimeDeliveryRate = ordersWithDates.length > 0 ? (onTimeOrders.length / ordersWithDates.length) * 100 : 0;

    // Calculate average processing time (created to updated)
    const processingTimes = allOrders.map(order => {
      const created = new Date(order.created_at);
      const updated = new Date(order.updated_at);
      return Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    });
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    return {
      overall,
      statusBreakdown,
      priorityBreakdown,
      monthlyTrends,
      topCustomers,
      topVendors,
      topFactories,
      performanceMetrics: {
        onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 100) / 100,
        averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
        urgentOrdersPercentage: Math.round(urgentOrdersPercentage * 100) / 100
      }
    };
  }

  async searchPurchaseOrders(searchDto: SearchPurchaseOrdersDto) {
    const { q, page = 1, limit = 10 } = searchDto;
    
    const queryBuilder = this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .leftJoin('Customers', 'customer', 'customer.pk_customer_id = po.fk_customer_id')
      .leftJoin('Vendors', 'vendor', 'vendor.pk_vendor_id = po.fk_vendor_id')
      .leftJoin('Factories', 'factory', 'factory.pk_factories_id = po.fk_factory_id')
      .leftJoin('LocationTypes', 'location_type', 'location_type.pk_location_type_id = po.fk_location_type_id')
      .leftJoin('PurchaseOrderLeadNumbers', 'lead_number', 'lead_number.pk_po_lead_number_id = po.fk_lead_numbers_id')
      .leftJoin('PurchaseOrderShippingMethods', 'shipping_method', 'shipping_method.pk_po_shipping_method_id = po.fk_shipping_method_id')
      .select([
        'po.pk_purchase_order_id',
        'po.fk_serial_encoder_id',
        'po.purchase_order_number',
        'po.status',
        'po.priority',
        'po.client_name',
        'po.created_at',
        'po.updated_at',
        'po.fk_customer_id',
        'po.fk_vendor_id',
        'po.fk_factory_id',
        'po.fk_location_type_id',
        'po.fk_lead_numbers_id',
        'po.fk_shipping_method_id',
        'customer.name as customer_name',
        'vendor.name as vendor_name',
        'factory.name as factory_name',
        'location_type.name as location_type_name',
        'lead_number.name as lead_number_name',
        'shipping_method.name as shipping_method_name'
      ]);

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      
      queryBuilder.where(
        '(CAST(po.pk_purchase_order_id AS CHAR) LIKE :searchTerm OR ' +
        'CAST(po.fk_serial_encoder_id AS CHAR) LIKE :searchTerm OR ' +
        'CAST(po.fk_customer_id AS CHAR) LIKE :searchTerm OR ' +
        'customer.name LIKE :searchTerm OR ' +
        'CAST(po.fk_vendor_id AS CHAR) LIKE :searchTerm OR ' +
        'vendor.name LIKE :searchTerm OR ' +
        'CAST(po.fk_factory_id AS CHAR) LIKE :searchTerm OR ' +
        'factory.name LIKE :searchTerm OR ' +
        'CAST(po.fk_location_type_id AS CHAR) LIKE :searchTerm OR ' +
        'location_type.name LIKE :searchTerm OR ' +
        'CAST(po.fk_lead_numbers_id AS CHAR) LIKE :searchTerm OR ' +
        'lead_number.name LIKE :searchTerm OR ' +
        'CAST(po.fk_shipping_method_id AS CHAR) LIKE :searchTerm OR ' +
        'shipping_method.name LIKE :searchTerm OR ' +
        'po.purchase_order_number LIKE :searchTerm OR ' +
        'CAST(po.status AS CHAR) LIKE :searchTerm OR ' +
        'po.priority LIKE :searchTerm OR ' +
        'po.client_name LIKE :searchTerm)',
        { searchTerm }
      );
    }

    queryBuilder
      .orderBy('po.created_at', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    // Get count for pagination
    const countQueryBuilder = this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .leftJoin('Customers', 'customer', 'customer.pk_customer_id = po.fk_customer_id')
      .leftJoin('Vendors', 'vendor', 'vendor.pk_vendor_id = po.fk_vendor_id')
      .leftJoin('Factories', 'factory', 'factory.pk_factories_id = po.fk_factory_id')
      .leftJoin('LocationTypes', 'location_type', 'location_type.pk_location_type_id = po.fk_location_type_id')
      .leftJoin('PurchaseOrderLeadNumbers', 'lead_number', 'lead_number.pk_po_lead_number_id = po.fk_lead_numbers_id')
      .leftJoin('PurchaseOrderShippingMethods', 'shipping_method', 'shipping_method.pk_po_shipping_method_id = po.fk_shipping_method_id');

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      countQueryBuilder.where(
        '(CAST(po.pk_purchase_order_id AS CHAR) LIKE :searchTerm OR ' +
        'CAST(po.fk_serial_encoder_id AS CHAR) LIKE :searchTerm OR ' +
        'CAST(po.fk_customer_id AS CHAR) LIKE :searchTerm OR ' +
        'customer.name LIKE :searchTerm OR ' +
        'CAST(po.fk_vendor_id AS CHAR) LIKE :searchTerm OR ' +
        'vendor.name LIKE :searchTerm OR ' +
        'CAST(po.fk_factory_id AS CHAR) LIKE :searchTerm OR ' +
        'factory.name LIKE :searchTerm OR ' +
        'CAST(po.fk_location_type_id AS CHAR) LIKE :searchTerm OR ' +
        'location_type.name LIKE :searchTerm OR ' +
        'CAST(po.fk_lead_numbers_id AS CHAR) LIKE :searchTerm OR ' +
        'lead_number.name LIKE :searchTerm OR ' +
        'CAST(po.fk_shipping_method_id AS CHAR) LIKE :searchTerm OR ' +
        'shipping_method.name LIKE :searchTerm OR ' +
        'po.purchase_order_number LIKE :searchTerm OR ' +
        'CAST(po.status AS CHAR) LIKE :searchTerm OR ' +
        'po.priority LIKE :searchTerm OR ' +
        'po.client_name LIKE :searchTerm)',
        { searchTerm }
      );
    }

    const [results, total] = await Promise.all([
      queryBuilder.getRawMany(),
      countQueryBuilder.getCount()
    ]);

    const searchResults = results.map(result => ({
      pk_purchase_order_id: result.po_pk_purchase_order_id,
      purchase_order_number: result.po_purchase_order_number,
      customer: {
        id: result.po_fk_customer_id,
        name: result.customer_name
      },
      vendor: {
        id: result.po_fk_vendor_id,
        name: result.vendor_name
      },
      factory: {
        id: result.po_fk_factory_id,
        name: result.factory_name
      },
      location_type: {
        id: result.po_fk_location_type_id,
        name: result.location_type_name
      },
      lead_number: {
        id: result.po_fk_lead_numbers_id,
        name: result.lead_number_name
      },
      shipping_method: {
        id: result.po_fk_shipping_method_id,
        name: result.shipping_method_name
      },
      status: result.po_status,
      priority: result.po_priority,
      client_name: result.po_client_name,
      created_at: result.po_created_at,
      updated_at: result.po_updated_at
    }));

    return {
      items: searchResults,
      meta: {
        totalItems: total,
        itemCount: searchResults.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    };
  }

  private buildWhereClause(filters: PurchaseOrderKpiDto): any {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) {
        where.created_at = { ...where.created_at, ...MoreThanOrEqual(new Date(filters.startDate)) };
      }
      if (filters.endDate) {
        where.created_at = { ...where.created_at, ...LessThanOrEqual(new Date(filters.endDate)) };
      }
    }

    if (filters.customerId) {
      where.fk_customer_id = filters.customerId;
    }

    if (filters.vendorId) {
      where.fk_vendor_id = filters.vendorId;
    }

    if (filters.factoryId) {
      where.fk_factory_id = filters.factoryId;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }
}
