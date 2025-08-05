import { apiClient } from "@/lib/axios";
import {
  QuoteTypes,
  QuotesResponse,
  QuotesSearchResponse,
  QuotesQueryParams,
  QuotesSearchParams,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  DeleteQuoteResponse,
} from "@/services/quotes/types";
import {QuoteDetails, QuotesDashboardSummaryResponse, QuotesStatusResponse} from "./types";
import { Quote } from "@/types/quote";

export class QuotesService {
  private readonly endpoint = "/api/v1/quotes";

  async getQuotes(params: QuotesQueryParams = {}): Promise<QuotesResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    
    // Handle sort parameters as JSON string
    if (params.sort && Object.keys(params.sort).length > 0) {
      queryParams.append("sort", JSON.stringify(params.sort));
    }
    
    // Handle filter parameters as JSON string  
    if (params.filter && Object.keys(params.filter).length > 0) {
      queryParams.append("filter", JSON.stringify(params.filter));
    }

    const url = `${this.endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<QuotesResponse>(url);
  }

  // New search method
  async searchQuotes(
    params: QuotesSearchParams
  ): Promise<QuotesSearchResponse> {
    const queryParams = new URLSearchParams();
  
    queryParams.append("q", params.q);
    
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
      
    // Handle sort parameters as JSON string
    if (params.sort && Object.keys(params.sort).length > 0) {
      queryParams.append("sort", JSON.stringify(params.sort));
    }
      
    // Handle filter parameters as JSON string  
    if (params.filter && Object.keys(params.filter).length > 0) {
      queryParams.append("filter", JSON.stringify(params.filter));
    }
  
    const url = `${this.endpoint}/search?${queryParams.toString()}`;
    return apiClient.get<QuotesSearchResponse>(url);
  }

  async getQuoteById(id: number): Promise<QuoteDetails> {
    return apiClient.get<QuoteDetails>(`${this.endpoint}/${id}`);
  }

  async createQuote(quote: CreateQuoteRequest): Promise<Quote> {
    return apiClient.post<Quote>(this.endpoint, quote);
  }

  async updateQuote(id: number, quote: UpdateQuoteRequest): Promise<Quote> {
    return apiClient.put<Quote>(`${this.endpoint}/${id}`, quote);
  }

  async deleteQuote(id: number): Promise<DeleteQuoteResponse> {
    return apiClient.delete<DeleteQuoteResponse>(`${this.endpoint}/${id}`);
  }

  async getQuotesByCustomerId(
    customerId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<QuotesResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.endpoint}/customer/${customerId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<QuotesResponse>(url);
  }

  /**
   * Get dashboard summary data
   * Provides overview statistics including:
   * - Total value and awaiting approval counts
   * - Owner breakdown with quote counts and values
   * - Process summary with status breakdowns
   * - Available statuses and detailed counts
   */
  async getDashboardSummary(): Promise<QuotesDashboardSummaryResponse> {
    const url = `${this.endpoint}/dashboard/summary`;
    return apiClient.get<QuotesDashboardSummaryResponse>(url);
  }
}

export const quotesService = new QuotesService();
