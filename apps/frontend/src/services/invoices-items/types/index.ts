// types.ts
export interface Product {
    id: number;
    style: string;
    product_name: string;
}

export interface Category {
    id: number;
    category_name: string;
}

export interface Address {
    id: number;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface InvoiceItem {
    pk_invoice_items_id: number;
    fk_invoice_id: number;
    products_data: Product;
    category_data: Category;
    addresses_data: Address;
    item_number: string;
    item_name: string;
    item_description: string;
    artwork_url: string;
    quantity: number;
    unit_price: number | string;
    tax_rate: number | string;
    line_total: number | string;
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: PaginationMeta;
}

export interface InvoiceItemsQueryParams {
    page?: number;
    itemsPerPage?: number;
}

// DTOs for creating and updating invoice items
export interface CreateInvoiceItemDTO {
    invoiceID: number;
    productID: number;
    // addressID?: number;
    itemName: string;
    itemDescription: string;
    // artworkURL: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export interface UpdateInvoiceItemDTO {
    productID?: number;
    // addressID?: number;
    itemName?: string;
    itemDescription?: string;
    // artworkURL?: string;
    quantity?: number;
    unitPrice?: number;
    taxRate?: number;
}
