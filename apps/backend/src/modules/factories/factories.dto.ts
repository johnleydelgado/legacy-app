import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { FactoryStatus } from "./factories.entity";

export class CreateFactoriesDto {
    @IsNumber()
    @IsNotEmpty()
    fkFactoriesTypeId: number;

    @IsNumber()
    @IsNotEmpty()
    fkFactoriesServiceCategoryId: number;

    @IsNumber()
    @IsNotEmpty()
    fkLocationId: number;

    @IsString()
    @IsNotEmpty()
    status: FactoryStatus;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    websiteURL?: string;

    @IsString()
    @IsOptional()
    industry?: string;

    @IsString()
    @IsOptional()
    tags?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsNotEmpty()
    userOwner: string;
}

export class UpdateFactoriesDto {
    @IsNumber()
    @IsOptional()
    fkFactoriesTypeId?: number;
  
    @IsNumber()
    @IsOptional()
    fkFactoriesServiceCategoryId?: number;
  
    @IsNumber()
    @IsOptional()
    fkLocationId?: number;
  
    @IsString()
    @IsOptional()
    status?: FactoryStatus;
  
    @IsString()
    @IsOptional()
    name?: string;
  
    @IsString()
    @IsOptional()
    email?: string;
  
    @IsString()
    @IsOptional()
    websiteURL?: string;
  
    @IsString()
    @IsOptional()
    industry?: string;
  
    @IsString()
    @IsOptional()
    tags?: string;
  
    @IsString()
    @IsOptional()
    notes?: string;
  }

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
