import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Between, In } from 'typeorm';
import { VendorsEntity, VendorStatus } from './vendors.entity';
import { CreateVendorDto, UpdateVendorDto, VendorOverviewKpiDto, VendorTypeBreakdownDto, VendorServiceCategoryBreakdownDto, VendorProductKpiDto, VendorSalesKpiDto, VendorRegistrationTrendDto, VendorPerformanceRankingDto, VendorKpiSummaryDto, VendorIndustryBreakdownDto, VendorGeographicDistributionDto, IndividualVendorKpiDto, VendorComparisonKpiDto, VendorProductsAndCategoriesDto, VendorProductCategoryDto, VendorProductsAndCategoriesPaginatedDto } from './vendors.dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { ProductsEntity } from '../products/products.entity';
import { ProductsCategoryEntity } from '../products-category/products-category.entity';
import { OrderItemsEntity } from '../order-items/order-items.entity';
import { VendorsTypeEntity } from '../vendors-type/vendors-type.entity';
import { VendorsServiceCategoryEntity } from '../vendors-service-category/vendors-service-category.entity';
import { LocationTypesEntity } from '../location-types/location-types.entity';
import { isValidJSON } from 'src/utils/string_tools';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(VendorsEntity)
    private readonly vendorsRepository: Repository<VendorsEntity>,
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,
    @InjectRepository(ProductsCategoryEntity)
    private readonly productsCategoryRepository: Repository<ProductsCategoryEntity>,
    @InjectRepository(OrderItemsEntity)
    private readonly orderItemsRepository: Repository<OrderItemsEntity>,
    @InjectRepository(VendorsTypeEntity)
    private readonly vendorsTypeRepository: Repository<VendorsTypeEntity>,
    @InjectRepository(VendorsServiceCategoryEntity)
    private readonly vendorsServiceCategoryRepository: Repository<VendorsServiceCategoryEntity>,
    @InjectRepository(LocationTypesEntity)
    private readonly locationTypesRepository: Repository<LocationTypesEntity>,
  ) {}

  async findAll(
    options: IPaginationOptions,
  ): Promise<Pagination<VendorsEntity>> {
    try {
      const queryBuilder = this.vendorsRepository.createQueryBuilder('vendor');
      queryBuilder.orderBy('vendor.name', 'ASC');

      return await paginate<VendorsEntity>(queryBuilder, options);
    } catch (error) {
      console.error('Error in vendors findAll:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<VendorsEntity | null> {
    const vendor = await this.vendorsRepository.findOne({
      where: { pk_vendor_id: id },
      relations: ['products'],
    });

    if (!vendor) {
      return null;
    }

    return vendor;
  }

  async create(createVendorDto: CreateVendorDto): Promise<VendorsEntity> {
    const newVendor = new VendorsEntity();

    newVendor.fk_vendor_type_id = createVendorDto.fkVendorTypeId;
    newVendor.fk_vendor_service_category_id = createVendorDto.fkVendorServiceCategoryId;
    newVendor.status = createVendorDto.status;
    newVendor.name = createVendorDto.name;
    newVendor.website_url = createVendorDto.websiteURL || '---';
    newVendor.location = String(createVendorDto.location || 0);
    newVendor.notes = createVendorDto.notes || '---';
    newVendor.user_owner = createVendorDto.userOwner || 'system';
    newVendor.created_at = new Date();
    newVendor.updated_at = new Date();

    return await this.vendorsRepository.save(newVendor);
  }

  async update(
    pk_vendor_id: number,
    updateVendorDto: UpdateVendorDto,
  ): Promise<VendorsEntity> {
    const toUpdate = await this.vendorsRepository.findOne({
      where: { pk_vendor_id },
    });

    const updated = Object.assign(
      {
        pk_vendor_id: toUpdate?.pk_vendor_id,
        fk_vendor_type_id: toUpdate?.fk_vendor_type_id,
        fk_vendor_service_category_id: toUpdate?.fk_vendor_service_category_id,
        status: toUpdate?.status,
        name: toUpdate?.name,
        location: toUpdate?.location,
        email: toUpdate?.email,
        phone_number: toUpdate?.phone_number,
        website_url: toUpdate?.website_url,
        billing_address: toUpdate?.billing_address,
        shipping_address: toUpdate?.shipping_address,
        city: toUpdate?.city,
        state: toUpdate?.state,
        postal_code: toUpdate?.postal_code,
        country: toUpdate?.country,
        industry: toUpdate?.industry,
        vat_number: toUpdate?.vat_number,
        tax_id: toUpdate?.tax_id,
        tags: toUpdate?.tags,
        notes: toUpdate?.notes,
        user_owner: toUpdate?.user_owner,
        created_at: toUpdate?.created_at,
        updated_at: toUpdate?.updated_at,
      },
      {
        fk_vendor_type_id: updateVendorDto.fkVendorTypeId,
        fk_vendor_service_category_id: updateVendorDto.fkVendorServiceCategoryId,
        status: updateVendorDto.status,
        name: updateVendorDto.name,
        website_url: updateVendorDto.websiteURL,
        location: String(updateVendorDto.location || 0),
        tags: isValidJSON(updateVendorDto.tags) ? updateVendorDto.tags : '[]',
        notes: updateVendorDto.notes,
        updated_at: new Date(),
      },
    );

    return await this.vendorsRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const vendor = await this.findOne(id);

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    await this.vendorsRepository.remove(vendor);
  }

  async searchVendors(
    searchTerm: string,
    options: IPaginationOptions,
    searchFields: string[] = ['vendor_name', 'contact_name', 'contact_email', 'vendor_type', 'service_category', 'status'],
    matchType: 'partial' | 'exact' | 'phrase' = 'phrase',
  ): Promise<Pagination<VendorsEntity>> {
    const queryBuilder = this.vendorsRepository.createQueryBuilder('vendor')
      .leftJoin('Contacts', 'contact', 'contact.fk_id = vendor.pk_vendor_id AND contact.table = :contactTable', { contactTable: 'vendors' })
      .leftJoin('VendorsType', 'vendorType', 'vendorType.id = vendor.fk_vendor_type_id')
      .leftJoin('VendorServiceCategory', 'serviceCategory', 'serviceCategory.id = vendor.fk_vendor_service_category_id')
      .select([
        'vendor.pk_vendor_id',
        'vendor.name',
        'vendor.email',
        'vendor.phone_number',
        'vendor.status',
        'vendor.industry',
        'vendor.website_url',
        'vendor.city',
        'vendor.state',
        'vendor.country',
        'vendor.location',
        'vendor.notes',
        'vendor.user_owner',
        'vendor.created_at',
        'vendor.updated_at',
        'vendor.fk_vendor_type_id',
        'vendor.fk_vendor_service_category_id'
      ]);

    if (searchTerm) {
      const whereConditions: string[] = [];
      const operator = matchType === 'exact' ? '=' : 'LIKE';
      const searchValue = matchType === 'exact' ? searchTerm : `%${searchTerm}%`;

      // Search by vendor name
      if (searchFields.includes('vendor_name')) {
        whereConditions.push(`vendor.name ${operator} :searchTerm`);
      }

      // Search by vendor email
      if (searchFields.includes('vendor_email')) {
        whereConditions.push(`vendor.email ${operator} :searchTerm`);
      }

      // Search by contact name (first_name + last_name)
      if (searchFields.includes('contact_name')) {
        whereConditions.push(`CONCAT(COALESCE(contact.first_name, ''), ' ', COALESCE(contact.last_name, '')) ${operator} :searchTerm`);
        whereConditions.push(`contact.first_name ${operator} :searchTerm`);
        whereConditions.push(`contact.last_name ${operator} :searchTerm`);
      }

      // Search by contact email
      if (searchFields.includes('contact_email')) {
        whereConditions.push(`contact.email ${operator} :searchTerm`);
      }

      // Search by vendor type
      if (searchFields.includes('vendor_type')) {
        whereConditions.push(`vendorType.name ${operator} :searchTerm`);
      }

      // Search by service category
      if (searchFields.includes('service_category')) {
        whereConditions.push(`serviceCategory.name ${operator} :searchTerm`);
      }

      // Search by status
      if (searchFields.includes('status')) {
        whereConditions.push(`vendor.status ${operator} :searchTerm`);
      }

      // Search by industry
      if (searchFields.includes('industry')) {
        whereConditions.push(`vendor.industry ${operator} :searchTerm`);
      }

      // Search by location
      if (searchFields.includes('location')) {
        whereConditions.push(`vendor.city ${operator} :searchTerm`);
        whereConditions.push(`vendor.state ${operator} :searchTerm`);
        whereConditions.push(`vendor.country ${operator} :searchTerm`);
      }

      if (whereConditions.length > 0) {
        queryBuilder.where(`(${whereConditions.join(' OR ')})`, {
          searchTerm: searchValue
        });
      }
    }

    queryBuilder.orderBy('vendor.created_at', 'DESC');

    return paginate<VendorsEntity>(queryBuilder, options);
  }

  async searchVendorsWithDetails(
    searchTerm: string,
    options: IPaginationOptions,
    searchFields: string[] = ['vendor_name', 'contact_name', 'contact_email', 'vendor_type', 'service_category', 'location', 'status'],
    matchType: 'partial' | 'exact' | 'phrase' = 'phrase',
  ) {
    const paginatedResults = await this.searchVendors(searchTerm, options, searchFields, matchType);
    
    // Transform results to include contact, vendor type, and service category details
    const normalizedVendors = await Promise.all(paginatedResults.items.map(async (vendor) => {
      // Get contacts for this vendor
      const contact = await this.vendorsRepository.manager
        .createQueryBuilder()
        .select([
          'contact.pk_contact_id as pk_contact_id',
          'contact.first_name as first_name',
          'contact.last_name as last_name',
          'contact.email as email',
          'contact.phone_number as phone_number',
          'contact.mobile_number as mobile_number',
          'contact.position_title as position_title',
          'contact.contact_type as contact_type'
        ])
        .from('Contacts', 'contact')
        .where('contact.fk_id = :vendorId', { vendorId: vendor.pk_vendor_id })
        .andWhere('contact.table = :table', { table: 'vendors' })
        .andWhere('contact.contact_type = :contactType', { contactType: 'primary' })
        .getRawOne();

      // Get vendor type
      const vendorType = await this.vendorsTypeRepository.findOne({
        where: { id: vendor.fk_vendor_type_id }
      });

      // Get service category
      const serviceCategory = await this.vendorsServiceCategoryRepository.findOne({
        where: { id: vendor.fk_vendor_service_category_id }
      });

      // Get location type
      const locationType = await this.locationTypesRepository.findOne({
        where: { pk_location_type_id: Number(vendor.location || 0) }
      });

      return {
        pk_vendor_id: vendor.pk_vendor_id,
        name: vendor.name,
        website_url: vendor.website_url,
        industry: vendor.industry,
        contact: contact ? {
          id: contact.pk_contact_id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone_number: contact.phone_number,
          mobile_number: contact.mobile_number,
          position_title: contact.position_title,
          contact_type: contact.contact_type,
        } : null,
        vendor_type: vendorType ? {
          id: vendorType.id,
          name: vendorType.name,
        } : null,
        vendor_service_category: serviceCategory ? {
          id: serviceCategory.id,
          name: serviceCategory.name,
        } : null,
        location: locationType ? {
          id: locationType.pk_location_type_id,
          name: locationType.name,
          color: locationType.color,
        } : null,
        notes: vendor.notes,
        user_owner: vendor.user_owner,
        status: vendor.status,
        created_at: vendor.created_at,
        updated_at: vendor.updated_at,
      };
    }));

    return {
      items: normalizedVendors,
      meta: paginatedResults.meta
    };
  }

  // KPI Methods

  async getVendorOverviewKpi(): Promise<VendorOverviewKpiDto> {
    const total = await this.vendorsRepository.count();
    const active = await this.vendorsRepository.count({
      where: { status: VendorStatus.ACTIVE }
    });
    const blocked = await this.vendorsRepository.count({
      where: { status: VendorStatus.BLOCKED }
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = await this.vendorsRepository.count({
      where: {
        created_at: MoreThanOrEqual(thirtyDaysAgo)
      }
    });

    // Previous 30-day period for growth calculation
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const previousPeriod = await this.vendorsRepository.count({
      where: {
        created_at: Between(sixtyDaysAgo, thirtyDaysAgo)
      }
    });

    const growthRate = previousPeriod > 0 ? 
      ((recent - previousPeriod) / previousPeriod) * 100 : 0;

    return {
      total_vendors: total,
      active_vendors: active,
      blocked_vendors: blocked,
      recent_registrations: recent,
      growth_rate: Math.round(growthRate * 100) / 100
    };
  }

  async getVendorTypeBreakdown(): Promise<VendorTypeBreakdownDto[]> {
    const totalVendors = await this.vendorsRepository.count();
    
    const result = await this.vendorsRepository
      .createQueryBuilder('vendor')
      .leftJoin('vendor.fk_vendor_type_id', 'vendorType')
      .select('vendor.fk_vendor_type_id', 'vendor_type_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vendor.fk_vendor_type_id')
      .getRawMany();

    const breakdown: VendorTypeBreakdownDto[] = [];
    
    for (const item of result) {
      const vendorType = await this.vendorsTypeRepository.findOne({
        where: { id: item.vendor_type_id }
      });
      
      breakdown.push({
        vendor_type_id: item.vendor_type_id,
        vendor_type_name: vendorType?.name || 'Unknown',
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / totalVendors) * 10000) / 100
      });
    }

    return breakdown.sort((a, b) => b.count - a.count);
  }

  async getVendorServiceCategoryBreakdown(): Promise<VendorServiceCategoryBreakdownDto[]> {
    const totalVendors = await this.vendorsRepository.count();
    
    const result = await this.vendorsRepository
      .createQueryBuilder('vendor')
      .select('vendor.fk_vendor_service_category_id', 'service_category_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vendor.fk_vendor_service_category_id')
      .getRawMany();

    const breakdown: VendorServiceCategoryBreakdownDto[] = [];
    
    for (const item of result) {
      const serviceCategory = await this.vendorsServiceCategoryRepository.findOne({
        where: { id: item.service_category_id }
      });
      
      breakdown.push({
        service_category_id: item.service_category_id,
        service_category_name: serviceCategory?.name || 'Unknown',
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / totalVendors) * 10000) / 100
      });
    }

    return breakdown.sort((a, b) => b.count - a.count);
  }

  async getVendorProductKpis(): Promise<VendorProductKpiDto[]> {
    const vendors = await this.vendorsRepository.find({
      relations: ['products']
    });

    const kpis: VendorProductKpiDto[] = [];

    for (const vendor of vendors) {
      const products = await this.productsRepository.find({
        where: { fk_vendor_id: vendor.pk_vendor_id },
        relations: ['product_category']
      });

      const totalProducts = products.length;
      const totalInventoryValue = products.reduce((sum, product) => 
        sum + (product.product_price * product.inventory), 0);
      const averageProductPrice = totalProducts > 0 ? 
        products.reduce((sum, product) => sum + product.product_price, 0) / totalProducts : 0;
      
      const categoryNames = [...new Set(products
        .filter(p => p.product_category)
        .map(p => p.product_category.category_name || 'Unknown'))];

      kpis.push({
        vendor_id: vendor.pk_vendor_id,
        vendor_name: vendor.name,
        total_products: totalProducts,
        total_inventory_value: Math.round(totalInventoryValue * 100) / 100,
        average_product_price: Math.round(averageProductPrice * 100) / 100,
        product_categories: categoryNames
      });
    }

    return kpis.sort((a, b) => b.total_inventory_value - a.total_inventory_value);
  }

  async getVendorSalesKpis(): Promise<VendorSalesKpiDto[]> {
    const vendors = await this.vendorsRepository.find();
    const kpis: VendorSalesKpiDto[] = [];

    for (const vendor of vendors) {
      const products = await this.productsRepository.find({
        where: { fk_vendor_id: vendor.pk_vendor_id }
      });

      if (products.length === 0) {
        kpis.push({
          vendor_id: vendor.pk_vendor_id,
          vendor_name: vendor.name,
          total_revenue: 0,
          order_count: 0,
          total_units_sold: 0,
          average_order_value: 0,
          last_order_date: null
        });
        continue;
      }

      const productIds = products.map(p => p.pk_product_id);
      
      const orderItems = await this.orderItemsRepository.find({
        where: { fk_product_id: In(productIds) }
      });

      const totalRevenue = orderItems.reduce((sum, item) => sum + item.line_total, 0);
      const totalUnitsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueOrders = [...new Set(orderItems.map(item => item.fk_order_id))];
      const orderCount = uniqueOrders.length;
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
      
      // Get last order date
      const lastOrderItem = await this.orderItemsRepository
        .createQueryBuilder('item')
        .where('item.fk_product_id IN (:...productIds)', { productIds })
        .orderBy('item.created_at', 'DESC')
        .getOne();

      kpis.push({
        vendor_id: vendor.pk_vendor_id,
        vendor_name: vendor.name,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        order_count: orderCount,
        total_units_sold: totalUnitsSold,
        average_order_value: Math.round(averageOrderValue * 100) / 100,
        last_order_date: lastOrderItem?.created_at || null
      });
    }

    return kpis.sort((a, b) => b.total_revenue - a.total_revenue);
  }

  async getVendorRegistrationTrends(months: number = 12): Promise<VendorRegistrationTrendDto[]> {
    const trends: VendorRegistrationTrendDto[] = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const totalCount = await this.vendorsRepository.count({
        where: {
          created_at: Between(startOfMonth, endOfMonth)
        }
      });

      const activeCount = await this.vendorsRepository.count({
        where: {
          created_at: Between(startOfMonth, endOfMonth),
          status: VendorStatus.ACTIVE
        }
      });

      const blockedCount = await this.vendorsRepository.count({
        where: {
          created_at: Between(startOfMonth, endOfMonth),
          status: VendorStatus.BLOCKED
        }
      });

      trends.push({
        period,
        vendor_count: totalCount,
        active_vendors: activeCount,
        blocked_vendors: blockedCount
      });
    }

    return trends;
  }

  async getTopPerformingVendors(limit: number = 10): Promise<VendorPerformanceRankingDto[]> {
    const salesKpis = await this.getVendorSalesKpis();
    const productKpis = await this.getVendorProductKpis();
    
    const rankings: VendorPerformanceRankingDto[] = [];

    for (const vendor of salesKpis.slice(0, limit)) {
      const productKpi = productKpis.find(p => p.vendor_id === vendor.vendor_id);
      
      // Calculate performance score (weighted combination of metrics)
      const revenueScore = vendor.total_revenue * 0.4;
      const orderScore = vendor.order_count * 0.3;
      const productScore = (productKpi?.total_products || 0) * 0.3;
      const score = revenueScore + orderScore + productScore;

      rankings.push({
        vendor_id: vendor.vendor_id,
        vendor_name: vendor.vendor_name,
        rank: 0, // Will be set after sorting
        score: Math.round(score * 100) / 100,
        total_revenue: vendor.total_revenue,
        product_count: productKpi?.total_products || 0,
        order_count: vendor.order_count
      });
    }

    // Sort by score and assign ranks
    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    return rankings;
  }

  async getVendorIndustryBreakdown(): Promise<VendorIndustryBreakdownDto[]> {
    const totalVendors = await this.vendorsRepository.count();
    
    const result = await this.vendorsRepository
      .createQueryBuilder('vendor')
      .select('vendor.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .where('vendor.industry IS NOT NULL AND vendor.industry != ""')
      .groupBy('vendor.industry')
      .getRawMany();

    return result.map(item => ({
      industry: item.industry || 'Unknown',
      count: parseInt(item.count),
      percentage: Math.round((parseInt(item.count) / totalVendors) * 10000) / 100
    })).sort((a, b) => b.count - a.count);
  }

  async getVendorGeographicDistribution(): Promise<VendorGeographicDistributionDto[]> {
    const totalVendors = await this.vendorsRepository.count();
    
    const result = await this.vendorsRepository
      .createQueryBuilder('vendor')
      .select('vendor.country', 'country')
      .addSelect('vendor.state', 'state')
      .addSelect('vendor.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('vendor.country IS NOT NULL AND vendor.country != ""')
      .groupBy('vendor.country, vendor.state, vendor.city')
      .getRawMany();

    return result.map(item => ({
      country: item.country || 'Unknown',
      state: item.state || undefined,
      city: item.city || undefined,
      count: parseInt(item.count),
      percentage: Math.round((parseInt(item.count) / totalVendors) * 10000) / 100
    })).sort((a, b) => b.count - a.count);
  }

  async getComprehensiveVendorKpis(): Promise<VendorKpiSummaryDto> {
    const [
      overview,
      vendorTypes,
      serviceCategories,
      topPerformers,
      registrationTrends
    ] = await Promise.all([
      this.getVendorOverviewKpi(),
      this.getVendorTypeBreakdown(),
      this.getVendorServiceCategoryBreakdown(),
      this.getTopPerformingVendors(10),
      this.getVendorRegistrationTrends(12)
    ]);

    return {
      overview,
      vendor_types: vendorTypes,
      service_categories: serviceCategories,
      top_performers: topPerformers,
      registration_trends: registrationTrends,
      generated_at: new Date()
    };
  }

  async getIndividualVendorKpi(vendorId: number): Promise<IndividualVendorKpiDto> {
    const vendor = await this.vendorsRepository.findOne({
      where: { pk_vendor_id: vendorId }
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    const vendorType = await this.vendorsTypeRepository.findOne({
      where: { id: vendor.fk_vendor_type_id }
    });

    const serviceCategory = await this.vendorsServiceCategoryRepository.findOne({
      where: { id: vendor.fk_vendor_service_category_id }
    });

    const products = await this.productsRepository.find({
      where: { fk_vendor_id: vendorId }
    });

    const productIds = products.map(p => p.pk_product_id);
    let salesData = {
      total_revenue: 0,
      order_count: 0,
      average_order_value: 0,
      last_order_date: null as Date | null
    };

    if (productIds.length > 0) {
      const orderItems = await this.orderItemsRepository.find({
        where: { fk_product_id: In(productIds) }
      });

      const totalRevenue = orderItems.reduce((sum, item) => sum + item.line_total, 0);
      const uniqueOrders = [...new Set(orderItems.map(item => item.fk_order_id))];
      const orderCount = uniqueOrders.length;

      const lastOrderItem = await this.orderItemsRepository
        .createQueryBuilder('item')
        .where('item.fk_product_id IN (:...productIds)', { productIds })
        .orderBy('item.created_at', 'DESC')
        .getOne();

      salesData = {
        total_revenue: Math.round(totalRevenue * 100) / 100,
        order_count: orderCount,
        average_order_value: orderCount > 0 ? Math.round((totalRevenue / orderCount) * 100) / 100 : 0,
        last_order_date: lastOrderItem?.created_at || null
      };
    }

    // Calculate days active
    const daysActive = Math.floor((new Date().getTime() - vendor.created_at.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate performance score
    const revenueScore = salesData.total_revenue * 0.4;
    const orderScore = salesData.order_count * 0.3;
    const productScore = products.length * 0.3;
    const performanceScore = Math.round((revenueScore + orderScore + productScore) * 100) / 100;

    // Get rank by revenue
    const allSalesKpis = await this.getVendorSalesKpis();
    const rankByRevenue = allSalesKpis.findIndex(kpi => kpi.vendor_id === vendorId) + 1;

    // Calculate monthly growth rate (simplified - could be more sophisticated)
    const monthlyGrowthRate = daysActive > 30 ? (salesData.total_revenue / (daysActive / 30)) : 0;

    return {
      vendor_id: vendor.pk_vendor_id,
      vendor_name: vendor.name,
      vendor_status: vendor.status,
      vendor_type: vendorType?.name || 'Unknown',
      service_category: serviceCategory?.name || 'Unknown',
      total_products: products.length,
      total_revenue: salesData.total_revenue,
      order_count: salesData.order_count,
      average_order_value: salesData.average_order_value,
      last_order_date: salesData.last_order_date,
      registration_date: vendor.created_at,
      days_active: daysActive,
      performance_score: performanceScore,
      rank_by_revenue: rankByRevenue,
      monthly_growth_rate: Math.round(monthlyGrowthRate * 100) / 100
    };
  }

  async compareVendors(vendorAId: number, vendorBId: number): Promise<VendorComparisonKpiDto> {
    const [vendorA, vendorB] = await Promise.all([
      this.getIndividualVendorKpi(vendorAId),
      this.getIndividualVendorKpi(vendorBId)
    ]);

    const revenueDifference = vendorA.total_revenue - vendorB.total_revenue;
    const revenueDifferencePercentage = vendorB.total_revenue > 0 ? 
      Math.round((revenueDifference / vendorB.total_revenue) * 10000) / 100 : 0;

    return {
      vendor_a: vendorA,
      vendor_b: vendorB,
      comparison: {
        revenue_difference: Math.round(revenueDifference * 100) / 100,
        revenue_difference_percentage: revenueDifferencePercentage,
        product_count_difference: vendorA.total_products - vendorB.total_products,
        order_count_difference: vendorA.order_count - vendorB.order_count,
        performance_score_difference: Math.round((vendorA.performance_score - vendorB.performance_score) * 100) / 100
      }
    };
  }

  async getVendorProductsAndCategories(
    vendorId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<VendorProductsAndCategoriesPaginatedDto> {
    // First check if vendor exists
    const vendor = await this.vendorsRepository.findOne({
      where: { pk_vendor_id: vendorId }
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Get all products for this vendor with their categories
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.product_category', 'category')
      .where('product.fk_vendor_id = :vendorId', { vendorId })
      .getMany();

    const totalProducts = products.length;

    // Group products by category and count them
    const categoryMap = new Map<number, { name: string; count: number }>();

    products.forEach(product => {
      if (product.product_category) {
        const categoryId = product.product_category.pk_product_category_id;
        const categoryName = product.product_category.category_name;
        
        if (categoryMap.has(categoryId)) {
          categoryMap.get(categoryId)!.count++;
        } else {
          categoryMap.set(categoryId, { name: categoryName, count: 1 });
        }
      }
    });

    // Convert map to array of VendorProductCategoryDto
    const allCategories: VendorProductCategoryDto[] = Array.from(categoryMap.entries()).map(
      ([categoryId, categoryData]) => ({
        category_id: categoryId,
        category_name: categoryData.name,
        product_count: categoryData.count
      })
    );

    // Sort by product count descending
    allCategories.sort((a, b) => b.product_count - a.product_count);

    // Implement pagination
    const totalItems = allCategories.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const offset = (currentPage - 1) * limit;
    
    const paginatedCategories = allCategories.slice(offset, offset + limit);

    return {
      vendor_id: vendor.pk_vendor_id,
      vendor_name: vendor.name,
      total_products: totalProducts,
      product_categories: paginatedCategories,
      meta: {
        itemCount: paginatedCategories.length,
        totalItems: totalItems,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: currentPage
      }
    };
  }
}
