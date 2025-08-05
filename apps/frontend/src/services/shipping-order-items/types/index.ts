// services/shipping-order-items/types/index.ts

export interface ShippingOrderData {
  pk_shipping_order_id: number;
  customer: {
    id: number;
    name: string;
    owner_name: string;
  };
  status: {
    id: number;
    process: string;
    status: string;
    color: string;
  };
  shipping_order_number: string;
  order_date: string;
  expected_ship_date: string;
  subtotal: number;
  tax_total: number;
  total_amount: number;
  currency: string;
  insurance_value: number;
  notes: string;
  terms: string;
  tags: string;
  user_owner: string;
  created_at: string;
  updated_at: string;
}

export interface ProductData {
  pk_product_id: number;
  fk_category_id: number;
  product_name: string;
  sku: string;
  product_price: number;
  inventory: number;
  style: string;
  status: string;
  image_url: string;
  image_urls: string[];
  yarn: string;
  trims: string;
  packaging: string;
  created_at: string;
  updated_at: string;
}

export interface TrimsData {
  pk_trim_id: number;
  trim_name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface PackagingData {
  pk_packaging_id: number;
  packaging_name: string;
  packaging_type: string;
  created_at: string;
  updated_at: string;
}

export interface YarnData {
  pk_yarn_id: number;
  yarn_name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingOrderItem {
  pk_shipping_order_item_id: number;
  shipping_order_data: ShippingOrderData;
  product_data: ProductData;
  trims_data: TrimsData;
  packaging_data: PackagingData;
  yarn_data: YarnData;
  item_number: string;
  item_name: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

export interface ShippingOrderItemsResponse {
  items: ShippingOrderItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ShippingOrderItemsQueryParams {
  page?: number;
  limit?: number;
  shipping_order_id?: number;
  search?: string;
}

export interface CreateShippingOrderItemRequest {
  fkShippingOrderID: number;
  fkProductID?: number;
  fkPackagingID?: number;
  fkTrimID?: number;
  fkYarnID?: number;
  itemNumber: string;
  itemName: string;
  itemDescription?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface UpdateShippingOrderItemRequest {
  fkShippingOrderID?: number;
  fkProductID?: number;
  fkPackagingID?: number;
  fkTrimID?: number;
  fkYarnID?: number;
  itemNumber?: string;
  itemName?: string;
  itemDescription?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  fkShippingPackageID?: number;
}

export interface DeleteShippingOrderItemResponse {
  raw: any[];
  affected: number;
}

export interface ShippingOrderTotals {
  total_items: number;
  total_quantity: number;
}
