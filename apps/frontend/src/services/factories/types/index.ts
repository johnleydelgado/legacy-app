// services/factories/types/index.ts

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export enum FactoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

// Factory Type Interface
export interface FactoryType {
  id: number;
  name: string;
}

// Factory Service Category Interface
export interface FactoryServiceCategory {
  id: number;
  name: string;
}

// Location Type Interface
export interface LocationType {
  id: number;
  name: string;
  color: string;
}

// Contact Interface (simplified)
export interface FactoryContact {
  [key: string]: any;
}

// Main Factory Interface
export interface Factory {
  pk_factories_id: number;
  factories_type: FactoryType;
  factories_service_category: FactoryServiceCategory;
  location_types: LocationType;
  contact: FactoryContact;
  status: FactoryStatus;
  name: string;
  email: string;
  website_url: string;
  industry: string;
  tags: string[];
  notes: string;
  user_owner: string;
  created_at: string;
  updated_at: string;
}

// Factory Detail Interface (single factory response)
export interface FactoryDetail {
  pk_factories_id: number;
  contact: FactoryContact;
  factories_type: FactoryType;
  factories_service: FactoryServiceCategory;
  location_types: LocationType;
  status: FactoryStatus;
  name: string;
  email: string;
  website_url: string;
  industry: string;
  tags: string[];
  notes: string;
  user_owner: string;
  created_at: string;
  updated_at: string;
}

// Factory List Response
export interface FactoriesResponse {
  items: Factory[];
  meta: PaginationMeta;
}

// Factory Search Response
export interface FactoriesSearchResponse {
  items: Factory[];
  meta: PaginationMeta;
}

// Factory KPI Interfaces
export interface FactoryOverviewKpi {
  total_factories: number;
  active_factories: number;
  inactive_factories: number;
  recent_registrations: number;
  growth_rate: number;
}

export interface FactoryTypeBreakdown {
  factory_type_id: number;
  factory_type_name: string;
  count: number;
  percentage: number;
}

export interface FactoryServiceCategoryBreakdown {
  service_category_id: number;
  service_category_name: string;
  count: number;
  percentage: number;
}

export interface FactoryLocationBreakdown {
  location_type_id: number;
  location_type_name: string;
  count: number;
  percentage: number;
}

export interface FactoryIndustryBreakdown {
  industry: string;
  count: number;
  percentage: number;
}

export interface FactoryRegistrationTrend {
  period: string;
  factory_count: number;
  active_factories: number;
  inactive_factories: number;
}

export interface FactoryKpiSummary {
  overview: FactoryOverviewKpi;
  factory_types: FactoryTypeBreakdown[];
  service_categories: FactoryServiceCategoryBreakdown[];
  location_types: FactoryLocationBreakdown[];
  industries: FactoryIndustryBreakdown[];
  registration_trends: FactoryRegistrationTrend[];
  generated_at: string;
}

// Query Parameters
export interface FactoriesQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  status?: FactoryStatus;
  factory_type_id?: number;
  service_category_id?: number;
  location_type_id?: number;
  industry?: string;
  created_after?: string;
  created_before?: string;
  search?: string;
}

export interface FactoriesSearchParams {
  q: string;
  page?: number;
  limit?: number;
}

// DTOs for Create/Update
export interface CreateFactoryDto {
  fkFactoriesTypeId: number;
  fkFactoriesServiceCategoryId: number;
  fkLocationId: number;
  status: FactoryStatus;
  name: string;
  email?: string;
  websiteURL?: string;
  industry?: string;
  tags?: string[]; // Changed from string to string[]
  notes?: string;
  userOwner?: string;
}

export interface UpdateFactoryDto extends Partial<CreateFactoryDto> {}

// Type Utilities
export type PaginationParams = Pick<FactoriesQueryParams, 'page' | 'limit'>; 