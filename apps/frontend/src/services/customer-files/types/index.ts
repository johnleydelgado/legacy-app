// services/customer-files/types/index.ts
import { Customer } from "@/services/customers/types";

export interface CustomerFile {
  pk_customer_file_id: number;
  fk_customer_id: number;
  customer?: Customer;
  file_name: string;
  public_url: string;
  mime_type: string;
  uploaded_at: string;
  deleted_at: string | null;
  metadata: any;
}

export interface CustomerFilesResponse {
  items: CustomerFile[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CreateCustomerFileDto {
  customerID: number;
  fileName: string;
  publicUrl: string;
  mimeType: string;
  metadata?: any;
}

export interface UpdateCustomerFileDto {
  fileName?: string;
  publicUrl?: string;
  mimeType?: string;
  metadata?: any;
}

export interface CustomerFilesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customer_id?: number;
  mime_type?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface GetCustomerFilesParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: number;
  mimeType?: string;
  showArchived?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}
