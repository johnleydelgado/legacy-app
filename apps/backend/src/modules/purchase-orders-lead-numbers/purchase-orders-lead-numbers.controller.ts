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
import { PurchaseOrdersLeadNumbersService } from './purchase-orders-lead-numbers.services';


@Controller({ version: '1', path: 'purchase-orders-lead-numbers' })
export class PurchaseOrdersLeadNumbersController {
  constructor(
    private readonly purchaseOrdersLeadNumbersService: PurchaseOrdersLeadNumbersService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all purchase orders lead numbers"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await this.purchaseOrdersLeadNumbersService.findAll({ page, limit });
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return await this.purchaseOrdersLeadNumbersService.findOne(id);
  }
}
