// services/customers/types.ts

import { Customer as CustomerQuotes } from '@/services/quotes/types'

export interface PrimaryContactsTypes {
  pk_contact_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  position_title: string;
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
  fk_organization_id: number;
  name: string;
  owner_name: string | null;
  email: string;
  phone_number: string;
  mobile_number: string | null;
  website_url: string | null;
  billing_address: string;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  industry: string | null;
  customer_type: "LEAD" | "CUSTOMER" | "PROSPECT";
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  source: string | null;
  converted_at: string | null;
  notes: string | null;
  vat_number: string | null;
  tax_id: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string | null;
  addresses?: Address[];
  contacts?: Contact[];
}

export interface Address {
  pk_address_id: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: "BILLING" | "SHIPPING";
}

export interface Contact {
  pk_contact_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  position_title: string;
  contact_type: string;
  fk_id?: number;
  table?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomersV2Response {
  items: CustomerQuotes[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CreateCustomerDto {
  organizationID: number;
  name: string;
  ownerName: string;
  email: string;
  phoneNumber?: string;
  mobileNumber?: string;
  websiteURL?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industry?: string;
  customerType: "LEAD" | "CUSTOMER" | "PROSPECT";
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  source?: string;
  convertedAt?: string;
  notes?: string;
  vatNumber?: string;
  taxID?: string;
  tags?: string;
  addresses?: CreateAddressDto[];
  contacts?: CreateContactDto[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CreateAddressDto {
  fk_id?: number;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: "BILLING" | "SHIPPING";
  table?: string;
}

export interface CreateContactDto {
  fk_id?: number;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber?: string;
  mobileNumber?: string;
  positionTitle?: string;
  contactType?: string;
  table?: string;
}

// export interface CustomersQueryParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   customer_type?: "LEAD" | "CUSTOMER" | "PROSPECT";
//   status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
//   sort_by?: string;
//   sort_order?: "ASC" | "DESC";
// }

export interface CustomerStats {
  totalCustomers: number;
  totalLeads: number;
  totalProspects: number;
  totalActiveCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  recentlyCreated: number;
  recentlyUpdated: number;
  conversionRate: number;
}

export interface BulkOperation {
  customer_ids: number[];
  operation:
    | "delete"
    | "update_status"
    | "update_type"
    | "add_tags"
    | "remove_tags";
  data?: {
    status?: "ACTIVE" | "INACTIVE";
    customerType?: "LEAD" | "PROSPECT" | "CUSTOMER";
    tags?: string;
  };
}

export interface CustomerExportParams {
  format: "csv" | "xlsx" | "json";
  filters?: CustomersQueryParams;
  fields?: string[];
}


// GET Customer List API response types
export interface OrganizationList {
  id: number;
  name: string;
  industry: string | null;
  website_url: string | null;
  email: string | null;
}

export interface PrimaryContactList {
  pk_contact_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  mobile_number?: string;
  position_title?: string;
}

export interface CustomerList {
  pk_customer_id: number;
  name: string;
  owner_name: string | null;
  email: string;
  phone_number: string;
  mobile_number: string | null;
  website_url: string | null;
  industry: string | null;
  customer_type: 'LEAD' | 'PROSPECT' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE' | string;
  source: string | null;
  converted_at: string | null;
  notes: string | null;
  vat_number: string | null;
  tax_id: string | null;
  tags: string | null;
  total_orders: number | null;
  total_orders_spent: number | null;
  organization_data: OrganizationList;
  primary_contact: PrimaryContactList;
  created_at: string;
  updated_at: string | null;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface CustomersResponse {
  items: CustomerList[];
  meta: PaginationMeta;
}

export interface CustomersWithContactsResponse {
  items: Customer[];
  meta: PaginationMeta;
}

export interface CustomersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  customer_type?: 'LEAD' | 'PROSPECT' | 'CUSTOMER';
  status?: 'ACTIVE' | 'INACTIVE' | string;
  created_after?: string;
  created_before?: string;
  industry?: string;
  tags?: string;
}

export type PaginationParams = Pick<CustomersQueryParams, 'page' | 'limit'>;

export interface CustomerKpiItem {
  value: number;
  percentage: number;
  label: string;
}

export interface CustomerKpi {
  totalCustomers: CustomerKpiItem;
  activeCustomers: CustomerKpiItem;
  newThisMonth: CustomerKpiItem;
  totalRevenue: CustomerKpiItem;
}

/**
 * Parameters for unified search endpoint
 */
export interface UnifiedSearchParams {
  /** Search query term */
  q: string;

  /** Page number for pagination */
  page?: number;

  /** Number of items per page */
  limit?: number;

  /** Additional filters to apply to the search */
  filters?: Partial<Omit<CustomersQueryParams, 'page' | 'limit' | 'search'>>;
}

/**
 * Response type for unified search endpoint
 */
export interface UnifiedSearchResponse {
  /** Array of customer search results */
  items: CustomerList[];

  /** Pagination metadata */
  meta: PaginationMeta;

  /** Optional highlighting information for search terms */
  highlights?: {
    [customerId: string]: {
      [field: string]: string[];
    }
  };
}

/**
 * Search result item with highlighted content
 */
export interface HighlightedSearchResult extends CustomerList {
  highlights?: {
    [field: string]: string[];
  };
}
