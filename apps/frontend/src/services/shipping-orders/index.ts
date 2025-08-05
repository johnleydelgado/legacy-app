import { apiClient } from "@/lib/axios";
import {
  ShippingOrderTypes,
  ShippingOrdersResponse,
  ShippingOrdersSearchResponse,
  ShippingOrdersQueryParams,
  ShippingOrdersSearchParams,
  CreateShippingOrderRequest,
  UpdateShippingOrderRequest,
  DeleteShippingOrderResponse,
  ShippingOrderDetails,
  ShippingOrdersDashboardSummaryResponse,
} from "./types";

export class ShippingOrdersService {
  private readonly endpoint = "/api/v1/shipping-orders";

  async getShippingOrders(
    params: ShippingOrdersQueryParams = {}
  ): Promise<ShippingOrdersResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);

    const url = `${this.endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<ShippingOrdersResponse>(url);
  }

  // New search method
  async searchShippingOrders(
    params: ShippingOrdersSearchParams
  ): Promise<ShippingOrdersSearchResponse> {
    const queryParams = new URLSearchParams();

    queryParams.append("q", params.q);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.endpoint}/search?${queryParams.toString()}`;
    return apiClient.get<ShippingOrdersSearchResponse>(url);
  }

  async getShippingOrderById(id: number): Promise<ShippingOrderDetails> {
    return apiClient.get<ShippingOrderDetails>(`${this.endpoint}/${id}`);
  }

  async createShippingOrder(
    shippingOrder: CreateShippingOrderRequest
  ): Promise<ShippingOrderTypes> {
    return apiClient.post<ShippingOrderTypes>(this.endpoint, shippingOrder);
  }

  async updateShippingOrder(
    id: number,
    shippingOrder: UpdateShippingOrderRequest
  ): Promise<ShippingOrderTypes> {
    return apiClient.put<ShippingOrderTypes>(
      `${this.endpoint}/${id}`,
      shippingOrder
    );
  }

  async deleteShippingOrder(id: number): Promise<DeleteShippingOrderResponse> {
    return apiClient.delete<DeleteShippingOrderResponse>(
      `${this.endpoint}/${id}`
    );
  }

  async getShippingOrdersByCustomerId(
    customerId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<ShippingOrdersResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.endpoint}/customer/${customerId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<ShippingOrdersResponse>(url);
  }

  /**
   * Get dashboard summary data
   * Provides overview statistics including:
   * - Total value and pending shipment counts
   * - Carrier breakdown with counts and values
   * - Process summary with status breakdowns
   * - Available statuses and detailed counts
   */
  async getDashboardSummary(): Promise<ShippingOrdersDashboardSummaryResponse> {
    const url = `${this.endpoint}/dashboard-summary`;
    return apiClient.get<ShippingOrdersDashboardSummaryResponse>(url);
  }
}

export const shippingOrdersService = new ShippingOrdersService();
