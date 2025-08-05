// services/location-types/types/index.ts

export interface LocationType {
  pk_location_type_id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationTypeDto {
  name: string;
  color: string;
}

export interface UpdateLocationTypeDto extends Partial<CreateLocationTypeDto> {}

export interface LocationTypesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface LocationTypesResponse {
  items: LocationType[];
  meta: PaginationMeta;
}

export interface BulkLocationTypeOperation {
  location_type_ids: number[];
  operation: "delete" | "update";
  data?: Partial<UpdateLocationTypeDto>;
}

export interface LocationTypeExportParams {
  format: "csv" | "xlsx" | "json";
  filters?: LocationTypesQueryParams;
  fields?: string[];
} 