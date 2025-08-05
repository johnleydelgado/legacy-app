import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Between, In } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { isValidJSON } from 'src/utils/string_tools';
import { FactoriesEntity, FactoryStatus } from './factories.entity';
import { CreateFactoriesDto, UpdateFactoriesDto } from './factories.dto';

// KPI DTOs
export interface FactoryOverviewKpiDto {
  total_factories: number;
  active_factories: number;
  inactive_factories: number;
  recent_registrations: number;
  growth_rate: number;
}

export interface FactoryTypeBreakdownDto {
  factory_type_id: number;
  factory_type_name: string;
  count: number;
  percentage: number;
}

export interface FactoryServiceCategoryBreakdownDto {
  service_category_id: number;
  service_category_name: string;
  count: number;
  percentage: number;
}

export interface FactoryLocationBreakdownDto {
  location_type_id: number;
  location_type_name: string;
  count: number;
  percentage: number;
}

export interface FactoryIndustryBreakdownDto {
  industry: string;
  count: number;
  percentage: number;
}

export interface FactoryRegistrationTrendDto {
  period: string;
  factory_count: number;
  active_factories: number;
  inactive_factories: number;
}

export interface FactoryKpiSummaryDto {
  overview: FactoryOverviewKpiDto;
  factory_types: FactoryTypeBreakdownDto[];
  service_categories: FactoryServiceCategoryBreakdownDto[];
  location_types: FactoryLocationBreakdownDto[];
  industries: FactoryIndustryBreakdownDto[];
  registration_trends: FactoryRegistrationTrendDto[];
  generated_at: Date;
}

