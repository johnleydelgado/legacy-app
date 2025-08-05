// services/shipping-orders/types/index.ts
export interface ContactsTypes {
  pk_contact_id: number;
  first_name: string;
  last_name: string;
  position_title?: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  contact_type: string;
}

export interface AddressesTypes {
  pk_address_id: number;
  fk_id: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: string;
  table: string;
}

export interface Customer {
  pk_customer_id: number;
  name: string;
  owner_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  website_url: string;
  billing_address: string;
  shipping_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  industry: string;
  customer_type: string;
  status: string;
  source: string;
  converted_at: string;
  notes: string;
  vat_number: string;
  contact_primary: ContactsTypes;
  contacts: ContactsTypes[];
  addresses: AddressesTypes[];
  tax_id: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerList {
  id: number;
  name: string;
  owner_name: string;
}

export interface Status {
  id: number;
  process: string;
  status: string;
  color: string;
}

export interface SerialEncoder {
  id: number;
  serial_quote_id: number;
  serial_order_id: number;
  serial_invoice_ids: number[];
}

export interface ShippingOrderTypes {
  pk_shipping_order_id: number;
  customer: CustomerList;
  status: Status;
  fk_order_id?: number;
  fk_serial_encoder_id?: number;
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

export interface ShippingOrderDetails {
  pk_shipping_order_id: number;
  customer: Customer;
  status: Status;
  fk_order_id?: number;
  serial_encoder: SerialEncoder;
  fk_serial_encoder_id?: number;
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
  tags: string | Record<string, string>;
  user_owner: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingOrdersResponse {
  items: ShippingOrderTypes[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ShippingOrdersQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface CreateShippingOrderRequest {
  customerID: number;
  statusID: number;
  orderID?: number; // NEW - link to order when created from order
  // serialEncoderID removed - backend auto-generates
  // shippingOrderNumber removed - backend auto-generates from serial encoder
  orderDate: string;
  expectedShipDate?: string;
  subtotal: number;
  taxTotal: number;
  currency: string;
  insuranceValue?: number;
  notes?: string;
  terms?: string;
  tags?: string | Record<string, string>;
  userOwner: string;
}

export interface UpdateShippingOrderRequest {
  customerID?: number;
  statusID?: number;
  orderID?: number; // NEW - can update order link
  serialEncoderID?: number; // KEEP - for manual updates if needed
  shippingOrderNumber?: string; // KEEP - for manual updates if needed
  orderDate?: string;
  expectedShipDate?: string;
  subtotal?: number;
  taxTotal?: number;
  currency?: string;
  insuranceValue?: number;
  notes?: string;
  terms?: string;
  tags?: string | Record<string, string>;
  userOwner?: string;
}

export interface DeleteShippingOrderResponse {
  raw: any[];
  affected: number;
}

// New search response interface
export interface ShippingOrdersSearchResponse extends ShippingOrdersResponse {
  searchTerm: string;
  originalSearchTerm: string;
  searchFields: string[];
  matchType: string;
}

// New search specific params
export interface ShippingOrdersSearchParams {
  q: string; // search query
  page?: number;
  limit?: number;
}

export interface DashboardSummaryValue {
  label: string;
  value: number;
  description: string;
}

export interface DashboardPendingShipment {
  label: string;
  count: number;
  description: string;
}

export interface DashboardSummary {
  totalShipments: DashboardPendingShipment;
  pendingShipments: DashboardPendingShipment;
}

export interface DashboardProcessSummary {
  label: string;
  count: number;
  description: string;
}

export interface DashboardDetailedCount {
  status_id: number;
  process: string;
  status: string;
  color: string | null;
  count: number;
}

export interface DashboardAvailableStatus {
  id: number;
  process: string;
  status: string;
  color: string;
}

export interface ShippingOrdersDashboardSummaryResponse {
  summary: DashboardSummary;
  totalShippingOrders: {
    meta: {
      totalItems: number;
    };
  };
  processSummary: DashboardProcessSummary[];
  detailedCounts: DashboardDetailedCount[];
  availableStatuses: DashboardAvailableStatus[];
  lastUpdated: string;
}
