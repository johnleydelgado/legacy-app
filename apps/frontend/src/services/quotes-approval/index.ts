import { apiClient } from "@/lib/axios";
import {
  QuoteApproval,
  QuoteApprovalResponse,
  QuoteApprovalQueryParams,
  CreateQuoteApprovalDto,
  UpdateQuoteApprovalDto,
} from "./types";

export class QuoteApprovalService {
  private readonly endpoint = "/api/v1/quotes-approval";

  async getQuoteApprovals(
    params: QuoteApprovalQueryParams = {}
  ): Promise<QuoteApprovalResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const url = `${this.endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<QuoteApprovalResponse>(url);
  }

  async getQuoteApprovalById(id: number): Promise<QuoteApproval> {
    return apiClient.get<QuoteApproval>(`${this.endpoint}/${id}`);
  }

  async createQuoteApproval(
    data: CreateQuoteApprovalDto
  ): Promise<QuoteApproval> {
    return apiClient.post<QuoteApproval>(this.endpoint, data);
  }

  async updateQuoteApproval(
    id: number,
    data: UpdateQuoteApprovalDto
  ): Promise<QuoteApproval> {
    return apiClient.patch<QuoteApproval>(`${this.endpoint}/${id}`, data);
  }

  async deleteQuoteApproval(id: number): Promise<void> {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async getQuoteApprovalByQuoteId(
    quoteId: number
  ): Promise<QuoteApproval | null> {
    try {
      return await apiClient.get<QuoteApproval>(
        `${this.endpoint}/quote/${quoteId}?latest=true`
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getQuoteApprovalByToken(
    tokenHash: string
  ): Promise<QuoteApproval | null> {
    try {
      return await apiClient.get<QuoteApproval>(
        `${this.endpoint}/token/${tokenHash}`
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const quoteApprovalService = new QuoteApprovalService();
