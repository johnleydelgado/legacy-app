export enum ProductionOrderShippingMethod {
  OCEAN = "OCEAN",
  AIR = "AIR",
  GROUND = "GROUND",
  EXPRESS = "EXPRESS",
}

export enum ProductionOrderStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

// Contact interface
export interface Contact {
  id: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  position: string;
}

// Customer interface
export interface Customer {
  id: number;
  name: string;
  contacts: Contact;
}

// Factory interface
export interface Factory {
  id: number;
  name: string;
  contacts: Contact;
}

// Production Order interface for list view (from GET /production-orders)
export interface ProductionOrder {
  pk_production_order_id: number;
  customer: Customer;
  factory: Factory;
  po_number: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  shipping_method: ProductionOrderShippingMethod;
  status: ProductionOrderStatus;
  total_quantity: number;
  total_amount: number;
  user_owner: string;
  created_at: string;
  updated_at: string;
}

// Production Order interface for detail view (from GET /production-orders/:id)
export interface ProductionOrderDetails {
  pk_production_order_id: number;
  customer: Customer;
  factory: Factory;
  po_number: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  shipping_method: ProductionOrderShippingMethod;
  status: ProductionOrderStatus;
  total_quantity: number;
  total_amount: number;
  notes: string | null;
  user_owner: string;
  created_at: string;
  updated_at: string;
}

// API Response interfaces
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductionOrdersResponse {
  items: ProductionOrder[];
  meta: PaginationMeta;
}

export interface ProductionOrderResponse extends ProductionOrderDetails {}

// Production Order interface for search results (from GET /production-orders/search)
export interface ProductionOrderSearchResult {
  pk_production_order_id: number;
  po_number: string;
  customer: {
    id: number;
    name: string;
  };
  factory: {
    id: number;
    name: string;
  };
  order_date: string;
  expected_delivery_date: string;
  shipping_method: ProductionOrderShippingMethod;
  status: ProductionOrderStatus;
  total_quantity: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// Search response interface
export interface SearchProductionOrdersResponse {
  data: ProductionOrderSearchResult[];
  meta: PaginationMeta;
  message: string;
}

// DTO interfaces for Create/Update operations (Updated to match backend DTOs)
export interface CreateProductionOrderDto {
  fk_customer_id: number;
  fk_factory_id: number;
  po_number: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  shipping_method?: ProductionOrderShippingMethod;
  status?: ProductionOrderStatus;
  total_quantity?: number;
  total_amount?: number;
  notes?: string;
  user_owner?: string;
}

export interface UpdateProductionOrderDto {
  fk_customer_id?: number;
  fk_factory_id?: number;
  po_number?: string;
  order_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  shipping_method?: ProductionOrderShippingMethod;
  status?: ProductionOrderStatus;
  total_quantity?: number;
  total_amount?: number;
  notes?: string;
  user_owner?: string;
}

// Query parameters
export interface ProductionOrdersQueryParams {
  page?: number;
  itemsPerPage?: number;
}

export interface SearchProductionOrdersParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface ProductionOrderTotals {
  totalQuantity: number;
  totalAmount: number;
}
