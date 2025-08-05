import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put } from '@nestjs/common';
import { Request, Response } from 'express';
import { YarnsService } from './yarns.service';
import { YarnEntity } from './yarns.entity';


@Controller({ version: '1', path: 'yarns' })
export class YarnsController {
  constructor(private yarnsService: YarnsService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all yarns"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.yarnsService.findAll({ page, limit });
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<YarnEntity | null> {
    return this.yarnsService.findOne(id);
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
