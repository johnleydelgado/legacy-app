import {
  Controller,
  Get,
  Req,
  HttpStatus,
  Res,
  UseGuards,
  Query,
  Param,
  Post,
  Body,
  Delete,
  Put,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request, Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsCategoryService } from './products-category.service';
import { ProductsCategoryEntity } from './products-category.entity';
import { CreateProductsCategoryDto, UpdateProductsCategoryDto } from './products-category.dto';


@Controller({ version: '1', path: 'products-category' })
export class ProductsCategoryController{
  constructor(private readonly productsCategoryService: ProductsCategoryService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all products category"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.productsCategoryService.findAll({ page, limit });
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<ProductsCategoryEntity | null> {
    return this.productsCategoryService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createProductsCategoryDto: CreateProductsCategoryDto) {
    return this.productsCategoryService.create(createProductsCategoryDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productsCategoryService.remove(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: number, @Body() productsCategory: UpdateProductsCategoryDto): Promise<ProductsCategoryEntity> {
    return this.productsCategoryService.update(id, productsCategory);
  }

  // constructor(private contactsService: ContactsService) {}
  // // @UseGuards(AuthGuard('jwt'))
  // @Get()
  // ping(@Req() request: Request, @Res() response: Response) {
  //   return response.status(HttpStatus.OK).json(
  //     {
  //       data: {
  //         message: "This action returns all contacts"
  //       }
  //     });
  // }
  //
  // // @UseGuards(JwtAuthGuard)
  // @Get(contactsAllURL)
  // async findAll(): Promise<ContactsEntity[]> {
  //   return this.contactsService.findAll();
  // }
}
