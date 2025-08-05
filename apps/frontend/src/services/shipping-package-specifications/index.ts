// services/shipping-package-specifications/index.ts

import { apiClient } from "@/lib/axios";
import {
  CreateShippingPackageSpecificationsRequest,
  DeleteShippingPackageSpecificationResponse,
  ShippingPackageSpecification,
  ShippingPackageSpecificationsQueryParams,
  ShippingPackageSpecificationsResponse,
  ShippingPackageSpecificationStats,
  UpdateShippingPackageSpecificationsRequest,
} from "./types";

export class ShippingPackageSpecificationsService {
  private readonly endpoint = "/api/v1/shipping-package-specifications";

  /**
   * Get all shipping package specifications with pagination and filters
   */
  async getShippingPackageSpecifications(
    params: ShippingPackageSpecificationsQueryParams = {}
  ): Promise<ShippingPackageSpecificationsResponse> {
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

    const response = await apiClient.get<{
      data: ShippingPackageSpecificationsResponse;
    }>(url);
    return response.data;
  }

  /**
   * Get shipping package specification by ID
   */
  async getShippingPackageSpecificationById(
    id: number
  ): Promise<ShippingPackageSpecification> {
    const response = await apiClient.get<{
      data: ShippingPackageSpecification;
    }>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Get shipping package specifications by shipping order ID
   */
  async getShippingPackageSpecificationsByShippingOrderId(
    shippingOrderId: number,
    params: ShippingPackageSpecificationsQueryParams = {}
  ): Promise<ShippingPackageSpecificationsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const url = `${this.endpoint}/by-shipping-order/${shippingOrderId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get<{
      data: ShippingPackageSpecificationsResponse;
    }>(url);

    return response.data;
  }

  /**
   * Create new shipping package specification
   */
  async createShippingPackageSpecification(
    spec: CreateShippingPackageSpecificationsRequest
  ): Promise<ShippingPackageSpecification> {
    const response = await apiClient.post<{
      data: ShippingPackageSpecification;
      message: string;
    }>(this.endpoint, spec);
    return response.data;
  }

  /**
   * Update shipping package specification
   */
  async updateShippingPackageSpecification(
    id: number,
    spec: UpdateShippingPackageSpecificationsRequest
  ): Promise<ShippingPackageSpecification> {
    const response = await apiClient.put<{
      data: ShippingPackageSpecification;
      message: string;
    }>(`${this.endpoint}/${id}`, spec);
    return response.data;
  }

  /**
   * Delete shipping package specification
   */
  async deleteShippingPackageSpecification(
    id: number
  ): Promise<DeleteShippingPackageSpecificationResponse> {
    return apiClient.delete<DeleteShippingPackageSpecificationResponse>(
      `${this.endpoint}/${id}`
    );
  }

  /**
   * Delete all shipping package specifications by shipping order ID
   */
  async deleteShippingPackageSpecificationsByShippingOrderId(
    shippingOrderId: number
  ): Promise<DeleteShippingPackageSpecificationResponse> {
    return apiClient.delete<DeleteShippingPackageSpecificationResponse>(
      `${this.endpoint}/by-shipping-order/${shippingOrderId}`
    );
  }

  /**
   * Bulk operations
   */
  async bulkCreateShippingPackageSpecifications(
    specs: CreateShippingPackageSpecificationsRequest[]
  ): Promise<ShippingPackageSpecification[]> {
    const promises = specs.map((spec) =>
      this.createShippingPackageSpecification(spec)
    );
    return Promise.all(promises);
  }

  async bulkUpdateShippingPackageSpecifications(
    updates: {
      id: number;
      spec: UpdateShippingPackageSpecificationsRequest;
    }[]
  ): Promise<ShippingPackageSpecification[]> {
    const promises = updates.map((update) =>
      this.updateShippingPackageSpecification(update.id, update.spec)
    );
    return Promise.all(promises);
  }

  async bulkDeleteShippingPackageSpecifications(
    ids: number[]
  ): Promise<DeleteShippingPackageSpecificationResponse[]> {
    const promises = ids.map((id) =>
      this.deleteShippingPackageSpecification(id)
    );
    return Promise.all(promises);
  }

  /**
   * Get shipping package specifications stats by shipping order ID
   */
  async getShippingPackageSpecificationStats(
    shippingOrderId: number
  ): Promise<ShippingPackageSpecificationStats> {
    return apiClient.get<ShippingPackageSpecificationStats>(
      `${this.endpoint}/stats/shipping-order/${shippingOrderId}`
    );
  }

  /**
   * Get package statistics by shipping order ID
   */
  async getPackageStatsByShippingOrder(
    shippingOrderId: number
  ): Promise<ShippingPackageSpecificationStats> {
    const response = await apiClient.get<{
      data: ShippingPackageSpecificationStats;
    }>(`${this.endpoint}/stats/shipping-order/${shippingOrderId}`);
    return response.data;
  }
}

export const shippingPackageSpecificationsService =
  new ShippingPackageSpecificationsService();
