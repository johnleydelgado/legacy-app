import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put } from '@nestjs/common';
import { Request, Response } from 'express';
import { TrimsEntity } from './trims.entity';
import { TrimsService } from './trims.service';


@Controller({ version: '1', path: 'trims' })
export class TrimsController {
  constructor(private trimsService: TrimsService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all trims"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.trimsService.findAll({ page, limit });
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<TrimsEntity | null> {
    return this.trimsService.findOne(id);
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
