// services/shipping-order-items/index.ts

import { apiClient } from "@/lib/axios";
import {
  CreateShippingOrderItemRequest,
  DeleteShippingOrderItemResponse,
  ShippingOrderItem,
  ShippingOrderItemsQueryParams,
  ShippingOrderItemsResponse,
  ShippingOrderTotals,
  UpdateShippingOrderItemRequest,
} from "./types";

export class ShippingOrderItemsService {
  private readonly endpoint = "/api/v1/shipping-order-items";

  /**
   * Get all shipping order items with pagination and filters
   */
  async getShippingOrderItems(
    params: ShippingOrderItemsQueryParams = {}
  ): Promise<ShippingOrderItemsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.shipping_order_id)
      queryParams.append(
        "shipping_order_id",
        params.shipping_order_id.toString()
      );
    if (params.search) queryParams.append("search", params.search);

    const url = `${this.endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return apiClient.get<ShippingOrderItemsResponse>(url);
  }

  /**
   * Get shipping order item by ID
   */
  async getShippingOrderItemById(id: number): Promise<ShippingOrderItem> {
    return apiClient.get<ShippingOrderItem>(`${this.endpoint}/${id}`);
  }

  /**
   * Get shipping order items by shipping order ID with pagination
   */
  async getShippingOrderItemsByShippingOrderId(
    shippingOrderId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<ShippingOrderItemsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.endpoint}/by-shipping-order/${shippingOrderId}/all${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return apiClient.get<ShippingOrderItemsResponse>(url);
  }

  /**
   * Create new shipping order item
   */
  async createShippingOrderItem(
    item: CreateShippingOrderItemRequest
  ): Promise<ShippingOrderItem> {
    return apiClient.post<ShippingOrderItem>(this.endpoint, item);
  }

  /**
   * Update existing shipping order item
   */
  async updateShippingOrderItem(
    id: number,
    item: UpdateShippingOrderItemRequest
  ): Promise<ShippingOrderItem> {
    return apiClient.put<ShippingOrderItem>(`${this.endpoint}/${id}`, item);
  }

  /**
   * Delete shipping order item
   */
  async deleteShippingOrderItem(
    id: number
  ): Promise<DeleteShippingOrderItemResponse> {
    return apiClient.delete<DeleteShippingOrderItemResponse>(
      `${this.endpoint}/${id}`
    );
  }

  /**
   * Delete all shipping order items by shipping order ID
   */
  async deleteShippingOrderItemsByShippingOrderId(
    shippingOrderId: number
  ): Promise<DeleteShippingOrderItemResponse> {
    return apiClient.delete<DeleteShippingOrderItemResponse>(
      `${this.endpoint}/shipping-order/${shippingOrderId}`
    );
  }

  /**
   * Bulk operations
   */
  async bulkCreateShippingOrderItems(
    items: CreateShippingOrderItemRequest[]
  ): Promise<ShippingOrderItem[]> {
    const promises = items.map((item) => this.createShippingOrderItem(item));
    return Promise.all(promises);
  }

  async bulkUpdateShippingOrderItems(
    updates: { id: number; item: UpdateShippingOrderItemRequest }[]
  ): Promise<ShippingOrderItem[]> {
    const promises = updates.map((update) =>
      this.updateShippingOrderItem(update.id, update.item)
    );
    return Promise.all(promises);
  }

  async bulkDeleteShippingOrderItems(
    ids: number[]
  ): Promise<DeleteShippingOrderItemResponse[]> {
    const promises = ids.map((id) => this.deleteShippingOrderItem(id));
    return Promise.all(promises);
  }

  /**
   * Get shipping order totals by shipping order ID
   */
  async getShippingOrderTotals(
    shippingOrderId: number
  ): Promise<ShippingOrderTotals> {
    return apiClient.get<ShippingOrderTotals>(
      `${this.endpoint}/shipping-orders/${shippingOrderId}/totals`
    );
  }
}

export const shippingOrderItemsService = new ShippingOrderItemsService();
