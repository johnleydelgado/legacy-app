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

import { ContactsService } from './contacts.service';
import { contactsAllURL, contactsURL } from './contacts.constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ContactsEntity } from './contacts.entity';
import { CreateContactsDto, UpdateContactsDto } from './contacts.dto';


@ApiTags('contacts')
@Controller({ version: '1', path: contactsURL })
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all contacts"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    return this.contactsService.findAll({ page, limit });
  }

  @Get('customers')
  async getAllByCustomerID(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('id') id: number
  ) {
    return this.contactsService.findAllByCustomerID({page, limit}, id);
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<ContactsEntity | null> {
    return this.contactsService.findOne(id);
  }

  @Post()
  create(@Body() createContactsDto: CreateContactsDto) {
    return this.contactsService.create(createContactsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.contactsService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() contacts: UpdateContactsDto): Promise<ContactsEntity> {
    return this.contactsService.update(id, contacts);
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

  @Get('primary/:customerId')
  async getPrimaryContactByCustomerID(
    @Param('customerId') customerId: number,
  ): Promise<ContactsEntity | null> {
    return this.contactsService.getContactByCustomerIDType(customerId);
  }

  @Get('types/:customerId/:type')
  async getContactByCustomerIDType(
    @Param('customerId') customerId: number,
    @Param('type') type: string,
  ): Promise<ContactsEntity | null> {
    return this.contactsService.getContactByCustomerIDType(customerId, type);
  }

  @Get('by-reference/:fkId/:table/:contactType')
  async getContactByFkIdAndTable(
    @Param('fkId') fkId: number,
    @Param('table') table: string,
    @Param('contactType') contactType: string,
  ): Promise<ContactsEntity | null> {
    return this.contactsService.getContactByFkIdAndTable(fkId, table, contactType);
  }
}
