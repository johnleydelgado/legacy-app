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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomersAddressesService } from './customers-addresses.service';
import { CustomersAddressesEntity } from './customers-addresses.entity';
import { CreateCustomersAddressDto, UpdateCustomersAddressDto } from './customers-addresses.dto';


@ApiTags('customers-addresses')
@Controller({ version: '1', path: 'customers-addresses' })
export class CustomersAddressesController{
  constructor(private readonly customersAddressesService: CustomersAddressesService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all customers addresses"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.customersAddressesService.findAll({ page, limit });
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<CustomersAddressesEntity | null> {
    return this.customersAddressesService.findOne(id);
  }

  @Post()
  create(@Body() createCustomersAddressDto: CreateCustomersAddressDto) {
    return this.customersAddressesService.create(createCustomersAddressDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.customersAddressesService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() customersAddress: UpdateCustomersAddressDto): Promise<CustomersAddressesEntity> {
    return this.customersAddressesService.update(id, customersAddress);
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
