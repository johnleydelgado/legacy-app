// services/shipping-dimension-presets/index.ts
import { apiClient } from "@/lib/axios";
import {
  CreateShippingDimensionPresetRequest,
  ShippingDimensionPreset,
  ShippingDimensionPresetsResponse,
  UpdateShippingDimensionPresetRequest,
  ShippingDimensionPresetResponse,
  PaginatedShippingDimensionPresetsResponse,
} from "./types";

class ShippingDimensionPresetsService {
  private baseUrl = "/api/v1/shipping-dimension-presets";

  /**
   * Get a paginated list of shipping dimension presets
   */
  async getShippingDimensionPresets(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedShippingDimensionPresetsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${this.baseUrl}?${searchParams.toString()}`;

    try {
      return await apiClient.get<PaginatedShippingDimensionPresetsResponse>(
        url
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch shipping dimension presets"
      );
    }
  }

  /**
   * Get all active shipping dimension presets
   */
  async getActiveShippingDimensionPresets(): Promise<ShippingDimensionPresetsResponse> {
    try {
      return await apiClient.get<ShippingDimensionPresetsResponse>(
        `${this.baseUrl}/active`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch active shipping dimension presets"
      );
    }
  }

  /**
   * Get shipping dimension presets by measurement unit
   */
  async getShippingDimensionPresetsByUnit(
    measurementUnit: "metric" | "imperial"
  ): Promise<ShippingDimensionPresetsResponse> {
    try {
      return await apiClient.get<ShippingDimensionPresetsResponse>(
        `${this.baseUrl}/unit/${measurementUnit}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch ${measurementUnit} shipping dimension presets`
      );
    }
  }

  /**
   * Get a single shipping dimension preset by ID
   */
  async getShippingDimensionPresetById(
    id: number
  ): Promise<ShippingDimensionPresetResponse> {
    try {
      return await apiClient.get<ShippingDimensionPresetResponse>(
        `${this.baseUrl}/${id}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch shipping dimension preset with id ${id}`
      );
    }
  }

  /**
   * Create a new shipping dimension preset
   */
  async createShippingDimensionPreset(
    data: CreateShippingDimensionPresetRequest
  ): Promise<ShippingDimensionPresetResponse> {
    try {
      return await apiClient.post<ShippingDimensionPresetResponse>(
        this.baseUrl,
        data
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to create shipping dimension preset"
      );
    }
  }

  /**
   * Update an existing shipping dimension preset
   */
  async updateShippingDimensionPreset(
    id: number,
    data: UpdateShippingDimensionPresetRequest
  ): Promise<ShippingDimensionPresetResponse> {
    try {
      return await apiClient.put<ShippingDimensionPresetResponse>(
        `${this.baseUrl}/${id}`,
        data
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update shipping dimension preset"
      );
    }
  }

  /**
   * Delete a shipping dimension preset
   */
  async deleteShippingDimensionPreset(
    id: number
  ): Promise<{ message: string }> {
    try {
      return await apiClient.delete<{ message: string }>(
        `${this.baseUrl}/${id}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to delete shipping dimension preset"
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
          "Failed to ping shipping dimension presets service"
      );
    }
  }
}

export const shippingDimensionPresetsService =
  new ShippingDimensionPresetsService();
