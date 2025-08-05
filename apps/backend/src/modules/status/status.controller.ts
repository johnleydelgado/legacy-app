import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put } from '@nestjs/common';
import { Request, Response } from 'express';
import { StatusService } from './status.service';
import { StatusEntity } from './status.entity';


@Controller({ version: '1', path: 'status' })
export class StatusController {
  constructor(private statusService: StatusService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all status"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.statusService.findAll({ page, limit });
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<StatusEntity | null> {
    return this.statusService.findOne(id);
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
