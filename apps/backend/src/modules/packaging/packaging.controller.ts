import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put } from '@nestjs/common';
import { Request, Response } from 'express';

import { PackagingService } from './packaging.service';
import { PackagingEntity } from './packaging.entity';


@Controller({ version: '1', path: 'packaging' })
export class PackagingController {
  constructor(private packagingService: PackagingService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all packaging"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.packagingService.findAll({ page, limit });
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<PackagingEntity | null> {
    return this.packagingService.findOne(id);
  }

  // @Post()
  // create(@Body() createProductsDto: CreateProductsDto) {
  //   return this.packagingService.create(createProductsDto);
  // }

  // @Delete(':id')
  // delete(@Param('id') id: number) {
  //   return this.packagingService.remove(id);
  // }

  // @Put(':id')
  // update(@Param('id') id: number, @Body() products: UpdateProductsDto): Promise<ProductsEntity> {
  //   return this.packagingService.update(id, products);
  // }
}
