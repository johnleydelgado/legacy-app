import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsEmail, IsObject } from 'class-validator';
import { VendorStatus } from './vendors.entity';

export class CreateVendorDto {
  @IsNumber()
  @IsNotEmpty()
  fkVendorTypeId: number;

  @IsNumber()
  @IsNotEmpty()
  fkVendorServiceCategoryId: number;

  @IsString()
  @IsNotEmpty()
  status: VendorStatus;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  websiteURL?: string;

  @IsNumber()
  @IsNotEmpty()
  location?: number;

  @IsObject()
  @IsOptional()
  tags?: any;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  userOwner?: string;
}

export class UpdateVendorDto {
  @IsNumber()
  @IsOptional()
  fkVendorTypeId?: number;

  @IsNumber()
  @IsOptional()
  fkVendorServiceCategoryId?: number;

  @IsString()
  @IsOptional()
  status?: VendorStatus;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  websiteURL?: string;

  @IsNumber()
  @IsOptional()
  location?: number;

  @IsObject()
  @IsOptional()
  tags?: any;

  @IsString()
  @IsOptional()
  notes?: string;
}

// KPI DTOs
export interface VendorOverviewKpiDto {
  total_vendors: number;
  active_vendors: number;
  blocked_vendors: number;
  recent_registrations: number; // Last 30 days
  growth_rate: number; // Percentage growth vs previous period
}

export interface VendorTypeBreakdownDto {
  vendor_type_id: number;
  vendor_type_name: string;
  count: number;
  percentage: number;
}

export interface VendorServiceCategoryBreakdownDto {
  service_category_id: number;
  service_category_name: string;
  count: number;
  percentage: number;
}

export interface VendorProductKpiDto {
  vendor_id: number;
  vendor_name: string;
  total_products: number;
  total_inventory_value: number;
  average_product_price: number;
  product_categories: string[];
}

export interface VendorSalesKpiDto {
  vendor_id: number;
  vendor_name: string;
  total_revenue: number;
  order_count: number;
  total_units_sold: number;
  average_order_value: number;
  last_order_date: Date | null;
}

export interface VendorRegistrationTrendDto {
  period: string; // YYYY-MM or YYYY-MM-DD
  vendor_count: number;
  active_vendors: number;
  blocked_vendors: number;
}

export interface VendorPerformanceRankingDto {
  vendor_id: number;
  vendor_name: string;
  rank: number;
  score: number;
  total_revenue: number;
  product_count: number;
  order_count: number;
}

export interface VendorKpiSummaryDto {
  overview: VendorOverviewKpiDto;
  vendor_types: VendorTypeBreakdownDto[];
  service_categories: VendorServiceCategoryBreakdownDto[];
  top_performers: VendorPerformanceRankingDto[];
  registration_trends: VendorRegistrationTrendDto[];
  generated_at: Date;
}

export interface VendorIndustryBreakdownDto {
  industry: string;
  count: number;
  percentage: number;
}

export interface VendorGeographicDistributionDto {
  country: string;
  state?: string;
  city?: string;
  count: number;
  percentage: number;
}

// Individual vendor performance KPI
export interface IndividualVendorKpiDto {
  vendor_id: number;
  vendor_name: string;
  vendor_status: string;
  vendor_type: string;
  service_category: string;
  total_products: number;
  total_revenue: number;
  order_count: number;
  average_order_value: number;
  last_order_date: Date | null;
  registration_date: Date;
  days_active: number;
  performance_score: number;
  rank_by_revenue: number;
  monthly_growth_rate: number;
}

// Vendor comparison KPI
export interface VendorComparisonKpiDto {
  vendor_a: IndividualVendorKpiDto;
  vendor_b: IndividualVendorKpiDto;
  comparison: {
    revenue_difference: number;
    revenue_difference_percentage: number;
    product_count_difference: number;
    order_count_difference: number;
    performance_score_difference: number;
  };
}

// New DTOs for vendor products and categories
export class VendorProductCategoryDto {
  category_id: number;
  category_name: string;
  product_count: number;
}

export class VendorProductsAndCategoriesPaginatedDto {
  vendor_id: number;
  vendor_name: string;
  total_products: number;
  product_categories: VendorProductCategoryDto[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// Keep the original DTO for backward compatibility if needed
export class VendorProductsAndCategoriesDto {
  vendor_id: number;
  vendor_name: string;
  total_products: number;
  product_categories: VendorProductCategoryDto[];
}
