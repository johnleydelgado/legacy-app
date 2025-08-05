// Product Price Types
export interface ProductPrice {
  id: number;
  max_qty: number;
  price: number;
  fk_product_id: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface ProductPricesResponse {
  items: ProductPrice[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  totalItems?: number;
}

export interface CreateProductPriceDto {
  max_qty: number;
  price: number;
  fk_product_id: number;
}

export interface UpdateProductPriceDto {
  max_qty?: number;
  price?: number;
  fk_product_id?: number;
}

export interface ProductPricesQueryParams {
  page?: number;
  limit?: number;
  productId?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

// Extended Product type with prices
export interface ProductWithPrices {
  pk_product_id: number;
  fk_organization_id: number;
  fk_category_id: number;
  product_category: {
    pk_product_category_id: number;
    category_name: string;
    created_at: string | null;
    updated_at: string | null;
  } | null;
  product_prices: ProductPrice[];
  image_url: string | null;
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
}

export interface ProductsWithPricesResponse {
  items: ProductWithPrices[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  totalItems?: number;
}

// Re-export basic Product type for backward compatibility
export interface Product {
  pk_product_id: number;
  fk_organization_id: number;
  fk_category_id: number;
  product_category: {
    pk_product_category_id: number;
    category_name: string;
    created_at: string | null;
    updated_at: string | null;
  } | null;
  image_url: string | null;
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
}
