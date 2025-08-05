import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { QuotesEntity } from './quotes.entity';
import { CreateQuotesDto, UpdateQuotesDto } from './quotes.dto';

import { isValidJSON } from '../../utils/string_tools';

import * as moment from 'moment';
import { StatusService } from '../status/status.service';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';

interface SortOptions {
  pk_quote_id?: 'ASC' | 'DESC';
  quote_number?: 'ASC' | 'DESC';
  expiration_date?: 'ASC' | 'DESC'; // Note: using expiration_date instead of quote_due_date
  subtotal?: 'ASC' | 'DESC';
  total_amount?: 'ASC' | 'DESC';
  status?: 'ASC' | 'DESC';
  customer_name?: 'ASC' | 'DESC';
  user_owner?: 'ASC' | 'DESC';
}

interface FilterOptions {
  status?: string | number;
  user_owner?: string;
}

interface FindAllOptions extends IPaginationOptions {
  sort?: SortOptions;
  filter?: FilterOptions;
}

@Injectable()
export class QuotesService {
  constructor(
    @Inject('QUOTES_REPOSITORY')
    private quotesRepository: Repository<QuotesEntity>,
    private statusService: StatusService,
    private serialEncoderService: SerialEncoderService,
  ) {}

  async findAll(options: FindAllOptions) {
    const queryBuilder = this.quotesRepository.createQueryBuilder('quotes');
    
    // Add customer join if needed for sorting by customer name
    if (options.sort?.customer_name) {
      queryBuilder.leftJoin('Customers', 'customer', 'quotes.fk_customer_id = customer.pk_customer_id');
    }
    
    // Add status join if needed for filtering or sorting by status
    if (options.filter?.status || options.sort?.status) {
      queryBuilder.leftJoin('Status', 'status', 'quotes.fk_status_id = status.id');
    }
    
    // Apply filters
    let hasWhereClause = false;
    
    if (options.filter?.status) {
      if (typeof options.filter.status === 'string') {
        queryBuilder.where('status.status = :statusValue', { statusValue: options.filter.status });
      } else {
        queryBuilder.where('quotes.fk_status_id = :statusId', { statusId: options.filter.status });
      }
      hasWhereClause = true;
    }
    
    if (options.filter?.user_owner) {
      const userOwnerCondition = 'LOWER(quotes.user_owner) LIKE LOWER(:userOwner)';
      const userOwnerParam = { userOwner: `%${options.filter.user_owner}%` };
      
      if (hasWhereClause) {
        queryBuilder.andWhere(userOwnerCondition, userOwnerParam);
      } else {
        queryBuilder.where(userOwnerCondition, userOwnerParam);
        hasWhereClause = true;
      }
    }
    
    // Apply sorting
    if (options.sort) {
      let hasOrderBy = false;
      
      Object.entries(options.sort).forEach(([field, direction]) => {
        if (direction && ['ASC', 'DESC'].includes(direction)) {
          let sortField = '';
          
          switch (field) {
            case 'pk_quote_id':
              sortField = 'quotes.pk_quote_id';
              break;
            case 'quote_number':
              sortField = 'quotes.quote_number';
              break;
            case 'expiration_date':
              sortField = 'quotes.expiration_date';
              break;
            case 'subtotal':
              sortField = 'quotes.subtotal';
              break;
            case 'total_amount':
              sortField = 'quotes.total_amount';
              break;
            case 'status':
              sortField = 'status.status';
              break;
            case 'customer_name':
              sortField = 'customer.name';
              break;
            case 'user_owner':
              sortField = 'quotes.user_owner';
              break;
            default:
              return;
          }
          
          if (sortField) {
            if (!hasOrderBy) {
              queryBuilder.orderBy(sortField, direction as 'ASC' | 'DESC');
              hasOrderBy = true;
            } else {
              queryBuilder.addOrderBy(sortField, direction as 'ASC' | 'DESC');
            }
          }
        }
      });
    }
    
    // Default sorting if no custom sort is provided
    if (!options.sort || Object.keys(options.sort).length === 0) {
      queryBuilder.orderBy('quotes.created_at', 'DESC');
    }
    
    return paginate(queryBuilder, options);
  }

  findOne(pk_quote_id: number): Promise<QuotesEntity | null> {
    return this.quotesRepository.findOne({ where: { pk_quote_id } });
  }

