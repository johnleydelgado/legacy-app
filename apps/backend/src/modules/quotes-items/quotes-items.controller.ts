import {
  Controller,
  Get,
  Req,
  HttpStatus,
  Res,
  UseGuards,
  Query,
  Param,
  Post,
  Body,
  Delete,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuotesItemsEntity } from './quotes-items.entity';
import { QuotesItemsService } from './quotes-items.service';
import { CreateQuotesItemsDto, UpdateQuotesItemsDto } from './quotes-items.dto';
import { QuotesService } from '../quotes/quotes.service';
import { ProductsService } from '../products/products.service';
import { AddressesService } from '../addresses/addresses.service';
import { TrimsService } from '../trims/trims.service';
import { PackagingService } from '../packaging/packaging.service';
import { YarnsService } from '../yarns/yarns.service';


@Controller({ version: '1', path: 'quotes-items' })
export class QuotesItemsController {
  constructor(
    private readonly quotesItemsService: QuotesItemsService,
    private readonly quotesService: QuotesService,
    private readonly productsService: ProductsService,
    private readonly addressesService: AddressesService,
    private readonly trimsService: TrimsService,
    private readonly packagingService: PackagingService,
    private readonly yarnsService: YarnsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all quotes items"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    const quotesItems = await this.quotesItemsService.findAll({ page, limit });
    const meta = quotesItems.meta;

    const normalizeData = await Promise.all(quotesItems.items.map(async (data) =>
    {
      const quotesID = data.fk_quote_id;
      const quotesData = await this.quotesService.findOne(quotesID);

      const productsID = data.fk_product_id;
      const productsData = await this.productsService.findOne(productsID);

      const trimsID = data.fk_trim_id;
      const trimsData = await this.trimsService.findOne(trimsID);

      const packagingID = data.fk_packaging_id;
      const packagingData = await this.packagingService.findOne(packagingID);

      const yarnID = data.fk_yarn_id;
      const yarnData = await this.yarnsService.findOne(yarnID);

      return {
        pk_quote_item_id: data.pk_quote_item_id,
        quote_data: Object.values(quotesData || {}).length === 0 ? { quotes_id: data.fk_quote_id } : quotesData,
        product_data: Object.values(productsData || {}).length === 0 ? { products_id: data.fk_product_id } : productsData,
        trims_data: Object.values(trimsData || {}).length === 0 ? { trim_id: data.fk_trim_id } : trimsData,
        packaging_data: Object.values(packagingData || {}).length === 0 ? { packaging_id: data.fk_packaging_id } : packagingData,
        yarn_data: Object.values(yarnData || {}).length === 0 ? { yarn_id: data.fk_yarn_id } : yarnData,
        item_number: data.item_number,
        item_name: data.item_name,
        item_description: data.item_description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        tax_rate: data.tax_rate,
        line_total: data.line_total,
        created_at: data.created_at,
        updated_at: data.updated_at
      }}));

    return { items: normalizeData, meta };
  }

  @Get('quotes/:quoteId/totals')
  async getQuoteTotals(@Param('quoteId') quoteId: number) {
    return this.quotesItemsService.getQuoteTotals(quoteId);
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const quotesItemsData = await this.quotesItemsService.findOne(id);

    const quotesID = quotesItemsData?.fk_quote_id || -1;
    const quotesData = await this.quotesService.findOne(quotesID);

    const productsID = quotesItemsData?.fk_product_id || -1;
    const productsData = await this.productsService.findOne(productsID);

    const trimsID = quotesItemsData?.fk_trim_id || -1;
    const trimsData = await this.trimsService.findOne(trimsID);

    const packagingID = quotesItemsData?.fk_packaging_id || -1;
    const packagingData = await this.packagingService.findOne(packagingID);

    const yarnID = quotesItemsData?.fk_yarn_id || -1;
    const yarnData = await this.yarnsService.findOne(yarnID);

    return {
      pk_quote_item_id: quotesItemsData?.pk_quote_item_id,
      quote_data: Object.values(quotesData || {}).length === 0 ? { quotes_id: quotesItemsData?.fk_quote_id } : quotesData,
      product_data: Object.values(productsData || {}).length === 0 ? { products_id: quotesItemsData?.fk_product_id } : productsData,
      trims_data: Object.values(trimsData || {}).length === 0 ? { trim_id: quotesItemsData?.fk_trim_id } : trimsData,
      packaging_data: Object.values(packagingData || {}).length === 0 ? { packaging_id: quotesItemsData?.fk_packaging_id } : packagingData,
      yarn_data: Object.values(yarnData || {}).length === 0 ? { yarn_id: quotesItemsData?.fk_yarn_id } : yarnData,
      item_number: quotesItemsData?.item_number,
      item_name: quotesItemsData?.item_name,
      item_description: quotesItemsData?.item_description,
      quantity: quotesItemsData?.quantity,
      unit_price: quotesItemsData?.unit_price,
      tax_rate: quotesItemsData?.tax_rate,
      line_total: quotesItemsData?.line_total,
      created_at: quotesItemsData?.created_at,
      updated_at: quotesItemsData?.updated_at
    }
  }

