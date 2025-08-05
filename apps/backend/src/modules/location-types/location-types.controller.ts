import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put } from '@nestjs/common';
import { Request, Response } from 'express';
import { LocationTypesService } from './location-types.service';
import { LocationTypesEntity } from './location-types.entity';


@Controller({ version: '1', path: 'location-types' })
export class LocationTypesController {
  constructor(private locationTypesService: LocationTypesService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all location types"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.locationTypesService.findAll({ page, limit });
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<LocationTypesEntity | null> {
    return this.locationTypesService.findOne(id);
  }
}