@Injectable()
export class FactoriesService {
  constructor(
    @Inject('FACTORIES_REPOSITORY')
    private factoriesRepository: Repository<FactoriesEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.factoriesRepository, options);
  }

  async findOne(pk_factories_id: number): Promise<FactoriesEntity | null> {
    return this.factoriesRepository.findOne({ where: { pk_factories_id } });
  }

  async create(createFactoriesDto: CreateFactoriesDto): Promise<FactoriesEntity> {
    const newFactory = new FactoriesEntity();

    newFactory.fk_factories_type_id = createFactoriesDto.fkFactoriesTypeId;
    newFactory.fk_factories_service_id = createFactoriesDto.fkFactoriesServiceCategoryId;
    newFactory.fk_location_id = createFactoriesDto.fkLocationId;
    newFactory.status = createFactoriesDto.status;
    newFactory.name = createFactoriesDto.name;
    newFactory.email = createFactoriesDto.email || '---';
    newFactory.website_url = createFactoriesDto.websiteURL || '---';
    newFactory.industry = createFactoriesDto.industry || '---';
    newFactory.tags = isValidJSON(createFactoriesDto.tags) ? createFactoriesDto.tags : '[]';
    newFactory.notes = createFactoriesDto.notes || '---';
    newFactory.user_owner = createFactoriesDto.userOwner || 'system';
    newFactory.created_at = new Date();
    newFactory.updated_at = new Date();

    return await this.factoriesRepository.save(newFactory);
  }

  async update(
    pk_factories_id: number,
    updateFactoriesDto: UpdateFactoriesDto,
  ): Promise<FactoriesEntity> {
    const toUpdate = await this.factoriesRepository.findOne({
      where: { pk_factories_id },
    });

    const updated = Object.assign(
      {
        pk_factories_id: toUpdate?.pk_factories_id,
        fk_factories_type_id: toUpdate?.fk_factories_type_id,
        fk_factories_service_id: toUpdate?.fk_factories_service_id,
        fk_location_id: toUpdate?.fk_location_id,
        status: toUpdate?.status,
        name: toUpdate?.name,
        email: toUpdate?.email,
        website_url: toUpdate?.website_url,
        industry: toUpdate?.industry,
        tags: toUpdate?.tags,
        notes: toUpdate?.notes,
        user_owner: toUpdate?.user_owner,
        created_at: toUpdate?.created_at,
        updated_at: toUpdate?.updated_at,
      },
      {
        fk_factories_type_id: updateFactoriesDto.fkFactoriesTypeId,
        fk_factories_service_id: updateFactoriesDto.fkFactoriesServiceCategoryId,
        fk_location_id: updateFactoriesDto.fkLocationId,
        status: updateFactoriesDto.status,
        name: updateFactoriesDto.name,
        email: updateFactoriesDto.email,
        website_url: updateFactoriesDto.websiteURL,
        industry: updateFactoriesDto.industry,
        tags: isValidJSON(updateFactoriesDto.tags) ? updateFactoriesDto.tags : '[]',
        notes: updateFactoriesDto.notes,
        updated_at: new Date(),
      },
    );

    return await this.factoriesRepository.save(updated);
  }

  async remove(pk_factories_id: number): Promise<void> {
    await this.factoriesRepository.delete(pk_factories_id);
  }

  async searchFactories(
    searchTerm: string,
    options: IPaginationOptions,
    searchFields: string[] = [
      'factories_id', 'contact_name', 'contact_email', 'contact_position', 
      'factories_type', 'factories_service', 'location_type', 'factories_name', 
      'factories_status', 'factories_email', 'factories_website', 'factories_industry'
    ],
    matchType: 'partial' | 'exact' | 'phrase' = 'partial',
  ): Promise<Pagination<FactoriesEntity>> {
    const queryBuilder = this.factoriesRepository.createQueryBuilder('factory')
      .leftJoin('Contacts', 'contact', 'contact.fk_id = factory.pk_factories_id AND contact.table = :contactTable', { contactTable: 'factories' })
      .leftJoin('VendorsType', 'factoriesType', 'factoriesType.id = factory.fk_factories_type_id')
      .leftJoin('VendorServiceCategory', 'serviceCategory', 'serviceCategory.id = factory.fk_factories_service_id')
      .leftJoin('LocationTypes', 'locationType', 'locationType.pk_location_type_id = factory.fk_location_id')
      .select([
        'factory.pk_factories_id',
        'factory.fk_factories_type_id',
        'factory.fk_factories_service_id',
        'factory.fk_location_id',
        'factory.status',
        'factory.name',
        'factory.email',
        'factory.website_url',
        'factory.industry',
        'factory.tags',
        'factory.notes',
        'factory.user_owner',
        'factory.created_at',
        'factory.updated_at'
      ]);
  
    if (searchTerm) {
      const whereConditions: string[] = [];
      const params: any = {};
      
      // Handle different search strategies based on search term
      const isQuotedSearch = (searchTerm.startsWith('"') && searchTerm.endsWith('"')) || 
                            (searchTerm.startsWith("'") && searchTerm.endsWith("'"));
      const cleanSearchTerm = isQuotedSearch ? searchTerm.slice(1, -1) : searchTerm;
      
      // Split search terms by spaces for individual word search
      const searchWords = cleanSearchTerm.trim().split(/\s+/).filter(word => word.length > 0);
      
      // Determine search strategy
      const useWordSearch = !isQuotedSearch && searchWords.length > 1;
      const usePhraseSearch = isQuotedSearch || searchWords.length === 1 || matchType === 'phrase';
      
      let conditionIndex = 0;

      // Helper function to add search conditions for a field
      const addFieldConditions = (fieldExpression: string, fieldName: string) => {
        const fieldConditions: string[] = [];
        
        if (usePhraseSearch) {
          // Search for the full phrase
          const phraseParam = `searchTerm_${conditionIndex++}`;
          const phraseValue = matchType === 'exact' ? cleanSearchTerm : `%${cleanSearchTerm}%`;
          fieldConditions.push(`${fieldExpression} ${matchType === 'exact' ? '=' : 'LIKE'} :${phraseParam}`);
          params[phraseParam] = phraseValue;
        }
        
        if (useWordSearch) {
          // Search for individual words (ALL words must be found in the field)
          const wordConditions: string[] = [];
          searchWords.forEach((word, wordIndex) => {
            const wordParam = `word_${fieldName}_${conditionIndex}_${wordIndex}`;
            wordConditions.push(`${fieldExpression} LIKE :${wordParam}`);
            params[wordParam] = `%${word}%`;
          });
          if (wordConditions.length > 0) {
            fieldConditions.push(`(${wordConditions.join(' AND ')})`);
          }
        }
        
        return fieldConditions;
      };

      // Search by factories ID (only for numeric searches)
      if (searchFields.includes('factories_id')) {
        if (searchWords.length === 1 && !isNaN(Number(searchWords[0]))) {
          const numericParam = `searchTermNumeric_${conditionIndex++}`;
          whereConditions.push(`factory.pk_factories_id = :${numericParam}`);
          params[numericParam] = Number(searchWords[0]);
        }
      }

      // Search by factories name
      if (searchFields.includes('factories_name')) {
        whereConditions.push(...addFieldConditions('factory.name', 'factory_name'));
      }

      // Search by factories email
      if (searchFields.includes('factories_email')) {
        whereConditions.push(...addFieldConditions('factory.email', 'factory_email'));
      }

      // Search by factories website URL
      if (searchFields.includes('factories_website')) {
        whereConditions.push(...addFieldConditions('factory.website_url', 'factory_website'));
      }

      // Search by factories industry
      if (searchFields.includes('factories_industry')) {
        whereConditions.push(...addFieldConditions('factory.industry', 'factory_industry'));
      }

      // Search by factories status
      if (searchFields.includes('factories_status')) {
        whereConditions.push(...addFieldConditions('factory.status', 'factory_status'));
      }

      // Search by contact name (first_name + last_name combined and individual)
      if (searchFields.includes('contact_name')) {
        // Search in concatenated full name
        whereConditions.push(...addFieldConditions(
          `CONCAT(COALESCE(contact.first_name, ''), ' ', COALESCE(contact.last_name, ''))`, 
          'contact_full_name'
        ));
        
        // Search in individual name fields
        whereConditions.push(...addFieldConditions('contact.first_name', 'contact_first_name'));
        whereConditions.push(...addFieldConditions('contact.last_name', 'contact_last_name'));
      }

      // Search by contact email
      if (searchFields.includes('contact_email')) {
        whereConditions.push(...addFieldConditions('contact.email', 'contact_email'));
      }

      // Search by contact position title
      if (searchFields.includes('contact_position')) {
        whereConditions.push(...addFieldConditions('contact.position_title', 'contact_position'));
      }

      // Search by factories type
      if (searchFields.includes('factories_type')) {
        whereConditions.push(...addFieldConditions('factoriesType.name', 'factories_type'));
      }

      // Search by factories service category
      if (searchFields.includes('factories_service')) {
        whereConditions.push(...addFieldConditions('serviceCategory.name', 'factories_service'));
      }

      // Search by location type
      if (searchFields.includes('location_type')) {
        whereConditions.push(...addFieldConditions('locationType.name', 'location_type'));
      }

      if (whereConditions.length > 0) {
        queryBuilder.where(`(${whereConditions.join(' OR ')})`, params);
      }
    }
  
    queryBuilder.orderBy('factory.created_at', 'DESC');
  
    return paginate<FactoriesEntity>(queryBuilder, options);
  }

  async getFactoryOverviewKpi(): Promise<FactoryOverviewKpiDto> {
    const total = await this.factoriesRepository.count();
    const active = await this.factoriesRepository.count({
      where: { status: FactoryStatus.ACTIVE }
    });
    const inactive = await this.factoriesRepository.count({
      where: { status: FactoryStatus.INACTIVE }
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = await this.factoriesRepository.count({
      where: {
        created_at: MoreThanOrEqual(thirtyDaysAgo)
      }
    });

    // Previous 30-day period for growth calculation
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const previousPeriod = await this.factoriesRepository.count({
      where: {
        created_at: Between(sixtyDaysAgo, thirtyDaysAgo)
      }
    });

    const growthRate = previousPeriod > 0 ? 
      ((recent - previousPeriod) / previousPeriod) * 100 : 0;

    return {
      total_factories: total,
      active_factories: active,
      inactive_factories: inactive,
      recent_registrations: recent,
      growth_rate: Math.round(growthRate * 100) / 100
    };
  }

  async getFactoryTypeBreakdown(): Promise<FactoryTypeBreakdownDto[]> {
    const totalFactories = await this.factoriesRepository.count();
    
    const result = await this.factoriesRepository
      .createQueryBuilder('factory')
      .select('factory.fk_factories_type_id', 'factory_type_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('factory.fk_factories_type_id')
      .getRawMany();

    const breakdown: FactoryTypeBreakdownDto[] = [];
    
    for (const item of result) {
      // Note: You'll need to inject VendorsTypeService to get the name
      breakdown.push({
        factory_type_id: item.factory_type_id,
        factory_type_name: `Type ${item.factory_type_id}`, // Will be updated with actual name
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / totalFactories) * 10000) / 100
      });
    }

    return breakdown.sort((a, b) => b.count - a.count);
  }

  async getFactoryServiceCategoryBreakdown(): Promise<FactoryServiceCategoryBreakdownDto[]> {
    const totalFactories = await this.factoriesRepository.count();
    
    const result = await this.factoriesRepository
      .createQueryBuilder('factory')
      .select('factory.fk_factories_service_id', 'service_category_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('factory.fk_factories_service_id')
      .getRawMany();

    const breakdown: FactoryServiceCategoryBreakdownDto[] = [];
    
    for (const item of result) {
      breakdown.push({
        service_category_id: item.service_category_id,
        service_category_name: `Service ${item.service_category_id}`, // Will be updated with actual name
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / totalFactories) * 10000) / 100
      });
    }

    return breakdown.sort((a, b) => b.count - a.count);
  }

  async getFactoryLocationBreakdown(): Promise<FactoryLocationBreakdownDto[]> {
    const totalFactories = await this.factoriesRepository.count();
    
    const result = await this.factoriesRepository
      .createQueryBuilder('factory')
      .select('factory.fk_location_id', 'location_type_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('factory.fk_location_id')
      .getRawMany();

    const breakdown: FactoryLocationBreakdownDto[] = [];
    
    for (const item of result) {
      breakdown.push({
        location_type_id: item.location_type_id,
        location_type_name: `Location ${item.location_type_id}`, // Will be updated with actual name
        count: parseInt(item.count),
        percentage: Math.round((parseInt(item.count) / totalFactories) * 10000) / 100
      });
    }

    return breakdown.sort((a, b) => b.count - a.count);
  }

  async getFactoryIndustryBreakdown(): Promise<FactoryIndustryBreakdownDto[]> {
    const totalFactories = await this.factoriesRepository.count();
    
    const result = await this.factoriesRepository
      .createQueryBuilder('factory')
      .select('factory.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .where('factory.industry IS NOT NULL AND factory.industry != "" AND factory.industry != "---"')
      .groupBy('factory.industry')
      .getRawMany();

    return result.map(item => ({
      industry: item.industry || 'Unknown',
      count: parseInt(item.count),
      percentage: Math.round((parseInt(item.count) / totalFactories) * 10000) / 100
    })).sort((a, b) => b.count - a.count);
  }

  async getFactoryRegistrationTrends(months: number = 12): Promise<FactoryRegistrationTrendDto[]> {
    const trends: FactoryRegistrationTrendDto[] = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const totalCount = await this.factoriesRepository.count({
        where: {
          created_at: Between(startOfMonth, endOfMonth)
        }
      });

      const activeCount = await this.factoriesRepository.count({
        where: {
          created_at: Between(startOfMonth, endOfMonth),
          status: FactoryStatus.ACTIVE
        }
      });

      const inactiveCount = await this.factoriesRepository.count({
        where: {
          created_at: Between(startOfMonth, endOfMonth),
          status: FactoryStatus.INACTIVE
        }
      });

      trends.push({
        period,
        factory_count: totalCount,
        active_factories: activeCount,
        inactive_factories: inactiveCount
      });
    }

    return trends;
  }

  async getFactoryKpiSummary(): Promise<FactoryKpiSummaryDto> {
    const [
      overview,
      factoryTypes,
      serviceCategories,
      locationTypes,
      industries,
      registrationTrends
    ] = await Promise.all([
      this.getFactoryOverviewKpi(),
      this.getFactoryTypeBreakdown(),
      this.getFactoryServiceCategoryBreakdown(),
      this.getFactoryLocationBreakdown(),
      this.getFactoryIndustryBreakdown(),
      this.getFactoryRegistrationTrends(12)
    ]);

    return {
      overview,
      factory_types: factoryTypes,
      service_categories: serviceCategories,
      location_types: locationTypes,
      industries,
      registration_trends: registrationTrends,
      generated_at: new Date()
    };
  }
}
