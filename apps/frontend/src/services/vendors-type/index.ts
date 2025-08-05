// services/vendor-type/index.ts
import { apiClient } from "@/lib/axios";
import {
  VendorType,
  VendorTypesResponse,
  VendorTypeQueryParams,
} from "./types";

class VendorTypeService {
  private baseUrl = "/api/v1/vendors-type";

  /**
   * Get a paginated list of vendor types
   */
  async getVendorTypes(
    params?: VendorTypeQueryParams
  ): Promise<VendorTypesResponse> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    try {
      return await apiClient.get<VendorTypesResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendor types"
      );
    }
  }

  /**
   * Get vendor type by ID
   */
  async getVendorTypeById(id: number): Promise<VendorType> {
    try {
      return await apiClient.get<VendorType>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendor type"
      );
    }
  }
}

export const vendorTypeService = new VendorTypeService();
