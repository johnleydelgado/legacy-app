// services/vendors/index.ts
import { apiClient } from "@/lib/axios";
import {
  CreateVendorDto,
  Vendor,
  VendorsQueryParams,
  VendorsResponse,
  UpdateVendorDto,
  VendorKpisOverview,
  VendorSearchParams,
  VendorSearchResponse,
  VendorIndividualKpis,
  VendorProductCategoriesResponse,
  VendorProductCategoriesParams
} from "./types";

class VendorsService {
  private baseUrl = "/api/v1/vendors";

  /**
   * Get a paginated list of vendors
   */
  async getVendors(params?: VendorsQueryParams): Promise<VendorsResponse> {
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
      return await apiClient.get<VendorsResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendors"
      );
    }
  }

  /**
   * Get vendor by ID
   */
  async getVendorById(id: number): Promise<Vendor> {
    try {
      return await apiClient.get<Vendor>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendor"
      );
    }
  }

  /**
   * Create a new vendor
   */
  async createVendor(vendorData: CreateVendorDto): Promise<Vendor> {
    try {
      return await apiClient.post<Vendor>(this.baseUrl, vendorData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create vendor"
      );
    }
  }

  /**
   * Update an existing vendor
   */
  async updateVendor(id: number, vendorData: UpdateVendorDto): Promise<Vendor> {
    try {
      return await apiClient.put<Vendor>(`${this.baseUrl}/${id}`, vendorData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update vendor"
      );
    }
  }

  /**
   * Delete a vendor
   */
  async deleteVendor(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete vendor"
      );
    }
  }

  /**
   * Get vendors KPIs overview
   */
  async getVendorKpisOverview(): Promise<VendorKpisOverview> {
    try {
      return await apiClient.get<VendorKpisOverview>(`${this.baseUrl}/kpis/overview`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendor KPIs overview"
      );
    }
  }

  /**
   * Get individual vendor KPIs
   */
  async getVendorIndividualKpis(vendorId: number): Promise<VendorIndividualKpis> {
    try {
      return await apiClient.get<VendorIndividualKpis>(`${this.baseUrl}/kpis/individual/${vendorId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendor individual KPIs"
      );
    }
  }

  /**
   * Search vendors
   */
  async searchVendors(params: VendorSearchParams): Promise<VendorSearchResponse> {
    const searchParams = new URLSearchParams();
    
    // Add search query
    searchParams.append('q', params.q);
    
    // Add optional pagination parameters
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const url = `${this.baseUrl}/search?${searchParams.toString()}`;

    try {
      return await apiClient.get<VendorSearchResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to search vendors"
      );
    }
  }

  /**
   * Get vendor product categories with pagination
   */
  async getVendorProductCategories(
    vendorId: number, 
    params?: VendorProductCategoriesParams
  ): Promise<VendorProductCategoriesResponse> {
    const searchParams = new URLSearchParams();
  
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
  
    const url = `${this.baseUrl}/${vendorId}/products-categories${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
  
    try {
      return await apiClient.get<VendorProductCategoriesResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch vendor product categories"
      );
    }
  }  
}

export const vendorsService = new VendorsService();
