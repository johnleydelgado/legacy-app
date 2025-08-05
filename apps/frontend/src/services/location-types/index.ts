// services/location-types/index.ts
import { apiClient } from "@/lib/axios";
import {
  CreateLocationTypeDto,
  LocationType,
  LocationTypesQueryParams,
  LocationTypesResponse,
  UpdateLocationTypeDto,
  BulkLocationTypeOperation,
  LocationTypeExportParams,
} from "./types";

class LocationTypesService {
  private baseUrl = "/api/v1/location-types";

  /**
   * Get a paginated list of location types
   */
  async getLocationTypes(params?: LocationTypesQueryParams): Promise<LocationTypesResponse> {
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
      return await apiClient.get<LocationTypesResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch location types"
      );
    }
  }

  /**
   * Get all location types without pagination
   */
  async getAllLocationTypes(): Promise<LocationType[]> {
    try {
      const response = await this.getLocationTypes({ limit: 1000 }); // Get all with high limit
      return response.items;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch all location types"
      );
    }
  }

  /**
   * Get a single location type by ID
   */
  async getLocationTypeById(id: number): Promise<LocationType> {
    try {
      return await apiClient.get<LocationType>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch location type"
      );
    }
  }

  /**
   * Create a new location type
   */
  async createLocationType(locationTypeData: CreateLocationTypeDto): Promise<LocationType> {
    try {
      return await apiClient.post<LocationType>(this.baseUrl, locationTypeData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create location type"
      );
    }
  }

  /**
   * Update an existing location type
   */
  async updateLocationType(
    id: number,
    locationTypeData: UpdateLocationTypeDto
  ): Promise<LocationType> {
    try {
      return await apiClient.put<LocationType>(
        `${this.baseUrl}/${id}`,
        locationTypeData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update location type"
      );
    }
  }

  /**
   * Delete a location type
   */
  async deleteLocationType(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete location type"
      );
    }
  }

  /**
   * Search location types
   */
  async searchLocationTypes(
    searchTerm: string,
    params?: LocationTypesQueryParams
  ): Promise<LocationTypesResponse> {
    const searchParams = { ...params, search: searchTerm };
    return this.getLocationTypes(searchParams);
  }

  /**
   * Perform bulk operations on location types
   */
  async bulkOperation(operation: BulkLocationTypeOperation): Promise<void> {
    try {
      await apiClient.post<void>(`${this.baseUrl}/bulk`, operation);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to perform bulk operation"
      );
    }
  }

  /**
   * Export location types
   */
  async exportLocationTypes(params: LocationTypeExportParams): Promise<Blob> {
    try {
      const response = await apiClient.post<Blob>(
        `${this.baseUrl}/export`,
        params,
        {
          responseType: "blob",
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to export location types"
      );
    }
  }

  /**
   * Get location types statistics
   */
  async getLocationTypeStats(): Promise<{
    totalLocationTypes: number;
    recentlyCreated: number;
    recentlyUpdated: number;
  }> {
    try {
      const response = await this.getLocationTypes({ limit: 1 }); // Just get meta info
      
      return {
        totalLocationTypes: response.meta.totalItems,
        recentlyCreated: 0, // This would need to be implemented on the backend
        recentlyUpdated: 0, // This would need to be implemented on the backend
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch location type statistics"
      );
    }
  }
}

export const locationTypesService = new LocationTypesService(); 