  async findByCustomerId(customerId: number, options: IPaginationOptions) {
    const queryBuilder = this.quotesRepository
      .createQueryBuilder('quotes')
      .where('quotes.fk_customer_id = :customerId', { customerId })
      .orderBy('quotes.quote_date', 'DESC')
      .addOrderBy('quotes.quote_number', 'ASC');

    return paginate(queryBuilder, options);
  }

  // Search quotes by quote number, customer name, or customer owner name
  async searchQuotes(
    searchTerm: string,
    options: IPaginationOptions,
    searchFields: string[] = [
      'quote_number',
      'customer_name',
      'customer_owner_name',
    ],
    matchType: 'partial' | 'exact' | 'phrase' = 'partial',
  ) {
    // Additional cleanup for any remaining encoded characters and normalize spaces
    const cleanSearchTerm = searchTerm
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .replace(/[^\w\s\-_.,@]/g, ' ') // Replace special chars with space (except common ones)
      .replace(/\s+/g, ' ') // Normalize again after special char replacement
      .trim();

    const queryBuilder = this.quotesRepository
      .createQueryBuilder('quotes')
      .leftJoinAndSelect(
        'Customers',
        'customer',
        'quotes.fk_customer_id = customer.pk_customer_id',
      );

    // Helper function to build field conditions with proper escaping
    const buildFieldCondition = (field: string, paramName: string): string => {
      switch (field) {
        case 'quote_number':
          return `LOWER(REPLACE(quotes.quote_number, ' ', '')) LIKE :${paramName} OR LOWER(quotes.quote_number) LIKE :${paramName}`;
        case 'customer_name':
          return `LOWER(REPLACE(customer.name, ' ', '')) LIKE :${paramName} OR LOWER(customer.name) LIKE :${paramName}`;
        case 'customer_owner_name':
          return `LOWER(REPLACE(customer.owner_name, ' ', '')) LIKE :${paramName} OR LOWER(customer.owner_name) LIKE :${paramName}`;
        default:
          return '';
      }
    };

    if (matchType === 'exact') {
      // Exact phrase matching - the entire search term must match exactly (with wildcards)
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
      // Phrase matching - search for the exact phrase but allow partial matches within fields
      const conditions: string[] = [];
      const parameters: any = {};

      searchFields.forEach((field, index) => {
        const paramName = `phraseTerm${index}`;
        const condition = buildFieldCondition(field, paramName);
        if (condition) {
          conditions.push(condition);
          // For phrase search, we want to match the entire phrase as-is
          parameters[paramName] = `%${cleanSearchTerm}%`;
        }
      });

      if (conditions.length > 0) {
        queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
      }
    } else {
      // Partial word matching with enhanced space handling
      const searchWords = cleanSearchTerm
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .map((word) => word.trim());

      if (searchWords.length === 0) {
        // Empty search after cleanup
        queryBuilder.where('1 = 0'); // Return no results
      } else if (searchWords.length === 1) {
        // Single word - search across all specified fields
        const conditions: string[] = [];
        const parameters: any = {
          singleTerm: `%${searchWords[0]}%`,
          singleTermNoSpace: `%${searchWords[0].replace(/\s/g, '')}%`,
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
        // Multiple words - enhanced logic for space-separated terms
        // Option 1: All words must be found (AND logic across words, OR logic across fields)
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

        // Option 2: Add an OR condition for consecutive word matching
        // This helps find "John Smith" even if stored as "Smith, John" or similar variations
        if (searchWords.length === 2) {
          const consecutiveConditions: string[] = [];
          const consecutiveParams: any = {};

          // Forward order: "word1 word2"
          const forwardPhrase = searchWords.join(' ');
          const forwardPhraseNoSpace = searchWords.join('');
          searchFields.forEach((field, index) => {
            const paramName = `consecutive${index}`;
            const condition = buildFieldCondition(field, paramName);
            if (condition) {
              consecutiveConditions.push(condition);
              consecutiveParams[paramName] = `%${forwardPhrase}%`;
            }
          });

          // Reverse order: "word2 word1"
          const reversePhrase = [...searchWords].reverse().join(' ');
          searchFields.forEach((field, index) => {
            const paramName = `reverse${index}`;
            const condition = buildFieldCondition(field, paramName);
            if (condition) {
              consecutiveConditions.push(condition);
              consecutiveParams[paramName] = `%${reversePhrase}%`;
            }
          });

          if (consecutiveConditions.length > 0) {
            queryBuilder.orWhere(
              `(${consecutiveConditions.join(' OR ')})`,
              consecutiveParams,
            );
          }
        }
      }
    }

    queryBuilder
      .orderBy('quotes.quote_date', 'DESC')
      .addOrderBy('quotes.quote_number', 'ASC');

    return paginate(queryBuilder, options);
  }

  async create(createQuotesDto: CreateQuotesDto): Promise<QuotesEntity> {
    const newQuotes = new QuotesEntity();

    const normalizeQuoteDate = moment(createQuotesDto.quoteDate, 'YYYY-MM-DD');
    const normalizeExpirationDate = moment(
      createQuotesDto.expirationDate,
      'YYYY-MM-DD',
    );

    newQuotes.fk_customer_id = createQuotesDto.customerID;
    newQuotes.fk_status_id = createQuotesDto.statusID || 1;
    newQuotes.quote_date = normalizeQuoteDate.toDate();
    newQuotes.expiration_date = normalizeExpirationDate.toDate();
    newQuotes.subtotal = createQuotesDto.subtotal;
    newQuotes.tax_total = createQuotesDto.taxTotal;
    newQuotes.currency = createQuotesDto.currency;
    newQuotes.notes = createQuotesDto.notes;
    newQuotes.terms = createQuotesDto.terms;
    newQuotes.tags = isValidJSON(createQuotesDto.tags)
      ? createQuotesDto.tags
      : '[]';

    newQuotes.user_owner = createQuotesDto.userOwner;
    newQuotes.created_at = new Date();
    newQuotes.updated_at = new Date();

    const newQuotesData = await this.quotesRepository.save(newQuotes);

    const serialEncoderParams = {
      purpose: JSON.stringify({
        quote_id: newQuotes.pk_quote_id
      })
    }

    const newSerialEncoder = await this.serialEncoderService.create(serialEncoderParams);

    newQuotesData.quote_number = `${newSerialEncoder.id}`;
    newQuotesData.fk_serial_encoder_id = newSerialEncoder.id;
    newQuotesData.updated_at = new Date();

    return await this.quotesRepository.save(newQuotesData);
  }

  async remove(pk_quote_id: number) {
    return await this.quotesRepository.delete(pk_quote_id);
  }

  async update(id: number, updateQuotesDto: UpdateQuotesDto) {
    const toUpdate = await this.quotesRepository.findOne({
      where: { pk_quote_id: id },
    });

    const updated = Object.assign(
      {
        pk_quote_id: toUpdate?.pk_quote_id,
        fk_customer_id: toUpdate?.fk_customer_id,
        fk_status_id: toUpdate?.fk_status_id,
        fk_serial_encoder_id: toUpdate?.fk_serial_encoder_id,
        quote_number: toUpdate?.quote_number,
        quote_date: toUpdate?.quote_date,
        expiration_date: toUpdate?.expiration_date,
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
        fk_customer_id: updateQuotesDto.customerID,
        fk_status_id: updateQuotesDto.statusID,
        quote_date: updateQuotesDto.quoteDate,
        expiration_date: updateQuotesDto.expirationDate,
        subtotal: updateQuotesDto.subtotal,
        tax_total: updateQuotesDto.taxTotal,
        currency: updateQuotesDto.currency,
        notes: updateQuotesDto.notes,
        terms: updateQuotesDto.terms,
        tags: isValidJSON(updateQuotesDto.tags) ? updateQuotesDto.tags : '[]',
        user_owner: updateQuotesDto.userOwner,
        updated_at: new Date(),
      },
    );

    return await this.quotesRepository.save(updated);
  }

  // Get all quote-related statuses using StatusService
  async getQuotesStatus() {
    return await this.statusService.findByProcesses([
      'Quote',
      'Production',
      'Art',
      'Invoicing'
    ]);
  }

  // Get status counts for quotes with detailed information
  async getQuotesStatusCounts() {
    const statusCounts = await this.quotesRepository
      .createQueryBuilder('quotes')
      .leftJoin('Status', 'status', 'quotes.fk_status_id = status.id')
      .select([
        'status.id as status_id',
        'status.process as process',
        'status.status as status',
        'status.color as color',
        'COUNT(quotes.pk_quote_id) as count'
      ])
      .groupBy('status.id, status.process, status.status, status.color')
      .orderBy('status.process', 'ASC')
      .addOrderBy('status.id', 'ASC')
      .getRawMany();

    return statusCounts.map(item => ({
      ...item,
      count: parseInt(item.count, 10) // Ensure count is a number
    }));
  }

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalValue: number;
    outstandingAmount: number;
    awaitingApprovalCount: number;
    ownerBreakdown: Array<{
      owner: string;
      count: number;
      totalValue: number;
    }>;
    topOwner: {
      owner: string;
      count: number;
      totalValue: number;
    } | null;
  }> {
    const quotes = await this.quotesRepository
      .createQueryBuilder('quotes')
      .leftJoin('Status', 'status', 'quotes.fk_status_id = status.id')
      .leftJoin('Customers', 'customer', 'quotes.fk_customer_id = customer.pk_customer_id')
      .select([
        'quotes.subtotal',
        'quotes.tax_total',
        'quotes.total_amount',
        'quotes.currency',
        'status.process',
        'status.status',
        'customer.owner_name'
      ])
      .getRawMany();

    // Calculate total value of all quotes
    const totalValue = quotes.reduce((sum, quote) => {
      // Convert to numbers to avoid string concatenation
      const totalAmount = parseFloat(quote.quotes_total_amount) || 0;
      const subtotal = parseFloat(quote.quotes_subtotal) || 0;
      const taxTotal = parseFloat(quote.quotes_tax_total) || 0;

      const quoteTotal = totalAmount || (subtotal + taxTotal);
      return sum + quoteTotal;
    }, 0);

    // Calculate outstanding amount (quotes not yet closed/completed)
    const outstandingStatuses = ['Quote', 'Quote Approval Sent', 'Quote Approved', 'In Production', 'In Transit'];
    const outstandingAmount = quotes
      .filter(quote => outstandingStatuses.includes(quote.status_status)) // Fixed field name
      .reduce((sum, quote) => {
        // Convert to numbers to avoid string concatenation
        const totalAmount = parseFloat(quote.quotes_total_amount) || 0;
        const subtotal = parseFloat(quote.quotes_subtotal) || 0;
        const taxTotal = parseFloat(quote.quotes_tax_total) || 0;

        const quoteTotal = totalAmount || (subtotal + taxTotal);
        return sum + quoteTotal;
      }, 0);

    // Count awaiting approval quotes
    const awaitingApprovalCount = quotes.filter(quote =>
      quote.status_status === 'Quote Approval Sent' // Fixed field name
    ).length;

    // Define the owner type
    type OwnerData = {
      owner: string;
      count: number;
      totalValue: number;
    };

    // Group by owner breakdown
    const ownerBreakdownMap = quotes.reduce((acc, quote) => {
      const ownerName = quote.customer_owner_name || 'Unknown'; // Fixed field name
      if (!acc[ownerName]) {
        acc[ownerName] = {
          owner: ownerName,
          count: 0,
          totalValue: 0
        };
      }
      acc[ownerName].count += 1;

      // Convert to numbers to avoid string concatenation
      const totalAmount = parseFloat(quote.quotes_total_amount) || 0;
      const subtotal = parseFloat(quote.quotes_subtotal) || 0;
      const taxTotal = parseFloat(quote.quotes_tax_total) || 0;

      const quoteTotal = totalAmount || (subtotal + taxTotal);
      acc[ownerName].totalValue += quoteTotal;
      return acc;
    }, {} as Record<string, OwnerData>);

    // Convert to array with proper typing
    const ownerBreakdown: OwnerData[] = Object.values(ownerBreakdownMap);

    // Get top owner by count with proper typing
    let topOwner: OwnerData | null = null;

    if (ownerBreakdown.length > 0) {
      topOwner = ownerBreakdown.reduce((max: OwnerData, current: OwnerData) => {
        return current.count > max.count ? current : max;
      }, ownerBreakdown[0]);
    }

    return {
      totalValue,
      outstandingAmount,
      awaitingApprovalCount,
      ownerBreakdown,
      topOwner
    };
  }
}