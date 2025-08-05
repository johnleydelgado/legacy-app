// Yarn interface
export interface Yarn {
    id: number;
    name: string;
    yarn_color: string;
    color_code: string;
    card_number: string;
    yarn_type: string;
}

// Knit Color interface
export interface ProductionOrderKnitColor {
    pk_production_orders_knit_color_id: number;
    name: string;
    yarn: Yarn;
    description: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
}

// Body Color interface
export interface ProductionOrderBodyColor {
    pk_production_orders_body_color_id: number;
    name: string;
    yarn: Yarn;
    description: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
}

// Packaging interface
export interface ProductionOrderPackaging {
    pk_production_orders_packaging_id: number;
    name: string;
    type: string | null;
    dimensions: string | null;
    weight_capacity: number | null;
    unit: string;
    cost: number | null;
    status: 'ACTIVE' | 'INACTIVE';
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

export interface ProductionOrderKnitColorsResponse {
    items: ProductionOrderKnitColor[];
    meta?: PaginationMeta;
}

export interface ProductionOrderBodyColorsResponse {
    items: ProductionOrderBodyColor[];
    meta?: PaginationMeta;
}

export interface ProductionOrderPackagingResponse {
    items: ProductionOrderPackaging[];
    meta?: PaginationMeta;
}

// DTO interfaces for Create/Update operations
export interface CreateProductionOrderKnitColorDto {
    fkProductionOrderItemID: number;
    name: string;
    fkYarnID: number;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateProductionOrderKnitColorDto {
    name?: string;
    fkYarnID?: number;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateProductionOrderBodyColorDto {
    fkProductionOrderItemID: number;
    name: string;
    fkYarnID: number;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateProductionOrderBodyColorDto {
    name?: string;
    fkYarnID?: number;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateProductionOrderPackagingDto {
    fkProductionOrderItemID: number;
    fkPackagingID: number;
    quantity?: number;
}

export interface UpdateProductionOrderPackagingDto {
    fkProductionOrderItemID?: number;
    fkPackagingID?: number;
    quantity?: number;
}