import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put } from '@nestjs/common';
import { Request, Response } from 'express';
import { InvoicesItemsService } from './invoices-items.service';
import { CreateInvoicesItemsDTO, UpdateInvoicesItemsDTO } from './invoices-items.dto';
import { ProductsService } from '../products/products.service';
import { AddressesService } from '../addresses/addresses.service';
import { InvoicesItemsEntity } from './invoices-items.entity';


@Controller({ version: '1', path: 'invoices-items' })
export class InvoicesItemsController {
  constructor(
    private invoicesItemsService: InvoicesItemsService,
    private productsService: ProductsService,
    private addressesService: AddressesService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all invoices items"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {4
    const invoiceItemsPageData = await this.invoicesItemsService.findAll({ page, limit });
    const meta = invoiceItemsPageData.meta;

    const normalizeData = await Promise.all(invoiceItemsPageData.items.map(async (data, index) => {
      const productsData = await this.productsService.findOne(data.fk_product_id);

      return {
        pk_invoice_items_id: data.pk_invoice_item_id,
        fk_invoice_id: data.fk_invoice_id,
        products_data: {
          id: productsData?.pk_product_id,
          style: productsData?.style,
          product_name: productsData?.product_name,
        },
        category_data: {
          id: productsData?.product_category?.pk_product_category_id,
          category_name: productsData?.product_category?.category_name,
        },
        item_number: data.item_number,
        item_name: data.item_name,
        item_description: data.item_description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        tax_rate: data.tax_rate,
        line_total: data.line_total,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get('/invoice/:id')
  async getAllByInvoiceID(@Param('id') id: number, @Query('page') page = 1, @Query('limit') limit = 10) {
    const invoicesItemsPaginationData = await this.invoicesItemsService.findAllByInvoiceID(id, { page, limit });
    const meta = invoicesItemsPaginationData.meta;

    const normalizeData = await Promise.all(invoicesItemsPaginationData.items.map(async (data) => {
      const productsData = await this.productsService.findOne(data.fk_product_id);

      return {
        pk_invoice_items_id: data.pk_invoice_item_id,
        fk_invoice_id: data.fk_invoice_id,
        products_data: {
          id: productsData?.pk_product_id,
          style: productsData?.style,
          product_name: productsData?.product_name,
        },
        category_data: {
          id: productsData?.product_category?.pk_product_category_id,
          category_name: productsData?.product_category?.category_name,
        },
        item_number: data.item_number,
        item_name: data.item_name,
        item_description: data.item_description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        tax_rate: data.tax_rate,
        line_total: data.line_total,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const invoiceItemsData = await this.invoicesItemsService.findOne(id);

    if (!invoiceItemsData) {
      return null
    }

    const productsData = await this.productsService.findOne(invoiceItemsData.fk_product_id);

    return {
      pk_invoice_item_id: invoiceItemsData.pk_invoice_item_id,
      fk_invoice_id: invoiceItemsData.fk_invoice_id,
      products_data: {
        id: productsData?.pk_product_id,
        style: productsData?.style,
        product_name: productsData?.product_name,
      },
      category_data: {
        id: productsData?.product_category?.pk_product_category_id,
        category_name: productsData?.product_category?.category_name,
      },
      item_number: invoiceItemsData.item_number,
      item_name: invoiceItemsData.item_name,
      item_description: invoiceItemsData.item_description,
      quantity: invoiceItemsData.quantity,
      unit_price: invoiceItemsData.unit_price,
      tax_rate: invoiceItemsData.tax_rate,
      line_total: invoiceItemsData.line_total,
      created_at: invoiceItemsData.created_at,
      updated_at: invoiceItemsData.updated_at
    }
  }

  @Post()
  async create(@Body() createInvoicesItemsDto: CreateInvoicesItemsDTO) {
    return this.invoicesItemsService.create(createInvoicesItemsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.invoicesItemsService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() orders: UpdateInvoicesItemsDTO,
  ): Promise<InvoicesItemsEntity> {
    return this.invoicesItemsService.update(id, orders);
  }
}
