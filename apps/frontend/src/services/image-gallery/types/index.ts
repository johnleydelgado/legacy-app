// Define the enums for image gallery
export enum FKItemType {
  QUOTES = "QUOTES",
  ORDERS = "ORDERS",
  INVOICES = "INVOICES",
  PURCHASE_ORDERS = "PURCHASE_ORDERS",
  PRODUCTION = "PRODUCTION",
  SHIPPING = "SHIPPING",
}

export enum Type {
  LOGO = "LOGO",
  ARTWORK = "ARTWORK",
  OTHER = "OTHER",
}

// Main image gallery interface matching the backend entity
export interface ImageGallery {
  id: number;
  fk_item_id: number;
  fk_item_type: string;
  url: string;
  filename: string;
  file_extension: string;
  type: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// Parameters for creating a new image gallery item
export interface CreateImageGalleryParams {
  fkItemID: number;
  fkItemType: FKItemType;
  imageFile: File | any;
  description: string;
  type: Type;
}

// Parameters for creating a new image gallery item from URL
export interface CreateImageGalleryFromUrlParams {
  url: string;
  fkItemID: number;
  fkItemType: FKItemType;
  description: string;
  type: Type;
}

// Parameters for updating an existing image gallery item
export interface UpdateImageGalleryParams {
  url?: string;
  filename?: string;
  file_extension?: string;
  type?: Type;
  imageFile?: File;
}

// Basic pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Extended query parameters for filtering
export interface ImageGalleryQueryParams extends PaginationParams {
  fk_item_id?: number;
  fk_item_type?: string;
  type?: string;
}

// Paginated response structure from the API
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// Response structure for delete operations
export interface DeleteResponse {
  affected: number;
  message: string;
}
