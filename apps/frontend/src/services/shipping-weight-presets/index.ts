// services/shipping-weight-presets/index.ts
import { apiClient } from "@/lib/axios";
import {
  CreateShippingWeightPresetRequest,
  ShippingWeightPreset,
  ShippingWeightPresetsResponse,
  UpdateShippingWeightPresetRequest,
  ShippingWeightPresetResponse,
  PaginatedShippingWeightPresetsResponse,
} from "./types";

class ShippingWeightPresetsService {
  private baseUrl = "/api/v1/shipping-weight-presets";

  /**
   * Get a paginated list of shipping weight presets
   */
  async getShippingWeightPresets(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedShippingWeightPresetsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${this.baseUrl}?${searchParams.toString()}`;

    try {
      return await apiClient.get<PaginatedShippingWeightPresetsResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch shipping weight presets"
      );
    }
  }

  /**
   * Get all active shipping weight presets
   */
  async getActiveShippingWeightPresets(): Promise<ShippingWeightPresetsResponse> {
    try {
      return await apiClient.get<ShippingWeightPresetsResponse>(
        `${this.baseUrl}/active`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch active shipping weight presets"
      );
    }
  }

  /**
   * Get shipping weight presets by measurement unit
   */
  async getShippingWeightPresetsByUnit(
    measurementUnit: "metric" | "imperial"
  ): Promise<ShippingWeightPresetsResponse> {
    try {
      return await apiClient.get<ShippingWeightPresetsResponse>(
        `${this.baseUrl}/unit/${measurementUnit}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch ${measurementUnit} shipping weight presets`
      );
    }
  }

  /**
   * Get a single shipping weight preset by ID
   */
  async getShippingWeightPresetById(
    id: number
  ): Promise<ShippingWeightPresetResponse> {
    try {
      return await apiClient.get<ShippingWeightPresetResponse>(
        `${this.baseUrl}/${id}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch shipping weight preset with id ${id}`
      );
    }
  }

  /**
   * Create a new shipping weight preset
   */
  async createShippingWeightPreset(
    data: CreateShippingWeightPresetRequest
  ): Promise<ShippingWeightPresetResponse> {
    try {
      return await apiClient.post<ShippingWeightPresetResponse>(
        this.baseUrl,
        data
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to create shipping weight preset"
      );
    }
  }

  /**
   * Update an existing shipping weight preset
   */
  async updateShippingWeightPreset(
    id: number,
    data: UpdateShippingWeightPresetRequest
  ): Promise<ShippingWeightPresetResponse> {
    try {
      return await apiClient.put<ShippingWeightPresetResponse>(
        `${this.baseUrl}/${id}`,
        data
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update shipping weight preset"
      );
    }
  }

  /**
   * Delete a shipping weight preset
   */
  async deleteShippingWeightPreset(id: number): Promise<{ message: string }> {
    try {
      return await apiClient.delete<{ message: string }>(
        `${this.baseUrl}/${id}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to delete shipping weight preset"
      );
    }
  }

  /**
   * Health check endpoint
   */
  async ping(): Promise<{ data: { message: string } }> {
    try {
      return await apiClient.get<{ data: { message: string } }>(
        `${this.baseUrl}/ping`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to ping shipping weight presets service"
      );
    }
  }
}

export const shippingWeightPresetsService = new ShippingWeightPresetsService();
