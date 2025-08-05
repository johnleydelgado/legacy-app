// services/shipping-package-spec-items/index.ts

import { apiClient } from "@/lib/axios";
import {
  CreateShippingPackageSpecItemRequest,
  ShippingPackageSpecItem,
  ShippingPackageSpecItemsQueryParams,
  ShippingPackageSpecItemsResponse,
  UpdateShippingPackageSpecItemRequest,
  PackageItemSummary,
  ItemPackageSummary,
} from "./types";

export class ShippingPackageSpecItemsService {
  private readonly endpoint = "/api/v1/shipping-package-spec-items";

  /**
   * Get all shipping package spec items with pagination and filters
   */
  async getShippingPackageSpecItems(
    params: ShippingPackageSpecItemsQueryParams = {}
  ): Promise<ShippingPackageSpecItemsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.package_spec_id)
      queryParams.append("package_spec_id", params.package_spec_id.toString());
    if (params.shipping_order_item_id)
      queryParams.append(
        "shipping_order_item_id",
        params.shipping_order_item_id.toString()
      );

    const url = `${this.endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get<{
      data: ShippingPackageSpecItemsResponse;
    }>(url);
    return response.data;
  }

  /**
   * Get a single shipping package spec item by ID
   */
  async getShippingPackageSpecItem(
    id: number
  ): Promise<ShippingPackageSpecItem> {
    const response = await apiClient.get<{
      data: ShippingPackageSpecItem;
    }>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Get shipping package spec items by package specification ID
   */
  async getShippingPackageSpecItemsByPackageSpecId(
    packageSpecId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<ShippingPackageSpecItemsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.endpoint}/package/${packageSpecId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get<{
      data: ShippingPackageSpecItemsResponse;
    }>(url);
    return response.data;
  }

  /**
   * Get shipping package spec items by shipping order item ID
   */
  async getShippingPackageSpecItemsByShippingOrderItemId(
    shippingOrderItemId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<ShippingPackageSpecItemsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${this.endpoint}/item/${shippingOrderItemId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get<{
      data: ShippingPackageSpecItemsResponse;
    }>(url);
    return response.data;
  }

  /**
   * Get package item summary
   */
  async getPackageItemSummary(
    packageSpecId: number
  ): Promise<PackageItemSummary> {
    const response = await apiClient.get<{
      data: PackageItemSummary;
    }>(`${this.endpoint}/package/${packageSpecId}/summary`);
    return response.data;
  }

  /**
   * Get item package summary
   */
  async getItemPackageSummary(
    shippingOrderItemId: number
  ): Promise<ItemPackageSummary> {
    const response = await apiClient.get<{
      data: ItemPackageSummary;
    }>(`${this.endpoint}/item/${shippingOrderItemId}/summary`);
    return response.data;
  }

  /**
   * Create a new shipping package spec item
   */
  async createShippingPackageSpecItem(
    data: CreateShippingPackageSpecItemRequest
  ): Promise<ShippingPackageSpecItem> {
    const response = await apiClient.post<{
      data: ShippingPackageSpecItem;
    }>(this.endpoint, data);
    return response.data;
  }

  /**
   * Update an existing shipping package spec item
   */
  async updateShippingPackageSpecItem(
    id: number,
    data: UpdateShippingPackageSpecItemRequest
  ): Promise<ShippingPackageSpecItem> {
    const response = await apiClient.patch<{
      data: ShippingPackageSpecItem;
    }>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a shipping package spec item
   */
  async deleteShippingPackageSpecItem(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Delete all shipping package spec items by package specification ID
   */
  async deleteShippingPackageSpecItemsByPackageSpecId(
    packageSpecId: number
  ): Promise<void> {
    await apiClient.delete(`${this.endpoint}/package/${packageSpecId}`);
  }

  /**
   * Delete all shipping package spec items by shipping order item ID
   */
  async deleteShippingPackageSpecItemsByShippingOrderItemId(
    shippingOrderItemId: number
  ): Promise<void> {
    await apiClient.delete(`${this.endpoint}/item/${shippingOrderItemId}`);
  }
}

export const shippingPackageSpecItemsService =
  new ShippingPackageSpecItemsService();
