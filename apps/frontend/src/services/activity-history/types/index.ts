// services/activity-history/types.ts

// Base Activity History Item

interface CustomerTypes {
    id: number;
    name: string;
    owner_name: string;
}

interface StatusTypes {
    id: number;
    status: string;
    process: string;
    color: string;
}

interface ActivityTypes {
    id: number;
    type_name: string;
    color: string;
}

export interface ActivityHistoryItem {
    pk_activity_id: number;
    fk_customer_id: number;
    customer_data: CustomerTypes,
    status_data: StatusTypes,
    tags: {
        type: string;
        data: any[];
    };
    activity: string;
    activity_type: ActivityTypes;
    document_id: number;
    document_type: string;
    user_owner: string;
    created_at: string;
    updated_at: string;
}

// Pagination Meta Information
export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

// API Response Types
export interface ActivityHistoryResponse {
    items: ActivityHistoryItem[];
    meta: PaginationMeta;
}

export interface CustomerActivityHistoryResponse {
    items: ActivityHistoryItem[];
    meta: PaginationMeta;
}

export interface DeleteActivityHistoryResponse {
    message: string;
    success: boolean;
}

// Request Parameter Types
export interface GetActivityHistoryParams {
    page?: number;
    limit?: number;
}

export interface GetCustomerActivityHistoryParams {
    customerId: number;
    page?: number;
    limit?: number;
}

export interface GetDocumentActivityHistoryParams {
    documentId: number;
    documentType: string;
    activityTypeNames?: string[];
    page?: number;
    limit?: number;
}

// DTO Types (Data Transfer Objects)
export interface CreateActivityHistoryDto {
    customerID: number;
    status: number;
    tags?: string;
    activity: string;
    activityType: string;
    documentID: number;
    documentType: string;
    userOwner: string;
}

export interface UpdateActivityHistoryDto {
    status?: number;
    tags?: string;
    activity?: string;
    activityType?: string;
    documentID?: number;
    documentType?: string;
    userOwner?: string;
}

// Enums for better type safety (optional)
export enum ActivityStatus {
    PENDING = 1,
    IN_PROGRESS = 2,
    COMPLETED = 3,
    CANCELLED = 4,
}

export enum ActivityType {
    CREATE = 'Create',
    UPDATE = 'Update',
    DELETE = 'Delete',
    VIEW = 'View',
    EXPORT = 'Export',
    IMPORT = 'Import',
}

export enum DocumentType {
    QUOTES = 'quotes',
    INVOICES = 'invoices',
    ORDERS = 'orders',
    CUSTOMERS = 'customers',
    PRODUCTS = 'products',
}
