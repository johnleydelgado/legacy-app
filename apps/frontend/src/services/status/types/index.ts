export interface StatusItem {
    id: number;
    platform: string;
    process: string;
    status: string;
    color: string;
}

export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface StatusResponse {
    items: StatusItem[];
    meta: PaginationMeta;
}

export interface StatusQueryParams {
    page?: number;
    limit?: number;
    platform?: string;
    process?: string;
    search?: string;
}
