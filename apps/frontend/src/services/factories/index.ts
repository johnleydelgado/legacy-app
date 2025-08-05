// services/factories/index.ts
import { apiClient } from "@/lib/axios";
import {
  Factory,
  FactoryDetail,
  FactoriesResponse,
  FactoriesSearchResponse,
  FactoryKpiSummary,
  FactoriesQueryParams,
  FactoriesSearchParams,
  CreateFactoryDto,
  UpdateFactoryDto,
} from "./types";

class FactoriesService {
  private baseUrl = "/api/v1/factories";

  // Helper method to convert tags array to JSON string for API
  private serializeTags(tags?: string[]): string {
    return tags ? JSON.stringify(tags) : '[]';
  }

  // Helper method to parse tags from API response
  private parseTags(tags: any): string[] {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Get a paginated list of factories
   */
  async getFactories(params?: FactoriesQueryParams): Promise<FactoriesResponse> {
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
      return await apiClient.get<FactoriesResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch factories"
      );
    }
  }

  /**
   * Get a single factory by ID
   */
  async getFactoryById(id: number): Promise<FactoryDetail> {
    try {
      return await apiClient.get<FactoryDetail>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Factory with ID ${id} not found`);
      }
      throw new Error(
        error.response?.data?.message || "Failed to fetch factory"
      );
    }
  }

  /**
   * Search factories with query string
   */
  async searchFactories(params: FactoriesSearchParams): Promise<FactoriesSearchResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}/search?${searchParams.toString()}`;

    try {
      return await apiClient.get<FactoriesSearchResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to search factories"
      );
    }
  }

  /**
   * Get factory KPI data
   */
  async getFactoryKpi(): Promise<FactoryKpiSummary> {
    try {
      return await apiClient.get<FactoryKpiSummary>(`${this.baseUrl}/kpi`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch factory KPI data"
      );
    }
  }

  /**
   * Create a new factory
   */
  async createFactory(data: CreateFactoryDto): Promise<FactoryDetail> {
    try {
      const payload = {
        ...data,
        tags: this.serializeTags(data.tags)
      };
      const response = await apiClient.post<FactoryDetail>(this.baseUrl, payload);
      // Parse tags in response
      return {
        ...response,
        tags: this.parseTags(response.tags)
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create factory"
      );
    }
  }

  /**
   * Update an existing factory
   */
  async updateFactory(id: number, data: UpdateFactoryDto): Promise<FactoryDetail> {
    try {
      const payload = {
        ...data,
        ...(data.tags && { tags: this.serializeTags(data.tags) })
      };
      const response = await apiClient.put<FactoryDetail>(`${this.baseUrl}/${id}`, payload);
      // Parse tags in response
      return {
        ...response,
        tags: this.parseTags(response.tags)
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Factory with ID ${id} not found`);
      }
      throw new Error(
        error.response?.data?.message || "Failed to update factory"
      );
    }
  }

  /**
   * Delete a factory
   */
  async deleteFactory(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Factory with ID ${id} not found`);
      }
      throw new Error(
        error.response?.data?.message || "Failed to delete factory"
      );
    }
  }

  /**
   * Bulk delete factories
   */
  async bulkDeleteFactories(ids: number[]): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/bulk-delete`, { ids });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to bulk delete factories"
      );
    }
  }

  /**
   * Export factories data
   */
  async exportFactories(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    params?: FactoriesQueryParams
  ): Promise<Blob> {
    const searchParams = new URLSearchParams();
    searchParams.append('format', format);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    try {
      return await apiClient.get<Blob>(
        `${this.baseUrl}/export?${searchParams.toString()}`,
        { 
          responseType: 'blob' as any
        }
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to export factories"
      );
    }
  }
}

export const factoriesService = new FactoriesService();
export { FactoriesService }; 