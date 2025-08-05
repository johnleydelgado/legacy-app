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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { addressesAllURL, addressesURL } from './addresses.constants';
import { AddressesEntity } from './addresses.entity';
import { CreateAddressesDto, UpdateAddressesDto } from './addresses.dto';
import { AddressesService } from './addresses.service';

@ApiTags('addresses')
@Controller({ version: '1', path: addressesURL })
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all addresses',
      },
    });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.addressesService.findAll({ page, limit });
  }

  @Get('type')
  async getAllByType(@Query('page') page = 1, @Query('limit') limit = 10, @Query('type') type = "") {
    const addressesList = await this.addressesService.findAll({ page, limit });

    let filteredData = addressesList.items;

    if (['BILLING', 'SHIPPING'].includes(type))
      filteredData = addressesList.items.filter(data => data.address_type === type)

    return { items: filteredData, meta: addressesList.meta };
  }

  @Get('customers')
  async getAllByCustomerID(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('id') id: number,
    @Query('type') type: string,
  ) {
    return this.addressesService.findAllByCustomerID({ page, limit }, id, type);
  }

  @Get(':fk_id/:table/:address_type')
  async getAddressByDetails(
    @Param('fk_id') fk_id: number,
    @Param('table') table: string,
    @Param('address_type') address_type: string,
  ): Promise<AddressesEntity | null> {
    if (!['BILLING', 'SHIPPING'].includes(address_type)) {
      throw new BadRequestException('address_type must be either BILLING or SHIPPING');
    }

    return this.addressesService.findByDetails(fk_id, table, address_type);
  }  

  @Get(':id')
  get(@Param('id') id: number): Promise<AddressesEntity | null> {
    return this.addressesService.findOne(id);
  }

  @Post()
  create(@Body() createAddressesDto: CreateAddressesDto) {
    return this.addressesService.create(createAddressesDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.addressesService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() addresses: UpdateAddressesDto,
  ): Promise<AddressesEntity> {
    return this.addressesService.update(id, addresses);
  }
}
