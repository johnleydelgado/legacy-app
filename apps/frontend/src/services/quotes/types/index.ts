// services/quotes/types/index.tsx
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
  serial_purchase_order_ids: number[];
}

export interface QuoteTypes {
  pk_quote_id: number;
  customer: CustomerList;
  status: Status;
  quote_number: string;
  quote_date: string;
  expiration_date: string;
  subtotal: number;
  tax_total: number;
  total_amount: number;
  currency: string;
  terms: string;
  tags: string;
  user_owner: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteDetails {
  pk_quote_id: number;
  customer: Customer;
  status: Status;
  serial_encoder: SerialEncoder;
  quote_number: string;
  quote_date: string;
  expiration_date: string;
  subtotal: number;
  tax_total: number;
  total_amount: number;
  currency: string;
  terms: string;
  tags: string;
  notes: string;
  user_owner: string;
  created_at: string;
  updated_at: string;
}

export interface QuotesResponse {
  items: QuoteTypes[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// Sort order enum
export type SortOrder = 'ASC' | 'DESC';

// Sort fields for quotes
export type QuoteSortField = 
  | 'pk_quote_id' 
  | 'quote_number' 
  | 'quote_due_date' 
  | 'subtotal' 
  | 'total_amount' 
  | 'status' 
  | 'customer_name' 
  | 'user_owner';

// Sort configuration - using Record type instead of mapped interface
export type QuoteSort = Record<QuoteSortField, SortOrder>;

// Alternatively, you can make it partial if not all fields need to be specified
// export type QuoteSort = Partial<Record<QuoteSortField, SortOrder>>;

// Filter configuration
export interface QuoteFilter {
  status?: string;
  user_owner?: string;
}

export interface QuotesQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: Partial<QuoteSort>;
  filter?: QuoteFilter;
}

export interface CreateQuoteRequest {
  customerID: number;
  statusID: number;
  quoteDate: string;
  expirationDate: string;
  subtotal: number;
  taxTotal: number;
  currency: string;
  notes?: string;
  terms?: string;
  tags?: string;
  userOwner: string;
}

export interface UpdateQuoteRequest {
  customerID?: number;
  quoteDate?: string;
  expirationDate?: string;
  statusID?: number;
  subtotal?: number;
  taxTotal?: number;
  currency?: string;
  notes?: string;
  terms?: string;
  tags?: string;
  userOwner?: string;
}

export interface DeleteQuoteResponse {
  raw: any[];
  affected: number;
}

// New search response interface
export interface QuotesSearchResponse extends QuotesResponse {
  searchTerm: string;
  originalSearchTerm: string;
  searchFields: string[];
  matchType: string;
}

// New search specific params
export interface QuotesSearchParams {
  q: string; // search query
  page?: number;
  limit?: number;
  sort?: Partial<QuoteSort>;
  filter?: QuoteFilter;
}

export interface QuotesStatusResponse {
  totalValue: {
    amount: number;
    currency: string;
    label: string;
  };
  outstandingAmount: {
    amount: number;
    currency: string;
    label: string;
  };
  awaitingApproval: {
    count: number;
    label: string;
    description: string;
  };
  ownerBreakdown: {
    totalOwners: number;
    label: string;
    topOwner: string;
    topOwnerCount: number;
    owners: Array<{
      name: string;
      quoteCount: number;
      totalValue: number;
    }>;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    totalValue: number;
    percentage: string;
  }>;
  summary: {
    totalQuotes: number;
    recentQuotes: number;
    averageQuoteValue: string;
  };
  lastUpdated: string;
}

// Dashboard Types
export interface DashboardSummaryValue {
  label: string;
  amount: number;
  description: string;
}

export interface DashboardAwaitingApproval {
  label: string;
  count: number;
  description: string;
}

export interface DashboardOwnerBreakdownSummary {
  label: string;
  count: number;
  owner: string;
  description: string;
}

export interface DashboardOwnerBreakdown {
  owner: string;
  count: number;
  totalValue: number;
}

export interface DashboardStatusItem {
  id: number;
  status: string;
  color: string | null;
  count: number;
}

export interface DashboardProcessSummary {
  process: string;
  total: number;
  statuses: DashboardStatusItem[];
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
  platform: string;
  process: string;
  status: string;
  color: string | null;
}

export interface DashboardSummary {
  totalValue: DashboardSummaryValue;
  awaitingApproval: DashboardAwaitingApproval;
  ownerBreakdown: DashboardOwnerBreakdownSummary;
}

export interface QuotesDashboardSummaryResponse {
  totalValue: number;
  summary: DashboardSummary;
  ownerBreakdown: DashboardOwnerBreakdown[];
  totalQuotes: number;
  processSummary: DashboardProcessSummary[];
  detailedCounts: DashboardDetailedCount[];
  availableStatuses: DashboardAvailableStatus[];
  lastUpdated: string;
}

// Status Types
export interface QuotesStatusResponse {
  totalValue: {
    amount: number;
    currency: string;
    label: string;
  };
  outstandingAmount: {
    amount: number;
    currency: string;
    label: string;
  };
  awaitingApproval: {
    count: number;
    label: string;
    description: string;
  };
  ownerBreakdown: {
    totalOwners: number;
    label: string;
    topOwner: string;
    topOwnerCount: number;
    owners: Array<{
      name: string;
      quoteCount: number;
      totalValue: number;
    }>;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    totalValue: number;
    percentage: string;
  }>;
  summary: {
    totalQuotes: number;
    recentQuotes: number;
    averageQuoteValue: string;
  };
  lastUpdated: string;
}
