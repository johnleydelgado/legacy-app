// Product interface
export interface Product {
  id: number;
  name: string;
  sku: string;
}

// Production Order Item interface for list view (from GET /production-order-items)
export interface ProductionOrderItem {
  pk_production_order_item_id: number;
  fk_production_order_id: number;
  product: Product;
  fk_category_id: number;
  item_name: string;
  item_description: string | null;
  item_number: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate: number;
  knitcolors_production_order: number[] | null;
  body_production_order_color: number[] | null;
  packaging_production_order: number[] | null;
  created_at: string;
  updated_at: string;
}

// Production Order Item interface for detail view (from GET /production-order-items/:id)
export interface ProductionOrderItemDetails extends ProductionOrderItem {}

// API Response interfaces
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductionOrderItemsResponse {
  items: ProductionOrderItem[];
  meta: PaginationMeta;
}

export interface ProductionOrderItemResponse
  extends ProductionOrderItemDetails {}

// Production Order Item interface for search results (from GET /production-order-items/search)
export interface ProductionOrderItemSearchResult {
  pk_production_order_item_id: number;
  fk_production_order_id: number;
  item_name: string;
  item_description: string | null;
  item_number: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

// Search response interface
export interface SearchProductionOrderItemsResponse {
  data: ProductionOrderItemSearchResult[];
  meta: PaginationMeta;
  message: string;
}

// DTO interfaces for Create/Update operations (Must match backend DTO exactly)
export interface CreateProductionOrderItemDto {
  fkProductionOrderID: number;
  fkProductID: number;
  fkCategoryID: number;
  itemName: string;
  itemDescription?: string;
  itemNumber?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface UpdateProductionOrderItemDto {
  fkProductionOrderID?: number;
  fkProductID?: number;
  fkCategoryID?: number;
  itemName?: string;
  itemDescription?: string;
  itemNumber?: string;
  size?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
}

// Query parameters
export interface ProductionOrderItemsQueryParams {
  page?: number;
  itemsPerPage?: number;
}

export interface SearchProductionOrderItemsParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface ProductionOrderItemTotals {
  totalQuantity: number;
  totalAmount: number;
  itemCount: number;
}
