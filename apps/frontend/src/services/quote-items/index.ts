// services/logo-upload-dropzone/index.tsx

import { apiClient } from "@/lib/axios";
import {
  CreateQuoteItemRequest, DeleteQuoteItemResponse,
  QuoteItem,
  QuoteItemsQueryParams,
  QuoteItemsResponse, QuoteTotals,
  UpdateQuoteItemRequest
} from "./types";

export class QuoteItemsService {
  private readonly endpoint = "/api/v1/quotes-items";

  /**
   * Get all quote items with pagination and filters
   */
  async getQuoteItems(params: QuoteItemsQueryParams = {}): Promise<QuoteItemsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.quote_id) queryParams.append("quote_id", params.quote_id.toString());
    if (params.search) queryParams.append("search", params.search);

    const url = `${this.endpoint}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return apiClient.get<QuoteItemsResponse>(url);
  }

  /**
   * Get quote item by ID
   */
  async getQuoteItemById(id: number): Promise<QuoteItem> {
    return apiClient.get<QuoteItem>(`${this.endpoint}/${id}`);
  }

  /**
   * Get quote items by quote ID with pagination
   */
  async getQuoteItemsByQuoteId(
      quoteId: number,
      params: { page?: number; limit?: number } = {}
  ): Promise<QuoteItemsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.endpoint}/by-quote/${quoteId}/all${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return apiClient.get<QuoteItemsResponse>(url);
  }

  /**
   * Create new quote item
   */
  async createQuoteItem(item: CreateQuoteItemRequest): Promise<QuoteItem> {
    return apiClient.post<QuoteItem>(this.endpoint, item);
  }

  /**
   * Update existing quote item
   */
  async updateQuoteItem(id: number, item: UpdateQuoteItemRequest): Promise<QuoteItem> {
    return apiClient.put<QuoteItem>(`${this.endpoint}/${id}`, item);
  }

  /**
   * Delete quote item
   */
  async deleteQuoteItem(id: number): Promise<DeleteQuoteItemResponse> {
    return apiClient.delete<DeleteQuoteItemResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Bulk operations
   */
  async bulkCreateQuoteItems(items: CreateQuoteItemRequest[]): Promise<QuoteItem[]> {
    const promises = items.map(item => this.createQuoteItem(item));
    return Promise.all(promises);
  }

  async bulkUpdateQuoteItems(updates: { id: number; item: UpdateQuoteItemRequest }[]): Promise<QuoteItem[]> {
    const promises = updates.map(update => this.updateQuoteItem(update.id, update.item));
    return Promise.all(promises);
  }

  async bulkDeleteQuoteItems(ids: number[]): Promise<DeleteQuoteItemResponse[]> {
    const promises = ids.map(id => this.deleteQuoteItem(id));
    return Promise.all(promises);
  }

  /**
   * Get quote totals by quote ID
   */
  async getQuoteTotals(quoteId: number): Promise<QuoteTotals> {
    return apiClient.get<QuoteTotals>(`${this.endpoint}/quotes/${quoteId}/totals`);
  }
}

export const quoteItemsService = new QuoteItemsService();
