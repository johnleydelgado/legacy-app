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
import { VendorsServiceCategoryService } from './vendors-service-category.services';

@Controller({ version: '1', path: 'vendors-service-category' })
export class VendorsServiceCategoryController {
  constructor(
    private readonly vendorsServiceCategoryService: VendorsServiceCategoryService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all vendors service categories"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await this.vendorsServiceCategoryService.findAll({ page, limit });
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return await this.vendorsServiceCategoryService.findOne(id);
  }
}