  @Post()
  create(@Body() createQuotesItemsDto: CreateQuotesItemsDto) {
    return this.quotesItemsService.create(createQuotesItemsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.quotesItemsService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() quotesItems: UpdateQuotesItemsDto): Promise<QuotesItemsEntity> {
    return this.quotesItemsService.update(id, quotesItems);
  }

  // constructor(private contactsService: ContactsService) {}
  // // @UseGuards(AuthGuard('jwt'))
  // @Get()
  // ping(@Req() request: Request, @Res() response: Response) {
  //   return response.status(HttpStatus.OK).json(
  //     {
  //       data: {
  //         message: "This action returns all contacts"
  //       }
  //     });
  // }
  //
  // // @UseGuards(JwtAuthGuard)
  // @Get(contactsAllURL)
  // async findAll(): Promise<ContactsEntity[]> {
  //   return this.contactsService.findAll();
  // }

  @Get('by-quote/:quoteId/all')
  async getAllByQuoteId(
    @Param('quoteId') quoteId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 100 // Default to 100 items per page, but still paginated
  ) {
    const quotesItems = await this.quotesItemsService.findByQuoteId(quoteId, { page, limit });
    const meta = quotesItems.meta;

    const normalizeData = await Promise.all(quotesItems.items.map(async (data) => {
      const quotesID = data.fk_quote_id;
      const quotesData = await this.quotesService.findOne(quotesID);

      const productsID = data.fk_product_id;
      const productsData = await this.productsService.findOne(productsID);

      const trimsID = data.fk_trim_id;
      const trimsData = await this.trimsService.findOne(trimsID);

      const packagingID = data.fk_packaging_id;
      const packagingData = await this.packagingService.findOne(packagingID);

      const yarnID = data.fk_yarn_id;
      const yarnData = await this.yarnsService.findOne(yarnID);

      return {
        pk_quote_item_id: data.pk_quote_item_id,
        product_data: Object.values(productsData || {}).length === 0 ?
          { products_id: data.fk_product_id } :
          {
            pk_product_id: productsData?.pk_product_id,
            fk_category_id: productsData?.fk_category_id,
            product_name: productsData?.product_name,
            product_price: productsData?.product_price,
            style: productsData?.style,
            product_category: {
              pk_product_category_id: productsData?.product_category.pk_product_category_id,
              category_name: productsData?.product_category.category_name,
            }
          },
        trims_data: Object.values(trimsData || {}).length === 0 ? { trim_id: data.fk_trim_id } : trimsData,
        packaging_data: Object.values(packagingData || {}).length === 0 ? { packaging_id: data.fk_packaging_id } : packagingData,
        yarn_data: Object.values(yarnData || {}).length === 0 ? { yarn_id: data.fk_yarn_id, yarn: "" } : yarnData,
        item_number: data.item_number,
        item_name: data.item_name,
        item_description: data.item_description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        tax_rate: data.tax_rate,
        line_total: data.line_total,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    }));

    return { items: normalizeData, meta };
  }
}
