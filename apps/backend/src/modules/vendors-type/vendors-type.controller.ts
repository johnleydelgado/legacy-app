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
import { VendorsTypeService } from './vendors-type.services';


@Controller({ version: '1', path: 'vendors-type' })
export class VendorsTypeController {
  constructor(
    private readonly vendorsTypeService: VendorsTypeService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all vendors types"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await this.vendorsTypeService.findAll({ page, limit });
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return await this.vendorsTypeService.findOne(id);
  }
}
