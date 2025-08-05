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
import { ActivityHistoryService } from './activity-history.service';
import { ActivityHistoryEntity } from './activity-history.entity';
import { CreateActivityHistoryDTO, UpdateActivityHistoryDto } from './activity-history.dto';
import { CustomersService } from '../customers/customers.service';
import { StatusService } from '../status/status.service';
import { ActivityTypeService } from '../activity-type/activity-type.service';


@ApiTags('activity-history')
@Controller({ version: '1', path: 'activity-history' })
export class ActivityHistoryController{
  constructor(
    private readonly activityHistoryService: ActivityHistoryService,
    private readonly customersService: CustomersService,
    private readonly statusService: StatusService,
    private readonly activityTypeService: ActivityTypeService,
  ) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all activity history"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page= 1, @Query('limit') limit= 10) {
    const activityHistoryPagination = await this.activityHistoryService.findAll({ page, limit });
    const meta = activityHistoryPagination.meta;

    const normalizeData = await Promise.all(activityHistoryPagination.items.map(async(data, index) => {
      const customerData = await this.customersService.findOne(data.fk_customer_id);
      const statusData = await this.statusService.findOne(data.status);
      const activityType = await this.activityTypeService.findByTypeName(data.activity_type);

      return {
        pk_activity_id: data.pk_activity_id,
        customer_data: {
          id: customerData?.pk_customer_id,
          name: customerData?.name,
          owner_name: customerData?.owner_name,
        },
        status_data: {
          id: statusData?.id,
          status: statusData?.status,
          process: statusData?.process,
          color: statusData?.color
        },
        tags: data.tags,
        activity: data.activity,
        activity_type: {
          id: activityType?.id,
          type_name: activityType?.type_name,
          color: activityType?.color,
        },
        document_id: data.document_id,
        document_type: data.document_type,
        user_owner: data.user_owner,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }))

    return { items: normalizeData, meta };
  }

  @Get('customer/:customerId')
  async getByCustomerId(
    @Param('customerId') customerId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    const activityHistoryPagination = await this.activityHistoryService.findByCustomerId(customerId, { page, limit });
    const meta = activityHistoryPagination.meta;

    const normalizeData = await Promise.all(activityHistoryPagination.items.map(async(data, index) => {
      const customerData = await this.customersService.findOne(data.fk_customer_id);
      const statusData = await this.statusService.findOne(data.status);
      const activityType = await this.activityTypeService.findByTypeName(data.activity_type);

      return {
        pk_activity_id: data.pk_activity_id,
        customer_data: {
          id: customerData?.pk_customer_id,
          name: customerData?.name,
          owner_name: customerData?.owner_name,
        },
        status_data: {
          id: statusData?.id,
          status: statusData?.status,
          process: statusData?.process,
          color: statusData?.color
        },
        tags: data.tags,
        activity: data.activity,
        activity_type: {
          id: activityType?.id,
          type_name: activityType?.type_name,
          color: activityType?.color,
        },
        document_id: data.document_id,
        document_type: data.document_type,
        user_owner: data.user_owner,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }))

    return { items: normalizeData, meta };
  }

  @Get('document/:documentID')
  async getByDocumentId(
    @Param('documentID') documentID: number,
    @Query('documentType') documentType: string,
    @Query('activityTypeNames') activityTypeNames?: string[],
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    const typeNames = activityTypeNames 
      ? Array.isArray(activityTypeNames) 
        ? activityTypeNames 
        : [activityTypeNames]
      : undefined;

    const activityHistoryPagination = await this.activityHistoryService.findByDocumentId(documentID, documentType, typeNames, { page, limit });
    const meta = activityHistoryPagination.meta;

    const normalizeData = await Promise.all(activityHistoryPagination.items.map(async(data, index) => {
      const customerData = await this.customersService.findOne(data.fk_customer_id);
      const statusData = await this.statusService.findOne(data.status);
      const activityType = await this.activityTypeService.findByTypeName(data.activity_type);

      return {
        pk_activity_id: data.pk_activity_id,
        customer_data: {
          id: customerData?.pk_customer_id,
          name: customerData?.name,
          owner_name: customerData?.owner_name,
        },
        status_data: {
          id: statusData?.id,
          status: statusData?.status,
          process: statusData?.process,
          color: statusData?.color
        },
        tags: data.tags,
        activity: data.activity,
        activity_type: {
          id: activityType?.id,
          type_name: activityType?.type_name,
          color: activityType?.color,
        },
        document_id: data.document_id,
        document_type: data.document_type,
        user_owner: data.user_owner,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }));

    return {items: normalizeData, meta};
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const activityHistoryData = await this.activityHistoryService.findOne(id);
    const customerData = await this.customersService.findOne(activityHistoryData?.fk_customer_id || -1);
    const statusData = await this.statusService.findOne(activityHistoryData?.status || -1);
    const activityType = await this.activityTypeService.findByTypeName(activityHistoryData?.activity_type || "");


    return {
      pk_activity_id: activityHistoryData?.pk_activity_id,
      customer_data: {
        id: customerData?.pk_customer_id,
        name: customerData?.name,
        owner_name: customerData?.owner_name,
      },
      status_data: {
        id: statusData?.id,
        status: statusData?.status,
        process: statusData?.process,
        color: statusData?.color
      },
      tags: activityHistoryData?.tags,
      activity: activityHistoryData?.activity,
      activity_type: {
        id: activityType?.id,
        type_name: activityType?.type_name,
        color: activityType?.color,
      },
      document_id: activityHistoryData?.document_id,
      document_type: activityHistoryData?.document_type,
      user_owner: activityHistoryData?.user_owner,
      created_at: activityHistoryData?.created_at,
      updated_at: activityHistoryData?.updated_at,
    }
  }

  @Post()
  create(@Body() createActivityHistoryDTO: CreateActivityHistoryDTO) {
    return this.activityHistoryService.create(createActivityHistoryDTO);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.activityHistoryService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() activityHistory: UpdateActivityHistoryDto): Promise<ActivityHistoryEntity> {
    return this.activityHistoryService.update(id, activityHistory);
  }
}
