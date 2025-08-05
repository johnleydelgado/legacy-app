// services/vendor-service-category/index.ts
import { apiClient } from "@/lib/axios";
import {
  VendorServiceCategory,
  VendorServiceCategoriesResponse,
  VendorServiceCategoryQueryParams
} from "./types";

class VendorServiceCategoryService {
  private baseUrl = "/api/v1/vendors-service-category";

  /**
   * Get a paginated list of vendor service categories
   */
  async getVendorServiceCategories(
    params?: VendorServiceCategoryQueryParams
  ): Promise<VendorServiceCategoriesResponse> {
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
      return await apiClient.get<VendorServiceCategoriesResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendor service categories"
      );
    }
  }

  /**
   * Get vendor service category by ID
   */
  async getVendorServiceCategoryById(id: number): Promise<VendorServiceCategory> {
    try {
      return await apiClient.get<VendorServiceCategory>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendor service category"
      );
    }
  }
}

export const vendorServiceCategoryService = new VendorServiceCategoryService();
