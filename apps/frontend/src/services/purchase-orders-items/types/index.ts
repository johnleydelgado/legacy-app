interface Product {
    id: number;
    category: {
        id: number;
        name: string;
    }
}

// Purchase Order Item interface for API responses
export interface PurchaseOrderItem {
    pk_purchase_order_item_id: number;
    fk_purchase_order_id: number;
    product: Product;
    item_number: string;
    item_sku: string;
    item_name: string;
    item_description: string;
    item_specifications: Record<string, any>;
    item_notes: string;
    packaging_instructions: Record<string, any>;
    quantity: number;
    unit_price: number;
    rate: number;
    line_total: number;
    currency: string;
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

export interface PurchaseOrderItemsResponse {
    items: PurchaseOrderItem[];
    meta: PaginationMeta;
}

export interface PurchaseOrderItemResponse extends PurchaseOrderItem {}

// DTO interfaces for Create/Update operations
export interface CreatePurchaseOrderItemDto {
    purchaseOrderID: number;
    productID: number;
    itemSku: string;
    itemName: string;
    itemDescription: string;
    itemSpecifications: string;
    itemNotes?: string;
    packagingInstructions?: any;
    quantity: number;
    unitPrice: number;
    rate: number;
    currency: string;
}

export interface UpdatePurchaseOrderItemDto {
    productID?: number;
    itemSku?: string;
    itemName?: string;
    itemDescription?: string;
    itemSpecifications?: string;
    itemNotes?: string;
    packagingInstructions?: any;
    quantity?: number;
    unitPrice?: number;
    rate?: number;
    currency?: string;
}

// Query parameters
export interface PurchaseOrderItemsQueryParams {
    page?: number;
    itemsPerPage?: number;
}

export interface PurchaseOrderItemsByOrderQueryParams {
    page?: number;
    itemsPerPage?: number;
} 
