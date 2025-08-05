
export enum PurchaseOrderPriority {
    URGENT = 'URGENT',
    HIGH = 'HIGH',
    NORMAL = 'NORMAL',
    LOW = 'LOW',
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

// Vendor interface
export interface Vendor {
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

// Location Type interface
export interface LocationType {
    id: number;
    name: string;
    color: string;
}

// Lead Number interface
export interface LeadNumber {
    id: number;
    name: string;
    color: string;
}

// Shipping Method interface
export interface ShippingMethod {
    id: number;
    name: string;
    color: string;
}

// Serial Encoder interface
export interface SerialEncoder {
    id: number;
    order_id?: number;
    quote_id?: number;
    invoice_ids?: number[];
    purchase_order_ids: number[];
}

// Status interface
export interface Status {
    id: number;
    platform: string;
    process: string;
    status: string;
    color: string;
}

// Purchase Order interface for list view (from GET /purchase-orders)
export interface PurchaseOrder {
    pk_purchase_order_id: number;
    customer: Customer;
    vendor: Vendor;
    factory: Factory;
    location_type: LocationType;
    purchase_order_number: string;
    status: Status;
    priority: PurchaseOrderPriority;
    client_name: string;
    quote_approved_date: string | null;
    pd_signed_date: string | null;
    shipping_date: string | null;
    total_quantity: number;
    user_owner: string;
    created_at: string;
    updated_at: string;
}

// Purchase Order interface for detail view (from GET /purchase-orders/:id)
export interface PurchaseOrderDetails {
    pk_purchase_order_id: number;
    serial_encoder: SerialEncoder;
    customer: Customer;
    vendor: Vendor;
    factory: Factory;
    location_type: LocationType;
    lead_number: LeadNumber;
    shipping_method: ShippingMethod;
    purchase_order_number: string;
    status: Status;
    priority: PurchaseOrderPriority;
    client_name: string;
    client_description: string;
    quote_approved_date: string | null;
    pd_signed_date: string | null;
    shipping_date: string | null;
    total_quantity: number;
    notes: string;
    tags: Record<string, any>;
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

export interface PurchaseOrdersResponse {
    items: PurchaseOrder[];
    meta: PaginationMeta;
}

export interface PurchaseOrderResponse extends PurchaseOrderDetails {}

// Purchase Order interface for search results (from GET /purchase-orders/search)
export interface PurchaseOrderSearchResult {
    pk_purchase_order_id: number;
    purchase_order_number: string;
    customer: {
        id: number;
        name: string;
    };
    vendor: {
        id: number;
        name: string;
    };
    factory: {
        id: number;
        name: string;
    };
    location_type: {
        id: number;
        name: string;
    };
    lead_number: {
        id: number;
        name: string;
    };
    shipping_method: {
        id: number;
        name: string;
    };
    status: number; // Note: status is a number in search results, not a Status object
    priority: PurchaseOrderPriority;
    client_name: string;
    created_at: string;
    updated_at: string;
}

// Search response interface
export interface SearchPurchaseOrdersResponse {
    data: PurchaseOrderSearchResult[];
    meta: PaginationMeta;
    message: string;
}

// DTO interfaces for Create/Update operations
export interface CreatePurchaseOrderDto {
    fkCustomerID: number;
    fkVendorID: number;
    fkFactoryID: number;
    fkLocationTypeID: number;
    fKLeadNumbersID: number;
    fkShippingMethodID: number;
    fkOrderID?: number;
    status: number;
    priority: PurchaseOrderPriority;
    clientName: string;
    clientDescription: string;
    quoteApprovedDate: string;
    pdSignedDate: string;
    shippingDate: string;
    totalQuantity: number;
    notes?: string;
    tags?: string;
    userOwner: string;
}

export interface UpdatePurchaseOrderDto {
    fkCustomerID?: number;
    fkVendorID?: number;
    fkFactoryID?: number;
    fkLocationTypeID?: number;
    fkShippingMethodID?: number;
    status?: number;
    priority?: PurchaseOrderPriority;
    clientName?: string;
    clientDescription?: string;
    quoteApprovedDate?: string;
    pdSignedDate?: string;
    shippingDate?: string;
    totalQuantity?: number;
    notes?: string;
    tags?: string;
}

// KPI DTO and Response interfaces
export interface PurchaseOrderKpiDto {
    startDate?: string;
    endDate?: string;
    customerId?: number;
    vendorId?: number;
    factoryId?: number;
    priority?: PurchaseOrderPriority;
    status?: number;
}

export interface OverallKpiResponse {
    totalOrders: number;
    totalQuantity: number;
    averageQuantity: number;
    averageLeadTime: number | null;
    activeOrders: number;
    completedOrders: number;
}

export interface StatusBreakdownResponse {
    statusId: number;
    statusName: string;
    count: number;
    percentage: number;
}

export interface PriorityBreakdownResponse {
    priority: PurchaseOrderPriority;
    count: number;
    percentage: number;
}

export interface TrendDataResponse {
    period: string;
    ordersCreated: number;
    totalQuantity: number;
    averageLeadTime: number;
}

export interface TopEntityResponse {
    id: number;
    name: string;
    count: number;
    totalQuantity: number;
    averageLeadTime: number;
}

export interface ComprehensiveKpiResponse {
    overall: OverallKpiResponse;
    statusBreakdown: StatusBreakdownResponse[];
    priorityBreakdown: PriorityBreakdownResponse[];
    monthlyTrends: TrendDataResponse[];
    topCustomers: TopEntityResponse[];
    topVendors: TopEntityResponse[];
    topFactories: TopEntityResponse[];
    performanceMetrics: {
        onTimeDeliveryRate: number;
        averageProcessingTime: number;
        urgentOrdersPercentage: number;
    };
}

// KPI API Response wrappers
export interface OverallKpiApiResponse {
    data: OverallKpiResponse;
    message: string;
}

export interface ComprehensiveKpiApiResponse {
    data: ComprehensiveKpiResponse;
    message: string;
}

// Query parameters
export interface PurchaseOrdersQueryParams {
    page?: number;
    itemsPerPage?: number;
}

export interface SearchPurchaseOrdersParams {
    q: string;
    page?: number;
    limit?: number; // Updated to match the DTO (was itemsPerPage)
} 

export interface PurchaseOrderTotals {
    totalQuantity: number;
    totalUnitPrice: number;
    totalTaxRate: number;
    totalLineTotal: number;
  }
