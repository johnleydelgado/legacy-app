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
import { ProductsService } from './products.service';
import { productsURL, productsAllURL } from './products.constants';
import { ContactsEntity } from '../contacts/contacts.entity';
import { CreateContactsDto, UpdateContactsDto } from '../contacts/contacts.dto';
import { ProductsEntity } from './products.entity';
import { CreateProductsDto, UpdateProductsDto } from './products.dto';

@Controller({ version: '1', path: productsURL })
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all products',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.productsService.findAll({ page, limit });
  }

  @Get('with-prices')
  async getAllWithPrices(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.productsService.findAllWithPrices({ page, limit });
  }

  @Get('category')
  async getAllByCategoryID(
    @Query('id') id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productsService.findAllByCategoryID({ page, limit }, id);
  }

  @Get('category/with-prices')
  async getAllByCategoryIDWithPrices(
    @Query('id') id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productsService.findAllByCategoryIDWithPrices(
      { page, limit },
      id,
    );
  }

  @Get('search')
  async searchProducts(
    @Query('name') name: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productsService.searchByProductName({ page, limit }, name);
  }

  @Get('search/with-prices')
  async searchProductsWithPrices(
    @Query('name') name: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productsService.searchByProductNameWithPrices(
      { page, limit },
      name,
    );
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<ProductsEntity | null> {
    return this.productsService.findOne(id);
  }

  @Get(':id/with-prices')
  getWithPrices(@Param('id') id: number): Promise<ProductsEntity | null> {
    return this.productsService.findOneWithPrices(id);
  }

  @Post()
  create(@Body() createProductsDto: CreateProductsDto) {
    return this.productsService.create(createProductsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productsService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() products: UpdateProductsDto,
  ): Promise<ProductsEntity> {
    return this.productsService.update(id, products);
  }
}
