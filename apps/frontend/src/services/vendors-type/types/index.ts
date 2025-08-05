// services/vendor-type/types/index.ts

export interface VendorType {
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
  
export interface VendorTypesResponse {
    items: VendorType[];
    meta: PaginationMeta;
}
  
export interface VendorTypeQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'ASC' | 'DESC';
    created_after?: string;
    created_before?: string;
}
  
export type PaginationParams = Pick<VendorTypeQueryParams, 'page' | 'limit'>;
