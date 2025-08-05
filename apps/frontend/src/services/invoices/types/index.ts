// Base pagination parameters
export interface PaginationParams {
    page?: number;
    limit?: number;
}

// Response pagination metadata
export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

// Serial encoder in invoice
export interface SerialEncoder {
    quote_id?: number;
    order_id?: number;
    invoice_ids?: number[];
    purchase_order_ids?: number[];
}

// Customer data in invoice
export interface CustomerData {
    id: number;
    name: string;
    owner_name: string;
}

// Contact data in invoice
export interface Contact {
    id: number;
    first_name: string;
    last_name: string;
}

// Order data in invoice
export interface Order {
    id?: number;
    order_number?: string;
}

// Status data in invoice
export interface Status {
    id: number;
    platform: string;
    process: string;
    status: string;
    color: string;
}

// Invoice entity
export interface Invoice {
    pk_invoice_id: number;
    invoice_number: string;
    serial_encoder: SerialEncoder;
    invoice_date: string;
    due_date: string;
    subtotal: number;
    tax_total: number;
    total_amount: number;
    currency: string;
    notes: string;
    terms: string;
    tags: string[];
    customer_data: CustomerData;
    contact: Contact;
    order: Order;
    status: Status;
    user_owner: string;
    created_at: string;
    updated_at: string;
}

// Paginated invoices response
export interface InvoicesResponse {
    items: Invoice[];
    meta: PaginationMeta;
}

// Currency breakdown in KPI
export interface CurrencyBreakdown {
    [currency: string]: number;
}

// Invoice aging bucket in KPI
export interface InvoiceAgingBucket {
    amount: number;
    count: number;
    currencyBreakdown: CurrencyBreakdown;
    averageAmount: number;
    largestInvoiceAmount: number;
    oldestInvoiceDate?: string;
}

// Invoice KPI data
export interface InvoiceKpi {
    totalOutstanding: number;
    totalCount: number;
    currencyBreakdown: CurrencyBreakdown;
    current: InvoiceAgingBucket;
    thirtyToSixty: InvoiceAgingBucket;
    sixtyToNinety: InvoiceAgingBucket;
    ninetyPlus: InvoiceAgingBucket;
    averageDaysOverdue: number;
    averageInvoiceAmount: number;
    oldestInvoiceAge: number;
}

// Parameters for getting invoices
export interface GetInvoicesParams extends PaginationParams {}

// Parameters for getting customer invoices
export interface GetCustomerInvoicesParams extends PaginationParams {
    customerId: number;
}

// Parameters for searching invoices
export interface SearchInvoicesParams extends PaginationParams {
    q?: string;
}

// DTO for creating an invoice
export interface CreateInvoiceDto {
    customerID: number;
    statusID: number;
    orderID?: number;
    invoiceDate: string;
    dueDate: string;
    subTotal: number;
    taxTotal: number;
    currency?: string;
    notes?: string;
    terms?: string;
    tags?: string;
}

// DTO for updating an invoice
export interface UpdateInvoiceDto {
    customerID?: number;
    statusID?: number;
    invoiceDate?: string;
    dueDate?: string;
    subTotal?: number;
    taxTotal?: number;
    currency?: string;
    notes?: string;
    terms?: string;
    tags?: string;
}

// Response after deleting an invoice
export interface DeleteInvoiceResponse {
    success: boolean;
    message?: string;
}
