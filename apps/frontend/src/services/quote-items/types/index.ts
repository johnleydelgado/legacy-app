// services/logo-upload-dropzone/types.ts

export interface ProductCategory {
  pk_product_category_id: number;
  category_name: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProductData {
  pk_product_id: number;
  fk_organization_id: number;
  fk_category_id: number;
  product_category: ProductCategory;
  inventory: number | null;
  style: string;
  product_name: string;
  status: string;
  product_price: number | null;
  image_url: string | null;
  sku: string | null;
  yarn: string | null;
  trims: string | null;
  packaging: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AddressData {
  pk_address_id: number;
  fk_id: number;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: string;
  table: string;
  address_id?: number | null;
}

export interface TrimsData {
  pk_trim_id?: number;
  trim?: string;
  trim_id?: number | null;
}

export interface PackagingData {
  pk_packaging_id: number;
  packaging: string;
  instruction: string | null;
  packaging_id?: number | null;
}

export interface YarnData {
  pk_yarn_id?: number;
  yarn_id?: number | null;
  yarn_color: string;
  card_number: string;
  color_code: string;
  yarn_type: string;
}

export interface QuoteData {
  pk_quote_id: number;
  fk_customer_id: number;
  quote_number: string;
  quote_date: string;
  expiration_date: string;
  status: string;
  subtotal: number;
  tax_total: number;
  total_amount: number;
  currency: string;
  notes: string;
  terms: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  pk_quote_item_id: number;
  quote_data?: QuoteData;
  product_data: ProductData;
  trims_data: TrimsData;
  packaging_data: PackagingData;
  yarn_data: YarnData;
  artwork_url?: string;
  item_number: string;
  item_name: string;
  item_description: string;
  quantity: number;
  unit_price: number | string;
  tax_rate: number | string;
  line_total: number | string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItemsResponse {
  items: QuoteItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface QuoteItemsQueryParams {
  page?: number;
  limit?: number;
  quote_id?: number;
  search?: string;
}

export interface CreateQuoteItemRequest {
  fkQuoteID: number;
  fkProductID: number;
  fkTrimID: number;
  fkYarnID: number;
  fkPackagingID: number;
  itemName: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface UpdateQuoteItemRequest {
  fkProductID?: number;
  fkTrimID?: number;
  fkYarnID?: number;
  fkPackagingID?: number;
  itemName?: string;
  itemDescription?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
}

export interface DeleteQuoteItemResponse {
  raw: any[];
  affected: number;
}

export interface QuoteTotals {
  totalQuantity: number;
  totalUnitPrice: number;
  totalTaxRate: number;
  totalLineTotal: number;
}

