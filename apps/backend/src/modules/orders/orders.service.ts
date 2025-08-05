import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrdersEntity } from './orders.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { CreateOrdersDto, DashboardMetricDto, UpdateOrdersDto } from './orders.dto';
import * as moment from 'moment';
import { isValidJSON } from '../../utils/string_tools';
import { UpdateQuotesDto } from '../quotes/quotes.dto';
import {
  CustomerOrderKPIs,
  DashboardMetric,
  MonthlyTrend,
  OwnerBreakdownItem,
  ProcessSummaryItem,
} from './orders.types';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';


@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDERS_REPOSITORY')
    private ordersRepository: Repository<OrdersEntity>,
    private serialEncodeServices: SerialEncoderService,
  ) {}

  async findAll(options: IPaginationOptions & { sort?: any; filter?: any }) {
    const { sort, filter, ...paginationOptions } = options;
    
    const queryBuilder = this.ordersRepository.createQueryBuilder('orders')
      .leftJoin('Status', 'status', 'status.id = orders.fk_status_id')
      .leftJoin('Customers', 'customer', 'customer.pk_customer_id = orders.fk_customer_id');

    // Apply filters
    if (filter && filter.status) {
        // Filter by status name using the joined status table
        queryBuilder.andWhere('status.status = :statusFilter', { statusFilter: filter.status });    
    }
    
    if (filter && filter.user_owner) {
      queryBuilder.andWhere('orders.user_owner = :userOwnerFilter', { userOwnerFilter: filter.user_owner });
    }
    

    // Apply sorting
    if (sort) {
      const sortField = Object.keys(sort)[0];
      const sortDirection = sort[sortField];
      
      switch (sortField) {
        case 'pk_order_id':
          queryBuilder.orderBy('orders.pk_order_id', sortDirection);
          break;
        case 'order_number':
          queryBuilder.orderBy('orders.order_number', sortDirection);
          break;
        case 'order_date':
          queryBuilder.orderBy('orders.order_date', sortDirection);
          break;
        case 'delivery_date':
          queryBuilder.orderBy('orders.delivery_date', sortDirection);
          break;
        case 'total_amount':
          queryBuilder.orderBy('orders.total_amount', sortDirection);
          break;
        case 'user_owner':
          queryBuilder.orderBy('orders.user_owner', sortDirection);
          break;
        case 'customer_name':
          queryBuilder.orderBy('customer.name', sortDirection);
          break;
        case 'status':
          queryBuilder.orderBy('status.status', sortDirection);
          break;
        default:
          queryBuilder.orderBy('orders.order_date', 'DESC');
      }
    } else {
      queryBuilder.orderBy('orders.order_date', 'DESC');
    }

    return paginate(queryBuilder, paginationOptions);
  }

  async findAllByCustomerID(
    fk_customer_id: number,
    options: IPaginationOptions
  ): Promise<Pagination<OrdersEntity>> {
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('orders')
      .where('orders.fk_customer_id = :fk_customer_id', { fk_customer_id })
      .orderBy('orders.order_date', 'DESC'); // Optional: order by most recent first

    return paginate(queryBuilder, options);
  }

  findOne(pk_order_id: number): Promise<OrdersEntity | null> {
    return this.ordersRepository.findOne({ where: { pk_order_id } });
  }

  async create(createOrdersDto: CreateOrdersDto): Promise<OrdersEntity> {
    const newOrders = new OrdersEntity();

    const normalizeOrderDate = moment(createOrdersDto.orderDate, 'YYYY-MM-DD');
    const normalizeDeliveryDate = moment(createOrdersDto.deliveryDate, 'YYYY-MM-DD');

    newOrders.fk_customer_id = createOrdersDto.customerID;
    newOrders.fk_status_id = createOrdersDto.statusID;
    newOrders.order_date = normalizeOrderDate.toDate();
    newOrders.delivery_date = normalizeDeliveryDate.toDate();
    newOrders.subtotal = createOrdersDto.subtotal;
    newOrders.tax_total = createOrdersDto.taxTotal;
    newOrders.currency = createOrdersDto.currency;
    newOrders.notes = createOrdersDto.notes;
    newOrders.terms = createOrdersDto.terms;
    newOrders.tags = createOrdersDto.tags;
    newOrders.tags = isValidJSON(createOrdersDto.tags)
      ? createOrdersDto.tags
      : '[]';
    newOrders.user_owner = createOrdersDto.userOwner;
    newOrders.created_at = new Date();
    newOrders.updated_at = new Date();

    const newOrdersData = await this.ordersRepository.save(newOrders);
    const quoteID = createOrdersDto.quotesID
    const serialEncoderData = await this.serialEncodeServices.findByPurposeQuoteId(quoteID);
    let serialEncoderID = serialEncoderData?.id || -1;

    if (serialEncoderData) {
      const serialEncoderPurpose = JSON.stringify({
        ...serialEncoderData?.purpose,
        order_id: newOrdersData.pk_order_id
      });

      await this.serialEncodeServices.update(serialEncoderID, { purpose: serialEncoderPurpose })

    } else {
      const serialEncoderParams = {
        purpose: JSON.stringify({
          order_id: newOrdersData.pk_order_id
        })
      };

      const newSerialEncoder = await this.serialEncodeServices.create(serialEncoderParams);
      serialEncoderID = newSerialEncoder.id;
    }

    newOrdersData.order_number = `${serialEncoderID}`;
    newOrdersData.fk_serial_encoder_id = serialEncoderID;
    newOrdersData.updated_at = new Date();

    return await this.ordersRepository.save(newOrdersData);
  }

  async remove(pk_order_id: number) {
    return await this.ordersRepository.delete(pk_order_id);
  }

  async update(id: number, updateOrdersDto: UpdateOrdersDto) {
    const toUpdate = await this.ordersRepository.findOne({
      where: { pk_order_id: id },
    });

    const updated = Object.assign(
      {
        pk_order_id: toUpdate?.pk_order_id,
        fk_customer_id: toUpdate?.fk_customer_id,
        fk_status_id: toUpdate?.fk_status_id,
        order_number: toUpdate?.order_number,
        order_date: toUpdate?.order_date,
        delivery_date: toUpdate?.delivery_date,
        subtotal: toUpdate?.subtotal,
        tax_total: toUpdate?.tax_total,
        total_amount: toUpdate?.total_amount,
        currency: toUpdate?.currency,
        notes: toUpdate?.notes,
        terms: toUpdate?.terms,
        tags: toUpdate?.tags,
        user_owner: toUpdate?.user_owner,
        created_at: toUpdate?.created_at,
        updated_at: toUpdate?.updated_at,
      },
      {
        fk_customer_id: updateOrdersDto.customerID,
        fk_status_id: updateOrdersDto.statusID,
        orderDate: updateOrdersDto.orderDate,
        delivery_date: updateOrdersDto.deliveryDate,
        subtotal: updateOrdersDto.subtotal,
        tax_total: updateOrdersDto.taxTotal,
        currency: updateOrdersDto.currency,
        notes: updateOrdersDto.notes,
        terms: updateOrdersDto.terms,
        tags: isValidJSON(updateOrdersDto.tags) ? updateOrdersDto.tags : '[]',
        user_owner: updateOrdersDto.userOwner,
        updated_at: new Date(),
      },
    );

    return await this.ordersRepository.save(updated);
  }

  async searchOrders(
    searchQuery: string,
    options: IPaginationOptions & { sort?: any; filter?: any }
  ): Promise<Pagination<OrdersEntity>> {
    const { sort, filter, ...paginationOptions } = options;
    
    // Validate search query
    if (!searchQuery || searchQuery.trim().length === 0) {
      return {
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: paginationOptions.limit || 10,
          totalPages: 0,
          currentPage: paginationOptions.page || 1
        }
      } as Pagination<OrdersEntity>;
    }

    const queryBuilder = this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoin('Status', 'status', 'status.id = orders.fk_status_id')
      .leftJoin('Customers', 'customer', 'customer.pk_customer_id = orders.fk_customer_id')
      .leftJoin('Contacts', 'contact', 'contact.fk_id = orders.fk_customer_id AND contact.table = :contactTable', { contactTable: 'Customers' });

    // Clean and prepare search term
    const cleanSearchTerm = searchQuery.toLowerCase().trim();
    const searchWords = cleanSearchTerm.split(/\s+/).filter(word => word.length > 0);

    // Check if search term is a number (for ID searches) - IMPROVED VALIDATION
    const isNumericSearch = /^\d+$/.test(cleanSearchTerm) && cleanSearchTerm.length > 0;
    let parsedNumber: number | null = null;

    if (isNumericSearch) {
      const tempParsed = parseInt(cleanSearchTerm, 10);
      // CRITICAL FIX: Only set parsedNumber if it's a valid number
      if (!isNaN(tempParsed) && tempParsed > 0 && isFinite(tempParsed)) {
        parsedNumber = tempParsed;
      }
    }

    const isValidNumber = parsedNumber !== null;

    // Check if search term looks like a date (basic date patterns)
    const isDateSearch = /^\d{4}-\d{2}-\d{2}$/.test(cleanSearchTerm) ||
      /^\d{2}\/\d{2}\/\d{4}$/.test(cleanSearchTerm) ||
      /^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanSearchTerm);

    // Build search conditions
    const conditions: string[] = [];

    // Search by Order ID (exact match if numeric) - ONLY if we have a valid number
    if (isValidNumber && parsedNumber !== null) {
      conditions.push('orders.pk_order_id = :numericSearch');
    }

    // Search by Order Number (partial match)
    conditions.push('LOWER(orders.order_number) LIKE :partialSearch');

    // Search by Status Name
    conditions.push('LOWER(status.status) LIKE :partialSearch');

    // Search by Customer Name
    conditions.push('LOWER(customer.name) LIKE :partialSearch');

    // Search by Customer Owner Name
    conditions.push('LOWER(customer.owner_name) LIKE :partialSearch');

    // Search by Contact Name (first name, last name, or full name)
    conditions.push('LOWER(contact.first_name) LIKE :partialSearch');
    conditions.push('LOWER(contact.last_name) LIKE :partialSearch');
    conditions.push('LOWER(CONCAT(contact.first_name, \' \', contact.last_name)) LIKE :partialSearch');

    let dateSearchTerm: string | null = null;

    // Date searches (if it looks like a date)
    if (isDateSearch) {
      // Convert search term to proper date format for comparison
      dateSearchTerm = cleanSearchTerm;
      if (cleanSearchTerm.includes('/')) {
        // Convert MM/DD/YYYY to YYYY-MM-DD
        const parts = cleanSearchTerm.split('/');
        if (parts.length === 3) {
          dateSearchTerm = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      } else if (cleanSearchTerm.includes('-') && !cleanSearchTerm.startsWith('20')) {
        // Convert MM-DD-YYYY or M-D-YYYY to YYYY-MM-DD
        const parts = cleanSearchTerm.split('-');
        if (parts.length === 3 && parts[2].length === 4) {
          dateSearchTerm = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }

      conditions.push('DATE(orders.order_date) = :dateSearch');
      conditions.push('DATE(orders.delivery_date) = :dateSearch');
    }

    // For multi-word searches, each word should match at least one field
    if (searchWords.length > 1) {
      const wordConditions = searchWords.map((word, index) => {
        const paramName = `word${index}`;
        const wordSearchConditions = [
          `LOWER(orders.order_number) LIKE :${paramName}`,
          `LOWER(status.status) LIKE :${paramName}`,
          `LOWER(customer.name) LIKE :${paramName}`,
          `LOWER(customer.owner_name) LIKE :${paramName}`,
          `LOWER(contact.first_name) LIKE :${paramName}`,
          `LOWER(contact.last_name) LIKE :${paramName}`,
          `LOWER(CONCAT(contact.first_name, ' ', contact.last_name)) LIKE :${paramName}`
        ];

        // IMPROVED: Add numeric search for individual words if they're valid numbers
        const wordParsed = parseInt(word, 10);
        if (!isNaN(wordParsed) && wordParsed > 0 && isFinite(wordParsed) && /^\d+$/.test(word)) {
          wordSearchConditions.push(`orders.pk_order_id = :${paramName}Numeric`);
        }

        return `(${wordSearchConditions.join(' OR ')})`;
      });

      queryBuilder.where(wordConditions.join(' AND '));

      // Set parameters for each word
      const parameters: any = {};
      searchWords.forEach((word, index) => {
        parameters[`word${index}`] = `%${word}%`;

        // CRITICAL FIX: Add numeric parameter only if word is a valid number
        const wordParsed = parseInt(word, 10);
        if (!isNaN(wordParsed) && wordParsed > 0 && isFinite(wordParsed) && /^\d+$/.test(word)) {
          parameters[`word${index}Numeric`] = wordParsed;
        }
      });
      queryBuilder.setParameters(parameters);
    } else {
      // Single word or phrase search
      queryBuilder.where(`(${conditions.join(' OR ')})`);

      // Set parameters
      const parameters: any = {
        partialSearch: `%${cleanSearchTerm}%`
      };

      // CRITICAL FIX: Only add numeric parameter if we have a valid number
      if (isValidNumber && parsedNumber !== null) {
        parameters.numericSearch = parsedNumber;
      }

      if (isDateSearch && dateSearchTerm) {
        parameters.dateSearch = dateSearchTerm;
      }

      queryBuilder.setParameters(parameters);
    }

    // Apply filters
    if (filter) {
      if (filter.status) {
        queryBuilder.andWhere('status.status = :statusFilter', { statusFilter: filter.status });
      }
      if (filter.user_owner) {
        queryBuilder.andWhere('orders.user_owner = :userOwnerFilter', { userOwnerFilter: filter.user_owner });
      }
    }

    // Apply sorting
    if (sort) {
      const sortField = Object.keys(sort)[0];
      const sortDirection = sort[sortField];
      
      switch (sortField) {
        case 'pk_order_id':
          queryBuilder.orderBy('orders.pk_order_id', sortDirection);
          break;
        case 'order_number':
          queryBuilder.orderBy('orders.order_number', sortDirection);
          break;
        case 'order_date':
          queryBuilder.orderBy('orders.order_date', sortDirection);
          break;
        case 'delivery_date':
          queryBuilder.orderBy('orders.delivery_date', sortDirection);
          break;
        case 'total_amount':
          queryBuilder.orderBy('orders.total_amount', sortDirection);
          break;
        case 'user_owner':
          queryBuilder.orderBy('orders.user_owner', sortDirection);
          break;
        case 'customer_name':
          queryBuilder.orderBy('customer.name', sortDirection);
          break;
        case 'status':
          queryBuilder.orderBy('status.status', sortDirection);
          break;
        default:
          queryBuilder.orderBy('orders.order_date', 'DESC');
      }
    } else {
      queryBuilder.orderBy('orders.order_date', 'DESC');
    }

    return paginate(queryBuilder, paginationOptions);
  }

  async getPendingOrdersCount(): Promise<DashboardMetric> {
    // Assuming status IDs: 1=New, 2=In Progress, 3=Completed, 4=Cancelled
    // Pending would be New + In Progress
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('COUNT(*)', 'count')
      .where('orders.fk_status_id IN (:...statusIds)', { statusIds: [1, 2] })
      .getRawOne();

    const currentCount = parseInt(result.count) || 0;
    const lastMonthPending = await this.getLastMonthPendingCount();
    const percentage = lastMonthPending > 0 ?
      ((currentCount - lastMonthPending) / lastMonthPending) * 100 : 0;

    return {
      value: currentCount,
      percentage: Math.round(percentage * 100) / 100,
      label: 'Awaiting processing'
    };
  }

  async getNewOrdersThisMonth(): Promise<DashboardMetric> {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('COUNT(*)', 'count')
      .where('orders.created_at >= :startOfMonth', { startOfMonth })
      .andWhere('orders.created_at <= :endOfMonth', { endOfMonth })
      .getRawOne();

    const currentCount = parseInt(result.count) || 0;
    const lastMonthCount = await this.getLastMonthNewOrdersCount();
    const percentage = lastMonthCount > 0 ?
      ((currentCount - lastMonthCount) / lastMonthCount) * 100 : 0;

    return {
      value: currentCount,
      percentage: Math.round(percentage * 100) / 100,
      label: 'Recent orders'
    };
  }

  async getProcessSummary(): Promise<ProcessSummaryItem[]> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoin('Status', 'status', 'status.id = orders.fk_status_id')
      .select('status.status', 'status')
      .addSelect('orders.fk_status_id', 'statusId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('orders.fk_status_id')
      .addGroupBy('status.status')
      .getRawMany();

    const statusMap = {
      1: 'New',
      2: 'In Progress',
      3: 'Completed',
      4: 'Cancelled'
    };

    const processedResult = result.map(item => ({
      status: item.status || statusMap[item.statusId] || 'Unknown',
      count: parseInt(item.count),
      total: parseInt(item.count)
    }));

    // Fill in missing statuses with 0 count
    const allStatuses = ['New', 'In Progress', 'Completed', 'Cancelled'];
    const existingStatuses = processedResult.map(item => item.status);

    allStatuses.forEach(status => {
      if (!existingStatuses.includes(status)) {
        processedResult.push({
          status,
          count: 0,
          total: 0
        });
      }
    });

    return processedResult.sort((a, b) => {
      const order = ['New', 'In Progress', 'Completed', 'Cancelled'];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });
  }

  async getOwnerBreakdown(limit: number = 10): Promise<OwnerBreakdownItem[]> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoin('Customers', 'customer', 'customer.pk_customer_id = orders.fk_customer_id')
      .select('customer.pk_customer_id', 'customerId')
      .addSelect('customer.name', 'customerName')
      .addSelect('customer.owner_name', 'ownerName')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('SUM(orders.total_amount)', 'totalValue')
      .groupBy('customer.pk_customer_id')
      .addGroupBy('customer.name')
      .addGroupBy('customer.owner_name')
      .orderBy('SUM(orders.total_amount)', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      customerId: parseInt(item.customerId),
      customerName: item.customerName || 'Unknown Customer',
      ownerName: item.ownerName || 'Unknown Owner',
      orderCount: parseInt(item.orderCount),
      totalValue: parseFloat(item.totalValue) || 0
    }));
  }

  async getStatusDistribution(): Promise<any[]> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoin('Status', 'status', 'status.id = orders.fk_status_id')
      .select('status.status', 'status')
      .addSelect('orders.fk_status_id', 'statusId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(orders.total_amount)', 'totalValue')
      .groupBy('orders.fk_status_id')
      .addGroupBy('status.status')
      .getRawMany();

    const total = result.reduce((sum, item) => sum + parseInt(item.count), 0);

    return result.map(item => ({
      status: item.status || `Status ${item.statusId}`,
      count: parseInt(item.count),
      percentage: total > 0 ? Math.round((parseInt(item.count) / total) * 100) : 0,
      totalValue: parseFloat(item.totalValue) || 0
    }));
  }

  async getMonthlyTrends(months: number = 12): Promise<MonthlyTrend[]> {
    const startDate = moment().subtract(months - 1, 'months').startOf('month').toDate();

    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('YEAR(orders.order_date)', 'year')
      .addSelect('MONTH(orders.order_date)', 'month')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('SUM(orders.total_amount)', 'totalRevenue')
      .addSelect('AVG(orders.total_amount)', 'averageOrderValue')
      .where('orders.order_date >= :startDate', { startDate })
      .groupBy('YEAR(orders.order_date)')
      .addGroupBy('MONTH(orders.order_date)')
      .orderBy('YEAR(orders.order_date)', 'ASC')
      .addOrderBy('MONTH(orders.order_date)', 'ASC')
      .getRawMany();

    return result.map(item => ({
      month: moment().year(item.year).month(item.month - 1).format('MMM YYYY'),
      orderCount: parseInt(item.orderCount),
      totalRevenue: parseFloat(item.totalRevenue) || 0,
      averageOrderValue: parseFloat(item.averageOrderValue) || 0
    }));
  }

  async getRevenueByCustomer(limit: number = 10): Promise<any[]> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoin('Customers', 'customer', 'customer.pk_customer_id = orders.fk_customer_id')
      .select('customer.pk_customer_id', 'customerId')
      .addSelect('customer.name', 'customerName')
      .addSelect('SUM(orders.total_amount)', 'totalRevenue')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('AVG(orders.total_amount)', 'averageOrderValue')
      .where('orders.fk_status_id = :statusId', { statusId: 3 }) // Completed orders only
      .groupBy('customer.pk_customer_id')
      .addGroupBy('customer.name')
      .orderBy('SUM(orders.total_amount)', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      customerId: parseInt(item.customerId),
      customerName: item.customerName || 'Unknown Customer',
      totalRevenue: parseFloat(item.totalRevenue) || 0,
      orderCount: parseInt(item.orderCount),
      averageOrderValue: parseFloat(item.averageOrderValue) || 0
    }));
  }

  async getAverageOrderValue(): Promise<number> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('AVG(orders.total_amount)', 'average')
      .getRawOne();

    return parseFloat(result.average) || 0;
  }

  async getCompletionRate(): Promise<number> {
    const [total, completed] = await Promise.all([
      this.ordersRepository.count(),
      this.ordersRepository.count({ where: { fk_status_id: 3 } })
    ]);

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  async getMonthlyGrowthRate(): Promise<number> {
    const currentMonth = await this.getNewOrdersThisMonth();
    const lastMonthCount = await this.getLastMonthNewOrdersCount();

    return lastMonthCount > 0 ?
      Math.round(((currentMonth.value - lastMonthCount) / lastMonthCount) * 100) : 0;
  }

  async getTopPerformingMonth(): Promise<{ month: string; revenue: number }> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('YEAR(orders.order_date)', 'year')
      .addSelect('MONTH(orders.order_date)', 'month')
      .addSelect('SUM(orders.total_amount)', 'totalRevenue')
      .where('orders.fk_status_id = :statusId', { statusId: 3 })
      .groupBy('YEAR(orders.order_date)')
      .addGroupBy('MONTH(orders.order_date)')
      .orderBy('SUM(orders.total_amount)', 'DESC')
      .limit(1)
      .getRawOne();

    if (!result) {
      return { month: 'N/A', revenue: 0 };
    }

    return {
      month: moment().year(result.year).month(result.month - 1).format('MMM YYYY'),
      revenue: parseFloat(result.totalRevenue) || 0
    };
  }

  // Helper methods for calculating previous month data
  private async getLastMonthTotal(): Promise<number> {
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month').toDate();
    const endOfLastMonth = moment().subtract(1, 'month').endOf('month').toDate();

    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('SUM(orders.total_amount)', 'total')
      .where('orders.created_at >= :startOfLastMonth', { startOfLastMonth })
      .andWhere('orders.created_at <= :endOfLastMonth', { endOfLastMonth })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  private async getLastMonthPendingCount(): Promise<number> {
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month').toDate();
    const endOfLastMonth = moment().subtract(1, 'month').endOf('month').toDate();

    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('COUNT(*)', 'count')
      .where('orders.fk_status_id IN (:...statusIds)', { statusIds: [1, 2] })
      .andWhere('orders.created_at >= :startOfLastMonth', { startOfLastMonth })
      .andWhere('orders.created_at <= :endOfLastMonth', { endOfLastMonth })
      .getRawOne();

    return parseInt(result.count) || 0;
  }

  private async getLastMonthNewOrdersCount(): Promise<number> {
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month').toDate();
    const endOfLastMonth = moment().subtract(1, 'month').endOf('month').toDate();

    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('COUNT(*)', 'count')
      .where('orders.created_at >= :startOfLastMonth', { startOfLastMonth })
      .andWhere('orders.created_at <= :endOfLastMonth', { endOfLastMonth })
      .getRawOne();

    return parseInt(result.count) || 0;
  }

  private async getLastMonthRevenue(): Promise<number> {
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month').toDate();
    const endOfLastMonth = moment().subtract(1, 'month').endOf('month').toDate();

    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('SUM(orders.total_amount)', 'total')
      .where('orders.fk_status_id = :statusId', { statusId: 3 })
      .andWhere('orders.created_at >= :startOfLastMonth', { startOfLastMonth })
      .andWhere('orders.created_at <= :endOfLastMonth', { endOfLastMonth })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getTotalAmountByCustomerID(customerID: number): Promise<number> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('SUM(orders.total_amount)', 'total')
      .where('orders.fk_customer_id = :customerID', { customerID })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getTotalOrderValue(): Promise<DashboardMetric> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('SUM(orders.total_amount)', 'total')
      .addSelect('COUNT(*)', 'count')  // Changed from select to addSelect
      .getRawOne();

    const currentTotal = parseFloat(result.total) || 0;
    const lastMonthTotal = await this.getLastMonthTotal();
    const percentage = lastMonthTotal > 0 ?
      ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    return {
      value: currentTotal,
      percentage: Math.round(percentage * 100) / 100,
      label: 'All time orders value'
    };
  }

// Improved error handling for getTotalRevenue()
  async getTotalRevenue(): Promise<DashboardMetricDto> {
    // Revenue from completed orders only
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('SUM(orders.total_amount)', 'total')
      .where('orders.fk_status_id = :statusId', { statusId: 4 }) // Completed
      .getRawOne();

    // Ensure we're getting a valid number
    const currentRevenue = result && result.total !== null && result.total !== undefined
      ? parseFloat(result.total)
      : 0;

    const lastMonthRevenue = await this.getLastMonthRevenue();
    const percentage = lastMonthRevenue > 0 ?
      ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    return {
      value: currentRevenue,
      percentage: Math.round(percentage * 100) / 100,
      label: 'All time'
    };
  }

  async getCustomerOrderCount(customerId: number): Promise<number> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('COUNT(*)', 'count')
      .where('orders.fk_customer_id = :customerId', { customerId })
      .getRawOne();

    return parseInt(result.count) || 0;
  }

  async getCustomerLastOrder(customerId: number): Promise<OrdersEntity | null> {
    return this.ordersRepository
      .createQueryBuilder('orders')
      .where('orders.fk_customer_id = :customerId', { customerId })
      .orderBy('orders.created_at', 'DESC')
      .limit(1)
      .getOne();
  }

  async getCustomerAverageOrderValue(customerId: number): Promise<number> {
    const result = await this.ordersRepository
      .createQueryBuilder('orders')
      .select('AVG(orders.total_amount)', 'average')
      .where('orders.fk_customer_id = :customerId', { customerId })
      .getRawOne();

    return parseFloat(result.average) || 0;
  }

  async getCustomerOrderKPIs(customerId: number): Promise<CustomerOrderKPIs> {
    const [
      orderCount,
      totalAmount,
      lastOrder,
      averageOrderValue
    ] = await Promise.all([
      this.getCustomerOrderCount(customerId),
      this.getTotalAmountByCustomerID(customerId),
      this.getCustomerLastOrder(customerId),
      this.getCustomerAverageOrderValue(customerId)
    ]);

    return {
      orderCount,
      totalAmount,
      lastOrder: lastOrder ? {
        id: lastOrder.pk_order_id,
        orderNumber: lastOrder.order_number,
        orderDate: lastOrder.order_date,
        totalAmount: lastOrder.total_amount,
        createdAt: lastOrder.created_at
      } : null,
      averageOrderValue
    };
  }
}
