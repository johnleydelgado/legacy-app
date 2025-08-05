export interface Packaging {
  pk_packaging_id: number;
  packaging: string;
  instruction: string;
}

export interface PackagingResponse {
  items: Packaging[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
