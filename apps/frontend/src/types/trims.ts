export interface Trim {
  pk_trim_id: number;
  trim: string;
}

export interface TrimsResponse {
  items: Trim[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
