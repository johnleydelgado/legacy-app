// @/services/orders-items/types/index.tsx

export interface OrderData {
  id: number;
  order_number: string;
  total_amount: number;
}

export interface ProductData {
  id: number;
  style: string;
  product_name: string;
  product_price: number;
  product_sku: string;
}

export interface ProductCategoryData {
  id: number;
  name: string;
}

export interface AddressData {
  id: number;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: string;
}

export interface PackagingData {
  id: number;
  packaging: string;
}

export interface TrimData {
  id: number;
  trim: string;
}

export interface YarnData {
  id: number;
  yarn_color: string;
  yarn_type: string;
}

export interface OrderItem {
  pk_order_item_id: number;
  orders_data: OrderData;
  products_data: ProductData;
  products_category_data: ProductCategoryData;
  address_data: AddressData;
  packaging_data: PackagingData;
  trim_data: TrimData;
  yarn_data: YarnData;
  item_number: string;
  item_name: string;
  item_description: string | null;
  quantity: number;
  unit_price: number | string;
  tax_rate: number | string;
  line_total: number | string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface OrderItemsResponse {
  items: OrderItem[];
  meta: PaginationMeta;
}

export interface OrderTotals {
  totalQuantity: number;
  totalUnitPrice: number;
  totalTaxRate: number;
  totalLineTotal: number;
}

// DTOs for creating and updating order items
export interface CreateOrderItemDTO {
  orderID: number;
  productID: number;
  packagingID: number;
  trimID: number;
  yarnID: number;
  itemName: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface UpdateOrderItemDTO {
  productID?: number;
  addressID?: number;
  packagingID?: number;
  trimID?: number;
  yarnID?: number;
  itemName?: string;
  itemDescription?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
}
