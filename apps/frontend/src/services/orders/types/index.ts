// types/orders.ts
export interface Customer {
    id: number;
    name: string;
    owner_name?: string | null;
}

export interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string | null;
    mobile_number?: string | null;
    position_title?: string | null;
}

export interface Status {
    id: number;
    platform: string;
    process: string;
    status: string;
    color: string;
}

export interface Address {
    pk_address_id: number;
    fk_id: number;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    address_type: 'BILLING' | 'SHIPPING';
    table: string;
}

// Order interfaces
export interface Order {
    pk_order_id: number;
    customer_data: Customer;
    contact: Contact;
    status: Status;
    order_number: string;
    order_date: string;
    delivery_date: string | null;
    subtotal: number;
    tax_total: number;
    total_amount: number;
    currency: string;
    notes: string | null;
    terms: string | null;
    tags: string | null;
    user_owner: string;
    created_at: string;
    updated_at: string | null;
}

export interface OrderDetails extends Order {
    billing_address: Address[];
    shipping_address: Address[];
}

// API Response interfaces
export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface OrdersResponse {
    items: Order[];
    meta: PaginationMeta;
}

export interface SerialEncoder {
    id: number;
    serial_order_id: number;
    serial_quote_id: number;
    serial_invoice_ids: number[];
    serial_purchase_order_ids: number[];
}

export interface OrderResponse {
    pk_order_id: number;
    customer_data: Customer;
    contact: Contact;
    billing_address: Address[];
    shipping_address: Address[];
    status: Status;
    serial_encoder: SerialEncoder,
    order_number: string;
    order_date: string;
    delivery_date: string | null;
    subtotal: number;
    tax_total: number;
    total_amount: number;
    currency: string;
    notes: string | null;
    terms: string | null;
    tags: string | null;
    user_owner: string;
    created_at: string;
    updated_at: string | null;
}

// DTO interfaces
export interface CreateOrderDto {
    customerID: number;
    statusID: number;
    quotesID?: number;
    orderDate: string;
    deliveryDate: string;
    subtotal: number;
    taxTotal: number;
    currency: string;
    notes?: string;
    terms?: string;
    tags?: string;
    userOwner: string;
}

export interface UpdateOrderDto {
    customerID?: number;
    statusID?: number;
    orderDate?: string;
    deliveryDate?: string;
    subtotal?: number;
    taxTotal?: number;
    currency?: string;
    notes?: string;
    terms?: string;
    tags?: string;
    userOwner?: string;
}

// Sorting and Filtering Types
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface OrderSortDto {
  pk_order_id?: SortDirection;
  order_number?: SortDirection;
  order_date?: SortDirection;
  delivery_date?: SortDirection;
  total_amount?: SortDirection;
  user_owner?: SortDirection;
  customer_name?: SortDirection;
  status?: SortDirection;
}

export interface OrderFilterDto {
  status?: string;
  user_owner?: string;
}

// Query parameters
export interface OrdersQueryParams {
    page?: number;
    itemsPerPage?: number;
    sort?: OrderSortDto;
    filter?: OrderFilterDto;
}

export interface SearchOrdersParams {
    q: string;
    page?: number;
    itemsPerPage?: number;
    sort?: OrderSortDto;
    filter?: OrderFilterDto;
}

// API Error interface
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

// Dashboard Analytics Types
export interface DashboardMetric {
    value: number;
    percentage: number;
    label: string;
}

export interface DashboardAnalytics {
    totalValue: DashboardMetric;
    pendingOrders: DashboardMetric;
    newThisMonth: DashboardMetric;
    totalRevenue: DashboardMetric;
}

// Process Summary Types
export interface ProcessSummaryItem {
    status: string;
    count: number;
    total: number;
}

export type ProcessSummaryResponse = ProcessSummaryItem[];

// Owner Breakdown Types
export interface OwnerBreakdownItem {
    customerId: number;
    customerName: string;
    ownerName: string;
    orderCount: number;
    totalValue: number;
}

export type OwnerBreakdownResponse = OwnerBreakdownItem[];

export interface OwnerBreakdownParams {
    limit?: number;
}

// Status Distribution Types
export interface StatusDistributionItem {
    status: string;
    count: number;
    percentage: number;
    totalValue: number;
}

export type StatusDistributionResponse = StatusDistributionItem[];

// Monthly Trends Types
export interface MonthlyTrendItem {
    month: string;
    orderCount: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export type MonthlyTrendsResponse = MonthlyTrendItem[];

export interface MonthlyTrendsParams {
    months?: number;
}

// Performance Metrics Types
export interface TopPerformingMonth {
    month: string;
    revenue: number;
}

export interface PerformanceMetrics {
    averageOrderValue: number;
    completionRate: number;
    monthlyGrowthRate: number;
    topPerformingMonth: TopPerformingMonth;
}

// Query Parameters Union Type
export type AnalyticsQueryParams =
    | OwnerBreakdownParams
    | MonthlyTrendsParams
    | Record<string, never>;

export interface LastOrder {
    id: number;
    orderNumber: string;
    orderDate: string;
    totalAmount: number;
    createdAt: string;
}

export interface CustomerKPI {
    orderCount: number;
    totalAmount: number;
    lastOrder: LastOrder;
    averageOrderValue: number;
}
