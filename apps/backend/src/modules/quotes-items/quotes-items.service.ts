import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { isValidJSON } from '../../utils/string_tools';
import * as moment from 'moment';
import { QuotesItemsEntity } from './quotes-items.entity';
import { CreateQuotesItemsDto, UpdateQuotesItemsDto } from './quotes-items.dto';
import { QuotesService } from '../quotes/quotes.service';


@Injectable()
export class QuotesItemsService {
  constructor(
    @Inject('QUOTES_ITEMS_REPOSITORY')
    private quotesItemsRepository: Repository<QuotesItemsEntity>,
    private quotesServices: QuotesService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.quotesItemsRepository, options);
  }

  findOne(pk_quote_item_id: number): Promise<QuotesItemsEntity | null> {
    return this.quotesItemsRepository.findOne({ where: { pk_quote_item_id } });
  }

  async create(createQuotesItemsDto: CreateQuotesItemsDto): Promise<QuotesItemsEntity> {
    const newQuotesItems = new QuotesItemsEntity()

    newQuotesItems.fk_quote_id = createQuotesItemsDto.fkQuoteID;
    newQuotesItems.fk_product_id = createQuotesItemsDto.fkProductID;
    newQuotesItems.fk_trim_id = createQuotesItemsDto.fkTrimID;
    newQuotesItems.fk_yarn_id = createQuotesItemsDto.fkYarnID;
    newQuotesItems.item_name = createQuotesItemsDto.itemName;
    newQuotesItems.item_description = createQuotesItemsDto.itemDescription;
    newQuotesItems.quantity = createQuotesItemsDto.quantity;
    newQuotesItems.unit_price = createQuotesItemsDto.unitPrice;
    newQuotesItems.tax_rate = createQuotesItemsDto.taxRate;

    newQuotesItems.created_at = new Date();
    newQuotesItems.updated_at = new Date();

    const savedQuotesItems = await this.quotesItemsRepository.save(newQuotesItems);
    const quotesData = await this.quotesServices.findOne(savedQuotesItems.fk_quote_id);

    savedQuotesItems.item_number = `${quotesData?.fk_serial_encoder_id}-${quotesData?.pk_quote_id}-${savedQuotesItems.pk_quote_item_id}`

    return await this.quotesItemsRepository.save(savedQuotesItems);
  }

  async remove(pk_quote_item_id: number) {
    return await this.quotesItemsRepository.delete(pk_quote_item_id);
  }

  async update(id: number, updateQuotesItemsDto: UpdateQuotesItemsDto) {
    const toUpdate = await this.quotesItemsRepository.findOne({ where: { pk_quote_item_id: id } });

    const updated = Object.assign({
      pk_quote_item_id: toUpdate?.pk_quote_item_id,
      fk_quote_id: toUpdate?.fk_quote_id,
      fk_product_id: toUpdate?.fk_product_id,
      fk_packaging_id: toUpdate?.fk_packaging_id,
      fk_trim_id: toUpdate?.fk_trim_id,
      fk_yarn_id: toUpdate?.fk_yarn_id,
      item_name: toUpdate?.item_name,
      item_description: toUpdate?.item_description,
      quantity: toUpdate?.quantity,
      unit_price: toUpdate?.unit_price,
      tax_rate: toUpdate?.tax_rate,
      created_at: toUpdate?.created_at,
      updated_at: toUpdate?.updated_at,
    }, {
      fk_product_id: updateQuotesItemsDto.fkProductID,
      fk_trim_id: updateQuotesItemsDto.fkTrimID,
      fk_yarn_id: updateQuotesItemsDto.fkYarnID,
      item_name: updateQuotesItemsDto.itemName,
      item_description: updateQuotesItemsDto.itemDescription,
      quantity: updateQuotesItemsDto.quantity,
      unit_price: updateQuotesItemsDto.unitPrice,
      tax_rate: updateQuotesItemsDto.taxRate,
      updated_at: new Date()
    });

    return await this.quotesItemsRepository.save(updated);
  }

  async findByQuoteId(quoteId: number, options: IPaginationOptions) {
    const queryBuilder = this.quotesItemsRepository
      .createQueryBuilder('quote_item')
      .where('quote_item.fk_quote_id = :quoteId', { quoteId })
      // .orderBy('quote_item.created_at', 'DESC');

    return paginate(queryBuilder, options);
  }

  async getQuoteTotals(quoteId: number) {
    // Find all items for the given quote ID
    const queryBuilder = this.quotesItemsRepository
      .createQueryBuilder('quote_item')
      .where('quote_item.fk_quote_id = :quoteId', { quoteId });

    // Calculate totals
    const totals = await queryBuilder
      .select('SUM(quote_item.quantity)', 'totalQuantity')
      .addSelect('SUM(quote_item.unit_price)', 'totalUnitPrice')
      .addSelect('SUM(quote_item.tax_rate)', 'totalTaxRate')
      .addSelect('SUM(quote_item.line_total)', 'totalLineTotal')
      .getRawOne();

    return {
      totalQuantity: Number(totals.totalQuantity) || 0,
      totalUnitPrice: Number(totals.totalUnitPrice) || 0,
      totalTaxRate: Number(totals.totalTaxRate) || 0,
      totalLineTotal: Number(totals.totalLineTotal) || 0
    };
  }
}
