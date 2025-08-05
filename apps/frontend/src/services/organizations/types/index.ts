// services/organizations/types/index.ts

export interface Organization {
  pk_organization_id: number;
  name: string;
  description: string | null;
  industry: string | null;
  website_url: string | null;
  email: string | null;
  phone_number: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  logo_image_url: string | null;
  notes: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  industry?: string;
  website_url?: string;
  email?: string;
  phone_number?: string;
  billing_address?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  logo_image_url?: string;
  notes?: string;
  tags?: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {}

export interface OrganizationsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  industry?: string;
  country?: string;
  tags?: string;
  created_after?: string;
  created_before?: string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface OrganizationsResponse {
  items: Organization[];
  meta: PaginationMeta;
}

export interface OrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  newThisMonth: number;
  recentlyUpdated: number;
  byIndustry: Record<string, number>;
  byCountry: Record<string, number>;
}

export interface BulkOrganizationOperation {
  organization_ids: number[];
  operation: "delete" | "update_industry" | "add_tags" | "remove_tags";
  data?: {
    industry?: string;
    tags?: string;
  };
}

export interface OrganizationExportParams {
  format: "csv" | "xlsx" | "json";
  filters?: OrganizationsQueryParams;
  fields?: string[];
}

/**
 * Parameters for organization search endpoint
 */
export interface OrganizationSearchParams {
  /** Search query term */
  q: string;
  /** Page number for pagination */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Additional filters to apply to the search */
  filters?: Partial<Omit<OrganizationsQueryParams, 'page' | 'limit' | 'search'>>;
}

/**
 * Response type for organization search endpoint
 */
export interface OrganizationSearchResponse {
  /** Array of organization search results */
  items: Organization[];
  /** Pagination metadata */
  meta: PaginationMeta;
  /** Optional highlighting information for search terms */
  highlights?: {
    [organizationId: string]: {
      [field: string]: string[];
    }
  };
}

export type PaginationParams = Pick<OrganizationsQueryParams, 'page' | 'limit'>; 
