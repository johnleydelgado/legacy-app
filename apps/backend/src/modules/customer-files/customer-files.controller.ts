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
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CustomerFilesService } from './customer-files.service';
import { customerFilesURL } from './customer-files.constants';
import { CustomerFilesEntity } from './customer-files.entity';
import {
  CreateCustomerFilesDto,
  UpdateCustomerFilesDto,
} from './customer-files.dto';

@ApiTags('customer-files')
@Controller({ version: '1', path: customerFilesURL })
export class CustomerFilesController {
  constructor(private customerFilesService: CustomerFilesService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      data: {
        message: 'This action returns all customer files',
      },
    });
  }

  @Get()
  async getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('customerId') customerId?: number,
    @Query('mimeType') mimeType?: string,
    @Query('search') search?: string,
    @Query('showArchived') showArchived?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const filters = {
      customerId,
      mimeType,
      search,
      showArchived,
      sortBy,
      sortOrder,
    };

    return this.customerFilesService.findAllWithFilters(
      { page, limit },
      filters,
    );
  }

  @Get('customer')
  async getAllByCustomerID(
    @Query('id') id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.customerFilesService.findAllByCustomerID({ page, limit }, id);
  }

  @Get('search')
  async searchFiles(
    @Query('name') name: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.customerFilesService.searchByFileName({ page, limit }, name);
  }

  @Get('mime-type')
  async getByMimeType(
    @Query('type') type: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.customerFilesService.findByMimeType({ page, limit }, type);
  }

  @Get(':id')
  get(@Param('id') id: number): Promise<CustomerFilesEntity | null> {
    return this.customerFilesService.findOne(id);
  }

  @Post()
  create(@Body() createCustomerFilesDto: CreateCustomerFilesDto) {
    return this.customerFilesService.create(createCustomerFilesDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.customerFilesService.remove(id);
  }

  @Delete(':id/soft')
  softDelete(@Param('id') id: number) {
    return this.customerFilesService.softDelete(id);
  }

  @Delete(':id/permanent')
  permanentDelete(@Param('id') id: number) {
    return this.customerFilesService.permanentDeleteSoftDeletedFile(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() customerFiles: UpdateCustomerFilesDto,
  ): Promise<CustomerFilesEntity> {
    return this.customerFilesService.update(id, customerFiles);
  }
}
