// services/customer-files/index.ts
import { apiClient } from "@/lib/axios";
import {
  CustomerFile,
  CustomerFilesResponse,
  CreateCustomerFileDto,
  UpdateCustomerFileDto,
  CustomerFilesQueryParams,
  GetCustomerFilesParams,
} from "./types";

export class CustomerFilesService {
  private baseUrl = "/api/v1/customer-files";

  async getCustomerFiles(
    params?: CustomerFilesQueryParams
  ): Promise<CustomerFilesResponse> {
    if (params?.search) {
      const searchPage = params.page || 1;
      return this.searchCustomerFiles(params.search, searchPage, params.limit);
    }

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
      const response = await apiClient.get<CustomerFilesResponse>(url);
      return response;
    } catch (error: any) {
      console.error("Error in getCustomerFiles:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch customer files"
      );
    }
  }

  // Get all customer files with pagination and filters
  async getCustomerFilesV2(
    params: GetCustomerFilesParams = {}
  ): Promise<CustomerFilesResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.customerId)
      searchParams.append("customerId", params.customerId.toString());
    if (params.mimeType) searchParams.append("mimeType", params.mimeType);
    if (params.showArchived !== undefined)
      searchParams.append("showArchived", params.showArchived.toString());
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const url = `${this.baseUrl}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    return await apiClient.get<CustomerFilesResponse>(url);
  }

  // Get customer files by customer ID
  async getCustomerFilesByCustomerId(
    customerId: number,
    params?: CustomerFilesQueryParams
  ): Promise<CustomerFilesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("id", customerId.toString());

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "customer_id") {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/customer?${searchParams.toString()}`;

    try {
      return await apiClient.get<CustomerFilesResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch customer files"
      );
    }
  }

  // Get customer files by MIME type
  async getCustomerFilesByMimeType(
    mimeType: string,
    params?: CustomerFilesQueryParams
  ): Promise<CustomerFilesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("type", mimeType);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "mime_type") {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/mime-type?${searchParams.toString()}`;

    try {
      return await apiClient.get<CustomerFilesResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch customer files by MIME type"
      );
    }
  }

  // Search customer files by name
  private async searchCustomerFiles(
    name: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CustomerFilesResponse> {
    const searchParams = new URLSearchParams({
      name,
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${this.baseUrl}/search?${searchParams.toString()}`;

    try {
      const response = await apiClient.get<CustomerFilesResponse>(url);
      return response;
    } catch (error: any) {
      console.error("Error in searchCustomerFiles:", error);
      throw new Error(
        error.response?.data?.message || "Failed to search customer files"
      );
    }
  }

  // Search customer files - V2 version
  async searchCustomerFilesV2(
    query: string,
    params: Omit<GetCustomerFilesParams, "search"> = {}
  ): Promise<CustomerFilesResponse> {
    return this.getCustomerFilesV2({ ...params, search: query });
  }

  // Get a single customer file by ID
  async getCustomerFileById(id: number): Promise<CustomerFile> {
    const url = `${this.baseUrl}/${id}`;
    try {
      const response = await apiClient.get<CustomerFile>(url);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch customer file"
      );
    }
  }

  // Create a new customer file
  async createCustomerFile(
    customerFileData: CreateCustomerFileDto
  ): Promise<CustomerFile> {
    try {
      const response = await apiClient.post<CustomerFile>(
        this.baseUrl,
        customerFileData
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create customer file"
      );
    }
  }

  // Update a customer file
  async updateCustomerFile(
    id: number,
    customerFileData: UpdateCustomerFileDto
  ): Promise<CustomerFile> {
    const url = `${this.baseUrl}/${id}`;
    try {
      const response = await apiClient.put<CustomerFile>(url, customerFileData);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update customer file"
      );
    }
  }

  // Delete a customer file (hard delete)
  async deleteCustomerFile(id: number): Promise<void> {
    const url = `${this.baseUrl}/${id}`;
    try {
      await apiClient.delete<void>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete customer file"
      );
    }
  }

  // Soft delete a customer file
  async softDeleteCustomerFile(id: number): Promise<CustomerFile> {
    const url = `${this.baseUrl}/${id}/soft`;
    try {
      const response = await apiClient.delete<CustomerFile>(url);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to soft delete customer file"
      );
    }
  }

  // Permanently delete a soft-deleted customer file
  async permanentDeleteCustomerFile(id: number): Promise<void> {
    const url = `${this.baseUrl}/${id}/permanent`;
    try {
      await apiClient.delete<void>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to permanently delete customer file"
      );
    }
  }

  // Ping service health
  async ping(): Promise<{ message: string }> {
    const url = `${this.baseUrl}/ping`;
    try {
      const response = await apiClient.get<{ data: { message: string } }>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to ping customer files service"
      );
    }
  }
}

export const customerFilesService = new CustomerFilesService();
