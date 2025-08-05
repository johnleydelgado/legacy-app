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
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto } from './vendors.dto';
import { VendorsEntity } from './vendors.entity';
import { Request, Response } from 'express';
import { ContactsService } from '../contacts/contacts.service';
import { VendorsTypeService } from '../vendors-type/vendors-type.services';
import { VendorsServiceCategoryService } from '../vendors-service-category/vendors-service-category.services';
import { LocationTypesService } from '../location-types/location-types.service';

@Controller({ version: '1', path: 'vendors' })
export class VendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly contactsService: ContactsService,
    private readonly vendorsTypeService: VendorsTypeService,
    private readonly vendorsServiceCategoryService: VendorsServiceCategoryService,
    private readonly locationTypesService: LocationTypesService,
  ) {}  

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all vendors"
        }
      });
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const vendorsList = await this.vendorsService.findAll({ page, limit });
      const meta = vendorsList.meta;

      const normalizedVendors = await Promise.all(vendorsList.items.map(async (vendor) => {
        const contacts = await this.contactsService.getContactByFkIdAndTable(vendor.pk_vendor_id, 'vendors', 'primary');
        const vendor_type = await this.vendorsTypeService.findOne(vendor.fk_vendor_type_id);
        const vendor_service_category = await this.vendorsServiceCategoryService.findOne(vendor.fk_vendor_service_category_id);
        const location_type = await this.locationTypesService.findOne(Number(vendor.location));

        return {
          pk_vendor_id: vendor.pk_vendor_id,
          name: vendor.name,
          website_url: vendor.website_url,
          contact: {
            id: contacts?.pk_contact_id,
            first_name: contacts?.first_name,
            last_name: contacts?.last_name,
            email: contacts?.email,
            phone_number: contacts?.phone_number,
            mobile_number: contacts?.mobile_number,
            position_title: contacts?.position_title,
            contact_type: contacts?.contact_type,
          },
          vendor_type: {
            id: vendor_type?.id,
            name: vendor_type?.name,
          },
          vendor_service_category: {
            id: vendor_service_category?.id,
            name: vendor_service_category?.name,
          },
          status: vendor.status,
          location: {
            id: location_type?.pk_location_type_id,
            name: location_type?.name,
            color: location_type?.color,
          },
          user_owner: vendor.user_owner,
          created_at: vendor.created_at,
          updated_at: vendor.updated_at,
        }
      }));

      return { items: normalizedVendors, meta: meta };
    } catch (error) {
      console.error('Error in getAll vendors:', error);
      throw new HttpException(
        {
          message: 'Failed to fetch vendors',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  async search(
    @Query('q') searchTerm: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('fields') fields?: string,
    @Query('match') matchType: 'partial' | 'exact' | 'phrase' = 'partial',
  ) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
        searchTerm: '',
        searchFields: [],
        matchType,
      };
    }

    try {
      // Parse search fields from query parameter
      const searchFields = fields
        ? fields.split(',').map((f) => f.trim())
        : ['vendor_name', 'contact_name', 'contact_email', 'vendor_type', 'service_category', 'status'];

      // Validate search fields
      const allowedFields = [
        'vendor_name', 
        'vendor_email', 
        'contact_name', 
        'contact_email', 
        'vendor_type', 
        'service_category', 
        'status', 
        'industry', 
        'location'
      ];
      
      const validFields = searchFields.filter(field => allowedFields.includes(field));
      
      if (validFields.length === 0) {
        validFields.push('vendor_name'); // Default to vendor name if no valid fields
      }

      const searchResults = await this.vendorsService.searchVendorsWithDetails(
        searchTerm.trim(),
        { page, limit },
        validFields,
        matchType,
      );

      return {
        items: searchResults.items,
        meta: searchResults.meta,
        searchTerm: searchTerm.trim(),
        searchFields: validFields,
        matchType,
        total_found: searchResults.meta.totalItems,
      };
    } catch (error) {
      console.error('Vendor search error:', error);
      throw new HttpException(
        {
          message: 'Search failed',
          error: error.message,
          details: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const vendor = await this.vendorsService.findOne(id);

      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      const contacts = await this.contactsService.getContactByFkIdAndTable(vendor.pk_vendor_id, 'vendors', 'primary');
      const vendor_type = await this.vendorsTypeService.findOne(vendor.fk_vendor_type_id);
      const vendor_service_category = await this.vendorsServiceCategoryService.findOne(vendor.fk_vendor_service_category_id);
      const location_type = await this.locationTypesService.findOne(Number(vendor.location));

      return {
        pk_vendor_id: vendor.pk_vendor_id,
        name: vendor.name,
        website_url: vendor.website_url,
        contact: {
          id: contacts?.pk_contact_id,
          first_name: contacts?.first_name,
          last_name: contacts?.last_name,
          email: contacts?.email,
          phone_number: contacts?.phone_number,
          mobile_number: contacts?.mobile_number,
          position_title: contacts?.position_title,
          contact_type: contacts?.contact_type,
        },
        vendor_type: {
          id: vendor_type?.id,
          name: vendor_type?.name,
        },
        vendor_service_category: {
          id: vendor_service_category?.id,
          name: vendor_service_category?.name,
        },
        location: {
          id: location_type?.pk_location_type_id,
          name: location_type?.name,
          color: location_type?.color,
        },
        user_owner: vendor.user_owner,
        status: vendor.status,
        tags: vendor.tags,
        notes: vendor.notes,
        created_at: vendor.created_at,
        updated_at: vendor.updated_at,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch vendor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createVendorDto: CreateVendorDto) {
    try {
      return await this.vendorsService.create(createVendorDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create vendor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<VendorsEntity> {
    try {
      return await this.vendorsService.update(id, updateVendorDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update vendor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.vendorsService.remove(id);
      return { message: 'Vendor deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete vendor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // KPI Endpoints

  @Get('kpis/overview')
  async getVendorOverviewKpis() {
    try {
      return await this.vendorsService.getVendorOverviewKpi();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch vendor overview KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/comprehensive')
  async getComprehensiveKpis() {
    try {
      return await this.vendorsService.getComprehensiveVendorKpis();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch comprehensive vendor KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/vendor-types')
  async getVendorTypeBreakdown() {
    try {
      return await this.vendorsService.getVendorTypeBreakdown();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch vendor type breakdown',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/service-categories')
  async getServiceCategoryBreakdown() {
    try {
      return await this.vendorsService.getVendorServiceCategoryBreakdown();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch service category breakdown',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/products')
  async getVendorProductKpis() {
    try {
      return await this.vendorsService.getVendorProductKpis();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch vendor product KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/sales')
  async getVendorSalesKpis() {
    try {
      return await this.vendorsService.getVendorSalesKpis();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch vendor sales KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/top-performers')
  async getTopPerformingVendors(@Query('limit') limit = 10) {
    try {
      return await this.vendorsService.getTopPerformingVendors(Number(limit));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch top performing vendors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/registration-trends')
  async getRegistrationTrends(@Query('months') months = 12) {
    try {
      return await this.vendorsService.getVendorRegistrationTrends(Number(months));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch vendor registration trends',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/industries')
  async getIndustryBreakdown() {
    try {
      return await this.vendorsService.getVendorIndustryBreakdown();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch industry breakdown',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/geographic')
  async getGeographicDistribution() {
    try {
      return await this.vendorsService.getVendorGeographicDistribution();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch geographic distribution',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/individual/:id')
  async getIndividualVendorKpi(@Param('id') id: number) {
    try {
      return await this.vendorsService.getIndividualVendorKpi(Number(id));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch individual vendor KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/products-categories')
  async getVendorProductsAndCategories(
    @Param('id') id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      return await this.vendorsService.getVendorProductsAndCategories(Number(id), Number(page), Number(limit));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch vendor products and categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/compare/:vendorAId/:vendorBId')
  async compareVendors(
    @Param('vendorAId') vendorAId: number,
    @Param('vendorBId') vendorBId: number,
  ) {
    try {
      return await this.vendorsService.compareVendors(
        Number(vendorAId),
        Number(vendorBId),
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to compare vendors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
