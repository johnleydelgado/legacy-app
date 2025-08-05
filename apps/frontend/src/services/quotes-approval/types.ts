export interface QuoteApproval {
  id: number;
  quoteId: number;
  customerId: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  reason?: string;
  tokenHash: string;
  payload?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteApprovalResponse {
  items: QuoteApproval[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface QuoteApprovalQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateQuoteApprovalDto {
  quoteId: number;
  customerId: number;
  reason?: string;
  tokenHash: string;
  payload?: Record<string, any>;
}

export interface UpdateQuoteApprovalDto {
  quoteId?: number;
  customerId?: number;
  reason?: string;
  tokenHash?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  payload?: Record<string, any>;
}
