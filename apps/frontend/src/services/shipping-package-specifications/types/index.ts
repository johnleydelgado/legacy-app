// services/shipping-package-specifications/types/index.ts

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

export interface ShippingPackageSpecification {
  pk_shipping_package_spec_id: number;
  fk_shipping_order_id: number;
  name: string;
  company_name?: string;
  phone_number?: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  measurement_unit: string;
  fk_dimension_preset_id?: number;
  fk_weight_preset_id?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  // Shipping rate fields
  carrier?: string;
  service?: string;
  carrier_description?: string;
  shipping_rate_id?: string;
  easypost_shipment_id?: string;
  easypost_shipment_rate_id?: string;
  tracking_code?: string;
  label_url?: string;
  shipment_status?: string;
  estimated_delivery_days?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingPackageSpecificationsResponse {
  items: ShippingPackageSpecification[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ShippingPackageSpecificationsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  shipping_order_id?: number;
}

export interface CreateShippingPackageSpecificationsRequest {
  fkShippingOrderId: number;
  name: string;
  companyName?: string;
  phoneNumber?: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  measurementUnit: string;
  fkDimensionPresetId?: number;
  fkWeightPresetId?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  // Shipping rate fields
  carrier?: string;
  service?: string;
  carrierDescription?: string;
  shippingRateId?: string;
  easypostShipmentId?: string;
  easypostShipmentRateId?: string;
  trackingCode?: string;
  labelUrl?: string;
  shipmentStatus?: string;
  estimatedDeliveryDays?: string;
}

export interface UpdateShippingPackageSpecificationsRequest {
  name?: string;
  companyName?: string;
  phoneNumber?: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  measurementUnit?: string;
  fkDimensionPresetId?: number;
  fkWeightPresetId?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  // Shipping rate fields
  carrier?: string;
  service?: string;
  carrierDescription?: string;
  shippingRateId?: string;
  easypostShipmentId?: string;
  easypostShipmentRateId?: string;
  trackingCode?: string;
  labelUrl?: string;
  shipmentStatus?: string;
  estimatedDeliveryDays?: string;
}

export interface DeleteShippingPackageSpecificationResponse {
  raw: any[];
  affected: number;
}

export interface ShippingPackageSpecificationStats {
  shipping_order_id: number;
  total_packages: number;
  total_weight: number;
  total_volume: number;
}
