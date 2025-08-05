// services/vendors/types/index.ts

export interface VendorType {
  id: number;
  name: string;
}
  
export interface VendorServiceCategory {
  id: number;
  name: string;
}
  
export interface VendorContact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  mobile_number: string | null;
  position_title: string | null;
  contact_type: "PRIMARY" | "SECONDARY";
}
  
export interface LocationType {
  id: number;
  name: string;
  color: string;
}

export interface Vendor {
  pk_vendor_id: number;
  name: string;
  website_url: string | null;
  contact: VendorContact;
  vendor_type: VendorType;
  vendor_service_category: VendorServiceCategory;
  status: "ACTIVE" | "BLOCKED" | null;
  tags: string[];
  notes: string | null;
  location: LocationType;
  user_owner: string | null;
  created_at: string;
  updated_at: string | null;
}
  
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
  
export interface VendorsResponse {
  items: Vendor[];
  meta: PaginationMeta;
}
  
export interface VendorsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  vendor_type_id?: number;
  vendor_service_category_id?: number;
  status?: 'ACTIVE' | 'BLOCKED';
  created_after?: string;
  created_before?: string;
}
  
export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

export interface CreateVendorDto {
  fkVendorTypeId: number;
  fkVendorServiceCategoryId: number;
  status: VendorStatus;
  name: string;
  websiteURL?: string;
  location?: number;
  tags?: any;
  notes?: string;
  userOwner?: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}
  
export interface VendorKpisOverview {
  total_vendors: number;
  active_vendors: number;
  blocked_vendors: number;
  recent_registrations: number;
  growth_rate: number;
}

export interface VendorIndividualKpis {
  vendor_id: number;
  vendor_name: string;
  vendor_status: string;
  vendor_type: string;
  service_category: string;
  total_products: number;
  total_revenue: number;
  order_count: number;
  average_order_value: number;
  last_order_date: string | null;
  registration_date: string;
  days_active: number;
  performance_score: number;
  rank_by_revenue: number;
  monthly_growth_rate: number;
}

export interface VendorSearchItem {
  pk_vendor_id: number;
  name: string;
  website_url: string | null;
  industry: string | null;
  contact: VendorContact;
  vendor_type: VendorType;
  vendor_service_category: VendorServiceCategory;
  status: "ACTIVE" | "BLOCKED" | null;
  created_at: string;
  updated_at: string | null;
}

export interface VendorSearchResponse {
  items: VendorSearchItem[];
  meta: PaginationMeta;
  searchTerm: string;
  searchFields: string[];
  matchType: string;
  total_found: number;
}

export interface VendorSearchParams {
  q: string; // Search query
  page?: number;
  limit?: number;
}

export type PaginationParams = Pick<VendorsQueryParams, 'page' | 'limit'>;

export interface VendorProductCategory {
  category_id: number;
  category_name: string;
  product_count: number;
}

export interface VendorProductCategoriesResponse {
  vendor_id: number;
  vendor_name: string;
  total_products: number;
  product_categories: VendorProductCategory[];
  meta: PaginationMeta;
}

export interface VendorProductCategoriesParams {
  page?: number;
  limit?: number;
}

