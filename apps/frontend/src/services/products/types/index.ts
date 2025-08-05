import { ProductCategory } from "@/services/quote-items/types";

interface Vendor {
  pk_vendor_id: number;
  name: string;
  email: string | null;
  phone_number: string | null;
  website_url: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  industry: string | null;
  vat_number: string | null;
  tax_id: string | null;
  tags: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// services/products/types.ts
export interface Product {
  pk_product_id: number;
  fk_organization_id: number;
  fk_category_id: number;
  product_category: ProductCategory | null;
  image_url: string | null;
  image_urls: string[] | null;
  product_name: string;
  style: string | null;
  status: "Active" | "Inactive";
  product_price: number | null;
  inventory: number | null;
  sku: string | null;
  yarn: string | null;
  trims: string | null;
  packaging: string | null;
  created_at: string;
  updated_at: string | null;
  vendor: Vendor | null;
  fk_vendor_id: number | null;
}

export interface ProductsResponse {
  items: Product[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ProductsCategoryResponse {
  items: ProductCategory[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface GetProductsCategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  status?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface CreateProductDto {
  organizationID: number;
  productCategoryID: number;
  inventory: number;
  supplierPhone?: string;
  supplierName?: string;
  supplierEmail?: string;
  supplierContactName?: string;
  supplierAddress?: string;
  style?: string;
  productName: string;
  status: "ACTIVE" | "DISCONTINUED";
  productPrice?: number;
  imageURL?: string;
  imageURLs?: string[];
  sku: string;
  yarn?: string;
  trims?: string;
  packaging?: string;
  fk_vendor_id?: number;
}

export interface UpdateProductDto {
  productCategoryID?: number;
  inventory?: number;
  supplierPhone?: string;
  supplierName?: string;
  supplierEmail?: string;
  supplierContactName?: string;
  supplierAddress?: string;
  style?: string;
  productName?: string;
  status?: "Active" | "Inactive";
  productPrice?: number;
  imageURL?: string;
  imageURLs?: string[];
  sku?: string;
  yarn?: string;
  trims?: string;
  packaging?: string;
  fk_vendor_id?: number;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  status?: "Active" | "Inactive";
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}
