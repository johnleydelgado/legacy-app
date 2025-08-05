// services/vendor-service-category/types/index.ts

export interface VendorServiceCategory {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }
  
export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}
  
export interface VendorServiceCategoriesResponse {
    items: VendorServiceCategory[];
    meta: PaginationMeta;
}
  
export interface VendorServiceCategoryQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'ASC' | 'DESC';
    created_after?: string;
    created_before?: string;
}
  
export type PaginationParams = Pick<VendorServiceCategoryQueryParams, 'page' | 'limit'>;
