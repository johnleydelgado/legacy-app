import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoicesDTO, UpdateInvoicesDTO } from './invoices.dto';
import { CustomersService } from '../customers/customers.service';
import { ContactsService } from '../contacts/contacts.service';
import { StatusService } from '../status/status.service';
import { OrdersService } from '../orders/orders.service';
import { InvoicesEntity } from './invoices.entity';
import { SerialEncoderService } from '../serial-encoder/serial-encoder.service';


@ApiTags('invoices')
@Controller({ version: '1', path: 'invoices' })
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private customersService: CustomersService,
    private contactsService: ContactsService,
    private statusService: StatusService,
    private ordersService: OrdersService,
    private serialEncoderService: SerialEncoderService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all invoices"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const invoicePageData = await this.invoicesService.findAll({ page, limit })
    const meta = invoicePageData.meta;

    const normalizeData = await Promise.all(invoicePageData.items.map(async (data, index) => {
    const customerData = await this.customersService.findOne(data.fk_customer_id);
    const contactsData = await this.contactsService.getContactByCustomerIDType(data.fk_customer_id);
    let statusData = await this.statusService.findOne(data.fk_status_id);

    if (!statusData)
      statusData = await this.statusService.findOne(11);

    // const ordersData = await this.ordersService.findOne(data.fk_order_id);

    return {
      pk_invoice_id: data.pk_invoice_id,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      subtotal: data.subtotal,
      tax_total: data.tax_total,
      total_amount: data.total_amount,
      currency: data.currency,
      notes: data.notes,
      terms: data.terms,
      tags: data.tags,
      user_owner: data.user_owner,
      customer_data: {
        id: customerData?.pk_customer_id,
        name: customerData?.name,
        owner_name: customerData?.owner_name,
      },
      contact: {
        id: contactsData?.pk_contact_id,
        first_name: contactsData?.first_name,
        last_name: contactsData?.last_name,
      },
      // order: {
      //   id: ordersData?.pk_order_id,
      //   order_number: ordersData?.order_number,
      // },
      status: statusData,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
    }));

    return { items: normalizeData, meta };
  }

  @Get('/kpi')
  async getKpis() {
    return await this.invoicesService.getDetailedInvoiceKpis();
  }

  @Get('/search')
  async searchInvoices(
    @Query('q') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    // Validate search query
    if (!query || query.trim() === '') {
      throw new BadRequestException('Search query is required and cannot be empty');
    }

    // Validate pagination parameters
    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100');
    }

    try {
      const decodedQuery = decodeURIComponent(query.trim());
      const invoicePageData = await this.invoicesService.searchInvoices(decodedQuery, { 
        page: pageNum, 
        limit: limitNum 
      });
      const meta = invoicePageData.meta;

      const normalizeData = await Promise.all(invoicePageData.items.map(async (data) => {
        const customerData = await this.customersService.findOne(data.fk_customer_id);
        const contactsData = await this.contactsService.getContactByCustomerIDType(data.fk_customer_id);
        let statusData = await this.statusService.findOne(data.fk_status_id);

        if (!statusData)
          statusData = await this.statusService.findOne(11);

        return {
          pk_invoice_id: data.pk_invoice_id,
          invoice_number: data.invoice_number,
          invoice_date: data.invoice_date,
          due_date: data.due_date,
          subtotal: data.subtotal,
          tax_total: data.tax_total,
          total_amount: data.total_amount,
          currency: data.currency,
          notes: data.notes,
          terms: data.terms,
          tags: data.tags,
          user_owner: data.user_owner,
          customer_data: {
            id: customerData?.pk_customer_id,
            name: customerData?.name,
            owner_name: customerData?.owner_name,
          },
          contact: {
            id: contactsData?.pk_contact_id,
            first_name: contactsData?.first_name,
            last_name: contactsData?.last_name,
          },
          status: statusData,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      }));

      return { items: normalizeData, meta };
    } catch (error) {
      console.error('Error in invoice search endpoint:', error);
      throw new BadRequestException(`Failed to search invoices: ${error.message}`);
    }
  }

  @Get('/customer/:id')
  async getAllByCustomerID(@Param('id') id: number, @Query('page') page = 1, @Query('limit') limit = 10) {
    const invoicesPaginationData = await this.invoicesService.findAllByCustomerID(id, { page, limit });
    const meta = invoicesPaginationData.meta;

    const normalizeData = await Promise.all(invoicesPaginationData.items.map(async (data) => {
      const customerData = await this.customersService.findOne(data.fk_customer_id);
      const contactsData = await this.contactsService.getContactByCustomerIDType(data.fk_customer_id);
      let statusData = await this.statusService.findOne(data.fk_status_id);

      if (!statusData)
        statusData = await this.statusService.findOne(4);

      // const ordersData = await this.ordersService.findOne(data.fk_order_id);

      return {
        pk_invoice_id: data.pk_invoice_id,
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        subtotal: data.subtotal,
        tax_total: data.tax_total,
        total_amount: data.total_amount,
        currency: data.currency,
        notes: data.notes,
        terms: data.terms,
        tags: data.tags,
        user_owner: data.user_owner,
        customer_data: {
          id: customerData?.pk_customer_id,
          name: customerData?.name,
          owner_name: customerData?.owner_name,
        },
        contact: {
          id: contactsData?.pk_contact_id,
          first_name: contactsData?.first_name,
          last_name: contactsData?.last_name,
        },
        status: statusData,
        // order: {
        //   id: ordersData?.pk_order_id,
        //   order_number: ordersData?.order_number,
        // },
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const invoiceData = await this.invoicesService.findOne(id);

    if (!invoiceData) {
      return null
    }

    const customerData = await this.customersService.findOne(invoiceData?.fk_customer_id || 1);
    const contactsData = await this.contactsService.getContactByCustomerIDType(invoiceData?.fk_customer_id || 1);
    const statusData = await this.statusService.findOne(invoiceData?.fk_status_id || 11);

    const serialEncoderData = await this.serialEncoderService.findOne(invoiceData?.fk_serial_encoder_id || -1);

    console.log("serialEncoderData", serialEncoderData);

    return {
      pk_invoice_id: invoiceData.pk_invoice_id,
      invoice_number: invoiceData.invoice_number,
      serial_encoder: {
        id: serialEncoderData?.id,
        quote_id: serialEncoderData?.purpose?.quote_id,
        order_id: serialEncoderData?.purpose?.order_id,
        invoice_ids: serialEncoderData?.purpose?.invoice_ids,
        purchase_order_ids: serialEncoderData?.purpose?.purchase_order_ids,
      },
      invoice_date: invoiceData.invoice_date,
      due_date: invoiceData.due_date,
      subtotal: invoiceData.subtotal,
      tax_total: invoiceData.tax_total,
      total_amount: invoiceData.total_amount,
      currency: invoiceData.currency,
      notes: invoiceData.notes,
      terms: invoiceData.terms,
      tags: invoiceData.tags,
      user_owner: invoiceData.user_owner,
      customer_data: {
        id: customerData?.pk_customer_id,
        name: customerData?.name,
        owner_name: customerData?.owner_name,
      },
      contact: {
        id: contactsData?.pk_contact_id,
        first_name: contactsData?.first_name,
        last_name: contactsData?.last_name,
      },
      status: statusData,
      created_at: invoiceData.created_at,
      updated_at: invoiceData.updated_at
    }
  }

  @Post()
  async create(@Body() createInvoicesDto: CreateInvoicesDTO) {
    return this.invoicesService.create(createInvoicesDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.invoicesService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() orders: UpdateInvoicesDTO,
  ): Promise<InvoicesEntity> {
    return this.invoicesService.update(id, orders);
  }
}
