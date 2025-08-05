import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus, Req, Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PurchaseOrdersShippingMethodsService } from './purchase-orders-shipping-methods.services';


@Controller({ version: '1', path: 'purchase-orders-shipping-methods' })
export class PurchaseOrdersShippingMethodsController {
  constructor(
    private readonly purchaseOrdersShippingMethodsService: PurchaseOrdersShippingMethodsService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all purchase orders shipping methods"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await this.purchaseOrdersShippingMethodsService.findAll({ page, limit });
  }

  @Get('by-transaction-type/:transactionType')
  async getByTransactionType(
    @Param('transactionType') transactionType: string,
    @Query('page') page = 1, 
    @Query('limit') limit = 10
  ) {
    return await this.purchaseOrdersShippingMethodsService.findByTransactionType(
      transactionType, 
      { page, limit }
    );
  }

  @Get('from-factory')
  async getFromFactory(
    @Query('page') page = 1, 
    @Query('limit') limit = 10
  ) {
    return await this.purchaseOrdersShippingMethodsService.findByFromFactory({ page, limit });
  }

  @Get('from-customer')
  async getFromCustomer(
    @Query('page') page = 1, 
    @Query('limit') limit = 10
  ) {
    return await this.purchaseOrdersShippingMethodsService.findByFromCustomer({ page, limit });
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return await this.purchaseOrdersShippingMethodsService.findOne(id);
  }
}
