import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { OrganizationsService } from './organizations.service';
import { OrganizationsEntity } from './organizations.entity';
import { CreateContactsDto, UpdateContactsDto } from '../contacts/contacts.dto';
import { CreateOrganizationDto, UpdateOrganizationDto } from './organizations.dto';
import { ContactsEntity } from '../contacts/contacts.entity';


@Controller({ version: '1', path: 'organizations' })
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all organizations"
        }
      }
    )
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.organizationsService.findAll({ page, limit });
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<OrganizationsEntity | null> {
    return this.organizationsService.findOne(id);
  }

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.organizationsService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() organization: UpdateOrganizationDto): Promise<OrganizationsEntity> {
    return this.organizationsService.update(id, organization);
  }
}
