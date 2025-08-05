import { Inject, Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import * as moment from 'moment';
import { isValidJSON } from '../../utils/string_tools';
import { InvoicesEntity } from './invoices.entity';
import {
  CreateInvoicesDTO,
  InvoiceAgingBucketDetailedDto,
  InvoiceKpiDetailedDto,
  UpdateInvoicesDTO,
} from './invoices.dto';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';


@Injectable()
export class InvoicesService {
  constructor(
    @Inject('INVOICES_REPOSITORY')
    private invoicesRepository: Repository<InvoicesEntity>,
    private serialEncoderService: SerialEncoderService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.invoicesRepository, options);
  }

  async findAllByCustomerID(
    fk_customer_id: number,
    options: IPaginationOptions
  ): Promise<Pagination<InvoicesEntity>> {
    const queryBuilder = this.invoicesRepository
      .createQueryBuilder('invoices')
      .where('invoices.fk_customer_id = :fk_customer_id', { fk_customer_id })
      .orderBy('invoices.invoice_number', 'ASC'); // Optional: order by most recent first

    return paginate(queryBuilder, options);
  }

  // async findAllByOrderID(
  //   fk_order_id: number,
  //   options: IPaginationOptions
  // ): Promise<Pagination<InvoicesEntity>> {
  //   const queryBuilder = this.invoicesRepository
  //     .createQueryBuilder('invoices')
  //     .where('invoices.fk_order_id = :fk_order_id', { fk_order_id })
  //     .orderBy('invoices.invoice_number', 'ASC'); // Optional: order by most recent first

  //   return paginate(queryBuilder, options);
  // }

  findOne(pk_invoice_id: number): Promise<InvoicesEntity | null> {
    return this.invoicesRepository.findOne({ where: { pk_invoice_id } });
  }

  async create(createInvoicesDto: CreateInvoicesDTO): Promise<InvoicesEntity> {
    const newInvoices = new InvoicesEntity();

    const normalizeInvoiceDate = moment(createInvoicesDto.invoiceDate, 'YYYY-MM-DD');
    const normalizeDueDate = moment(createInvoicesDto.dueDate, 'YYYY-MM-DD');

    newInvoices.fk_customer_id = createInvoicesDto.customerID;
    newInvoices.fk_status_id = createInvoicesDto.statusID;
    newInvoices.fk_serial_encoder_id = -1;
    newInvoices.invoice_date = normalizeInvoiceDate.toDate();
    newInvoices.due_date = normalizeDueDate.toDate();
    newInvoices.subtotal = createInvoicesDto.subTotal;
    newInvoices.tax_total = createInvoicesDto.taxTotal;
    newInvoices.currency = createInvoicesDto.currency;
    newInvoices.notes = createInvoicesDto.notes;
    newInvoices.terms = createInvoicesDto.terms;
    newInvoices.tags = isValidJSON(createInvoicesDto.tags)
      ? createInvoicesDto.tags
      : '[]';
    newInvoices.user_owner = createInvoicesDto.userOwner;
    newInvoices.created_at = new Date();
    newInvoices.updated_at = new Date();

    const newInvoiceData = await this.invoicesRepository.save(newInvoices);
    const orderID = createInvoicesDto.orderID;
    const serialEncoderData = await this.serialEncoderService.findByPurposeOrderId(orderID);
    let serialEncoderID = serialEncoderData?.id || -1;

    if (serialEncoderData) {
      const serialEncoderPurpose = JSON.stringify({
        ...serialEncoderData?.purpose,
        invoice_ids: [
          ...(serialEncoderData?.purpose?.invoice_ids || []),
          newInvoiceData.pk_invoice_id,
        ]
      });

      await this.serialEncoderService.update(serialEncoderID, { purpose: serialEncoderPurpose })

    } else {
      const serialEncoderParams = {
        purpose: JSON.stringify({
          invoice_ids: [newInvoiceData.pk_invoice_id]
        })
      };

      const newSerialEncoder = await this.serialEncoderService.create(serialEncoderParams);
      serialEncoderID = newSerialEncoder.id;
    }

    newInvoiceData.invoice_number = `${serialEncoderID}-${newInvoices.pk_invoice_id}`;
    newInvoiceData.fk_serial_encoder_id = serialEncoderID;
    newInvoiceData.updated_at = new Date();

    return await this.invoicesRepository.save(newInvoiceData);
  }

  async remove(pk_invoice_id: number) {
    return await this.invoicesRepository.delete(pk_invoice_id);
  }

  async update(id: number, updateInvoicesDto: UpdateInvoicesDTO) {
    const toUpdate = await this.invoicesRepository.findOne({
      where: { pk_invoice_id: id },
    });

    const normalizeInvoiceDate = moment(updateInvoicesDto.invoiceDate, 'YYYY-MM-DD');
    const normalizeDueDate = moment(updateInvoicesDto.dueDate, 'YYYY-MM-DD');

    const updated = Object.assign(
      {
        pk_invoice_id: toUpdate?.pk_invoice_id,
        fk_customer_id: toUpdate?.fk_customer_id,
        fk_status_id: toUpdate?.fk_status_id,
        invoice_number: toUpdate?.invoice_number,
        invoice_date: toUpdate?.invoice_date,
        due_date: toUpdate?.due_date,
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
        fk_customer_id: updateInvoicesDto.customerID,
        fk_status_id: updateInvoicesDto.statusID,
        invoice_date: normalizeInvoiceDate.toDate(),
        due_date: normalizeDueDate.toDate(),
        subtotal: updateInvoicesDto.subTotal,
        tax_total: updateInvoicesDto.taxTotal,
        currency: updateInvoicesDto.currency,
        notes: updateInvoicesDto.notes,
        terms: updateInvoicesDto.terms,
        tags: isValidJSON(updateInvoicesDto.tags) ? updateInvoicesDto.tags : '[]',
        user_owner: updateInvoicesDto.userOwner,
        updated_at: new Date(),
      },
    );

    return await this.invoicesRepository.save(updated);
  }

  async getDetailedInvoiceKpis(): Promise<InvoiceKpiDetailedDto> {
    // Get all unpaid invoices
    const queryBuilder = this.invoicesRepository
      .createQueryBuilder('invoices')
      .where('invoices.fk_status_id = :statusId', { statusId: 11 });

    const allUnpaidInvoices = await queryBuilder.getMany();

    const today = new Date();

    // Initialize buckets with detailed structure
    const createBucket = (): InvoiceAgingBucketDetailedDto => ({
      amount: 0,
      count: 0,
      currencyBreakdown: {},
      averageAmount: 0,
      largestInvoiceAmount: 0
    });

    const current = createBucket();
    const thirtyToSixty = createBucket();
    const sixtyToNinety = createBucket();
    const ninetyPlus = createBucket();

    let totalDaysOverdue = 0;
    let oldestInvoiceAge = 0;
    const allCurrencyBreakdown: { [currency: string]: number } = {};

    // Process each invoice
    allUnpaidInvoices.forEach(invoice => {
      // Calculate days overdue
      const dueDate = new Date(invoice.due_date);
      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Track total days overdue for average calculation
      if (daysDiff > 0) {
        totalDaysOverdue += daysDiff;
      }

      // Track oldest invoice
      if (daysDiff > oldestInvoiceAge) {
        oldestInvoiceAge = daysDiff;
      }

      // Update currency breakdown
      const currency = invoice.currency || 'USD';
      allCurrencyBreakdown[currency] = (allCurrencyBreakdown[currency] || 0) + invoice.total_amount;

      // Reference to the appropriate bucket
      let bucket: InvoiceAgingBucketDetailedDto;

      // Categorize into appropriate bucket
      if (daysDiff <= 30) {
        bucket = current;
      } else if (daysDiff <= 60) {
        bucket = thirtyToSixty;
      } else if (daysDiff <= 90) {
        bucket = sixtyToNinety;
      } else {
        bucket = ninetyPlus;
      }

      // Update bucket values
      bucket.amount += invoice.total_amount;
      bucket.count++;

      // Update currency breakdown for this bucket
      bucket.currencyBreakdown[currency] = (bucket.currencyBreakdown[currency] || 0) + invoice.total_amount;

      // Track largest invoice
      if (invoice.total_amount > bucket.largestInvoiceAmount) {
        bucket.largestInvoiceAmount = invoice.total_amount;
      }

      // Track oldest invoice date in this bucket
      const invoiceDate = new Date(invoice.invoice_date);
      if (!bucket.oldestInvoiceDate || invoiceDate < bucket.oldestInvoiceDate) {
        bucket.oldestInvoiceDate = invoiceDate;
      }
    });

    // Calculate averages for each bucket
    if (current.count > 0) current.averageAmount = current.amount / current.count;
    if (thirtyToSixty.count > 0) thirtyToSixty.averageAmount = thirtyToSixty.amount / thirtyToSixty.count;
    if (sixtyToNinety.count > 0) sixtyToNinety.averageAmount = sixtyToNinety.amount / sixtyToNinety.count;
    if (ninetyPlus.count > 0) ninetyPlus.averageAmount = ninetyPlus.amount / ninetyPlus.count;

    // Calculate total outstanding
    const totalOutstanding = current.amount + thirtyToSixty.amount + sixtyToNinety.amount + ninetyPlus.amount;
    const totalCount = current.count + thirtyToSixty.count + sixtyToNinety.count + ninetyPlus.count;

    // Calculate overall averages
    const averageDaysOverdue = totalCount > 0 ? totalDaysOverdue / totalCount : 0;
    const averageInvoiceAmount = totalCount > 0 ? totalOutstanding / totalCount : 0;

    return {
      totalOutstanding,
      totalCount,
      currencyBreakdown: allCurrencyBreakdown,
      current,
      thirtyToSixty,
      sixtyToNinety,
      ninetyPlus,
      averageDaysOverdue,
      averageInvoiceAmount,
      oldestInvoiceAge
    };
  }

  async searchInvoices(
    searchQuery: string,
    options: IPaginationOptions
  ): Promise<Pagination<InvoicesEntity>> {
    const queryBuilder = this.invoicesRepository
      .createQueryBuilder('invoices');

    // Skip search if query is empty
    if (!searchQuery || searchQuery.trim() === '') {
      queryBuilder.orderBy('invoices.invoice_date', 'DESC');
      return paginate(queryBuilder, options);
    }

    // Parse search query
    const query = searchQuery.trim();

    // Join necessary tables for search
    queryBuilder
      .leftJoin('Customers', 'customers', 'invoices.fk_customer_id = customers.pk_customer_id')
      .leftJoin('Contacts', 'contacts', 'invoices.fk_customer_id = contacts.fk_id')
      // .leftJoin('Orders', 'orders', 'invoices.fk_order_id = orders.pk_order_id')
      .leftJoin('Status', 'status', 'invoices.fk_status_id = status.id'); // Fixed column name

    // Try to determine if the query is a numeric ID
    const isNumeric = /^\d+$/.test(query);

    // Build where clauses
    queryBuilder.where(new Brackets(qb => {
      // Search by IDs if numeric
      if (isNumeric) {
        qb.orWhere('invoices.pk_invoice_id = :id', { id: parseInt(query) })
          .orWhere('invoices.fk_customer_id = :customerId', { customerId: parseInt(query) })
          // .orWhere('invoices.fk_order_id = :orderId', { orderId: parseInt(query) })
          .orWhere('contacts.pk_contact_id = :contactId', { contactId: parseInt(query) });
      }

      // Search by invoice number
      qb.orWhere('invoices.invoice_number LIKE :invoiceNum', { invoiceNum: `%${query}%` });

      // Search by customer name
      qb.orWhere('customers.name LIKE :customerName', { customerName: `%${query}%` });

      // Search by contact name
      qb.orWhere('contacts.first_name LIKE :firstName', { firstName: `%${query}%` });
      qb.orWhere('contacts.last_name LIKE :lastName', { lastName: `%${query}%` });
      qb.orWhere('CONCAT(contacts.first_name, " ", contacts.last_name) LIKE :fullName', { fullName: `%${query}%` });

      // Search by status values
      qb.orWhere('status.status LIKE :statusName', { statusName: `%${query}%` });
      qb.orWhere('status.process LIKE :processName', { processName: `%${query}%` });

      // Search by currency
      qb.orWhere('invoices.currency LIKE :currency', { currency: `%${query}%` });

      // Search in notes
      qb.orWhere('invoices.notes LIKE :notes', { notes: `%${query}%` });

      // Search in terms
      qb.orWhere('invoices.terms LIKE :terms', { terms: `%${query}%` });

      // Search in tags (assuming tags is a JSON string)
      qb.orWhere('invoices.tags LIKE :tags', { tags: `%${query}%` });
    }));

    // Check if the query is a date format
    try {
      const dateQuery = moment(query, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'], true);
      if (dateQuery.isValid()) {
        const startDate = dateQuery.startOf('day').toDate();
        const endDate = dateQuery.endOf('day').toDate();

        queryBuilder.orWhere(new Brackets(qb => {
          qb.orWhere('invoices.invoice_date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orWhere('invoices.due_date BETWEEN :startDate AND :endDate', { startDate, endDate });
        }));
      }
    } catch (e) {
      // Not a valid date, continue with other search criteria
    }

    // Check if the query is a currency amount
    const amountMatch = query.match(/^[\$€£¥]?(\d+(\.\d+)?)$/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1]);
      // Search for invoices with this amount (with a small tolerance)
      queryBuilder.orWhere(new Brackets(qb => {
        qb.orWhere('ABS(invoices.total_amount - :amount) < 0.01', { amount })
          .orWhere('ABS(invoices.subtotal - :amount) < 0.01', { amount })
          .orWhere('ABS(invoices.tax_total - :amount) < 0.01', { amount });
      }));
    }

    // Default sorting
    queryBuilder.orderBy('invoices.invoice_date', 'DESC');

    // Make query distinct to avoid duplicates from joins
    queryBuilder.distinct(true);

    return paginate(queryBuilder, options);
  }
}
