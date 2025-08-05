import { Controller, Get, Req, HttpStatus, Res, Query, Param, Post, Body, Delete, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FactoriesService } from './factories.service';
import { CreateFactoriesDto, UpdateFactoriesDto, FactoryKpiSummaryDto } from './factories.dto';
import { FactoriesEntity } from './factories.entity';
import { VendorsTypeService } from '../vendors-type/vendors-type.services';
import { VendorsServiceCategoryService } from '../vendors-service-category/vendors-service-category.services';
import { LocationTypesService } from '../location-types/location-types.service';
import { ContactsService } from '../contacts/contacts.service';
import { AddressesService } from '../addresses/addresses.service';


@ApiTags('factories')
@Controller({ version: '1', path: 'factories' })
export class FactoriesController {
  constructor(
    private factoriesService: FactoriesService,
    private factoriesTypeService: VendorsTypeService,
    private factoriesServiceCategoryService: VendorsServiceCategoryService,
    private locationTypesService: LocationTypesService,
    private contactsService: ContactsService,
    private addressesService: AddressesService,
  ) {}

  @Get('/ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all factories"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const factoriesPageData = await this.factoriesService.findAll({ page, limit })
    const meta = factoriesPageData.meta;

    const normalizeData = await Promise.all(factoriesPageData.items.map(async (data, index) => {
      const factoriesTypeData = await this.factoriesTypeService.findOne(data.fk_factories_type_id);
      const factoriesServiceCategoryData = await this.factoriesServiceCategoryService.findOne(data.fk_factories_service_id);
      const locationTypesData = await this.locationTypesService.findOne(data.fk_location_id);
      const contactsData = await this.contactsService.getContactByFkIdAndTable(data.pk_factories_id, 'factories', 'primary');
      
      return {
        pk_factories_id: data.pk_factories_id,
        factories_type: {
          id: factoriesTypeData?.id,
          name: factoriesTypeData?.name,
        },
        factories_service_category: {
          id: factoriesServiceCategoryData?.id,
          name: factoriesServiceCategoryData?.name,
        },
        location_types: {
          id: locationTypesData?.pk_location_type_id,
          name: locationTypesData?.name,
          color: locationTypesData?.color,
        },
        contact: {
          id: contactsData?.pk_contact_id,
          first_name: contactsData?.first_name,
          last_name: contactsData?.last_name,
          email: contactsData?.email,
          phone_number: contactsData?.phone_number,
          mobile_number: contactsData?.mobile_number,
          position_title: contactsData?.position_title,
          contact_type: contactsData?.contact_type,
        },
        status: data.status,
        name: data.name,
        email: data.email,
        website_url: data.website_url,
        industry: data.industry,
        tags: data.tags,
        notes: data.notes,
        user_owner: data.user_owner,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get('/search')
  async searchFactories(
    @Query('q') searchQuery: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    if (!searchQuery || searchQuery.trim() === '') {
      return {
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: Number(limit),
          totalPages: 0,
          currentPage: Number(page)
        }
      };
    }

    const searchResults = await this.factoriesService.searchFactories(
      searchQuery.trim(), 
      { page: Number(page), limit: Number(limit) }
    );
    const meta = searchResults.meta;

    const normalizeData = await Promise.all(searchResults.items.map(async (data) => {
      const factoriesTypeData = await this.factoriesTypeService.findOne(data.fk_factories_type_id);
      const factoriesServiceCategoryData = await this.factoriesServiceCategoryService.findOne(data.fk_factories_service_id);
      const locationTypesData = await this.locationTypesService.findOne(data.fk_location_id);
      const contactsData = await this.contactsService.getContactByFkIdAndTable(data.pk_factories_id, 'factories', 'primary');

      return {
        pk_factories_id: data.pk_factories_id,
        factories_type: {
          id: factoriesTypeData?.id,
          name: factoriesTypeData?.name,
        },
        factories_service_category: {
          id: factoriesServiceCategoryData?.id,
          name: factoriesServiceCategoryData?.name,
        },
        location_types: {
          id: locationTypesData?.pk_location_type_id,
          name: locationTypesData?.name,
          color: locationTypesData?.color,
        },
        contact: {
          id: contactsData?.pk_contact_id,
          first_name: contactsData?.first_name,
          last_name: contactsData?.last_name,
          email: contactsData?.email,
          phone_number: contactsData?.phone_number,
          mobile_number: contactsData?.mobile_number,
          position_title: contactsData?.position_title,
          contact_type: contactsData?.contact_type,
        },
        status: data.status,
        name: data.name,
        email: data.email,
        website_url: data.website_url,
        industry: data.industry,
        tags: data.tags,
        notes: data.notes,
        user_owner: data.user_owner,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }));

    return { items: normalizeData, meta };
  }

  @Get('/kpi')
  async getFactoryKpis(): Promise<FactoryKpiSummaryDto> {
    return await this.factoriesService.getFactoryKpiSummary();
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const factoryItemsData = await this.factoriesService.findOne(id);

    if (!factoryItemsData) {
      return null
    }

    const factoriesTypeData = await this.factoriesTypeService.findOne(factoryItemsData.fk_factories_type_id);
    const factoriesServiceCategoryData = await this.factoriesServiceCategoryService.findOne(factoryItemsData.fk_factories_service_id);
    const locationTypesData = await this.locationTypesService.findOne(factoryItemsData.fk_location_id);
    const contactsData = await this.contactsService.getContactByFkIdAndTable(factoryItemsData.pk_factories_id, 'factories', 'primary');

    return {
      pk_factories_id: factoryItemsData.pk_factories_id,
      contact: {
        id: contactsData?.pk_contact_id,
        first_name: contactsData?.first_name,
        last_name: contactsData?.last_name,
        email: contactsData?.email,
        phone_number: contactsData?.phone_number,
        mobile_number: contactsData?.mobile_number,
        position_title: contactsData?.position_title,
        contact_type: contactsData?.contact_type,
      },
      factories_type: {
        id: factoriesTypeData?.id,
        name: factoriesTypeData?.name,
      },
      factories_service: {
        id: factoriesServiceCategoryData?.id,
        name: factoriesServiceCategoryData?.name,
      },
      location_types: {
        id: locationTypesData?.pk_location_type_id,
        name: locationTypesData?.name,
        color: locationTypesData?.color,
      },
      status: factoryItemsData.status,
      name: factoryItemsData.name,
      email: factoryItemsData.email,
      website_url: factoryItemsData.website_url,
      industry: factoryItemsData.industry,
      tags: factoryItemsData.tags,
      notes: factoryItemsData.notes,
      user_owner: factoryItemsData.user_owner,
      created_at: factoryItemsData.created_at,
      updated_at: factoryItemsData.updated_at,
    };
  }

  @Post()
  create(@Body() createFactoriesDto: CreateFactoriesDto) {
    return this.factoriesService.create(createFactoriesDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.factoriesService.remove(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() factories: UpdateFactoriesDto,
  ): Promise<FactoriesEntity> {
    return this.factoriesService.update(id, factories);
  }
}
