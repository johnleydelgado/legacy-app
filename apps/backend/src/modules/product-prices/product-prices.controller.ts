import {
  Controller,
  Get,
  Req,
  HttpStatus,
  Res,
  Query,
  Param,
  Post,
  Body,
  Delete,
  Put,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProductPricesService } from './product-prices.service';
import { productPricesURL } from './product-prices.constants';
import { ProductPricesEntity } from './product-prices.entity';
import {
  CreateProductPricesDto,
  UpdateProductPricesDto,
} from './product-prices.dto';

@Controller({ version: '1', path: productPricesURL })
export class ProductPricesController {
  constructor(private productPricesService: ProductPricesService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all product prices',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.productPricesService.findAll({ page, limit });
  }

  @Get('product')
  async getAllByProductId(
    @Query('productId') productId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productPricesService.findAllByProductId(
      { page, limit },
      productId,
    );
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<ProductPricesEntity | null> {
    return this.productPricesService.findOne(id);
  }

  @Post()
  create(@Body() createProductPricesDto: CreateProductPricesDto) {
    return this.productPricesService.create(createProductPricesDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productPricesService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateProductPricesDto: UpdateProductPricesDto,
  ): Promise<ProductPricesEntity> {
    return this.productPricesService.update(id, updateProductPricesDto);
  }
}
