export interface Yarn {
  pk_yarn_id: number;
  yarn_color: string;
  card_number: string;
  color_code: string;
  yarn_type: string;
}

export interface YarnsResponse {
  items: Yarn[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
