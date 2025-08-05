// services/shipping-package-spec-items/types/index.ts

export interface ShippingPackageSpecItem {
  pk_sp_item_id: number;
  fk_shipping_package_spec_id: number;
  fk_shipping_order_item_id: number;
  qty: number;
  created_at: string;
  updated_at: string;
}

export interface ShippingPackageSpecItemsResponse {
  items: ShippingPackageSpecItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ShippingPackageSpecItemsQueryParams {
  page?: number;
  limit?: number;
  package_spec_id?: number;
  shipping_order_item_id?: number;
}

export interface CreateShippingPackageSpecItemRequest {
  fkShippingPackageSpecId: number;
  fkShippingOrderItemId: number;
  qty: number;
}

export interface UpdateShippingPackageSpecItemRequest {
  fkShippingPackageSpecId?: number;
  fkShippingOrderItemId?: number;
  qty?: number;
}

export interface PackageItemSummary {
  package_spec_id: number;
  total_items: number;
  total_quantity: number;
}

export interface ItemPackageSummary {
  shipping_order_item_id: number;
  total_packages: number;
  total_quantity: number;
}
