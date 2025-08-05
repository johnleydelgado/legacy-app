// services/organizations/index.ts
import { apiClient } from "@/lib/axios";
import {
  CreateOrganizationDto,
  Organization,
  OrganizationsQueryParams,
  OrganizationsResponse,
  UpdateOrganizationDto,
  OrganizationStats,
  BulkOrganizationOperation,
  OrganizationExportParams,
  OrganizationSearchParams,
  OrganizationSearchResponse,
} from "./types";

class OrganizationsService {
  private baseUrl = "/api/v1/organizations";

  /**
   * Get a paginated list of organizations
   */
  async getOrganizations(params?: OrganizationsQueryParams): Promise<OrganizationsResponse> {
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
      return await apiClient.get<OrganizationsResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch organizations"
      );
    }
  }

  /**
   * Get a single organization by ID
   */
  async getOrganizationById(id: number): Promise<Organization> {
    try {
      return await apiClient.get<Organization>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch organization"
      );
    }
  }

  /**
   * Create a new organization
   */
  async createOrganization(organizationData: CreateOrganizationDto): Promise<Organization> {
    try {
      return await apiClient.post<Organization>(this.baseUrl, organizationData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create organization"
      );
    }
  }

  /**
   * Update an existing organization
   */
  async updateOrganization(
    id: number,
    organizationData: UpdateOrganizationDto
  ): Promise<Organization> {
    try {
      return await apiClient.put<Organization>(
        `${this.baseUrl}/${id}`,
        organizationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update organization"
      );
    }
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete organization"
      );
    }
  }

  /**
   * Search organizations with a query term
   */
  async searchOrganizations(
    searchTerm: string,
    params?: OrganizationsQueryParams
  ): Promise<OrganizationsResponse> {
    const searchParams = { ...params, search: searchTerm };
    return this.getOrganizations(searchParams);
  }

  /**
   * Advanced search with highlighting
   */
  async search(params: OrganizationSearchParams): Promise<OrganizationSearchResponse> {
    const searchParams = new URLSearchParams();

    if (params.q) {
      searchParams.append("q", encodeURIComponent(params.q));
    }

    if (params.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }

    if (params.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }

    // Include any additional filters if provided
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/search?${searchParams.toString()}`;

    try {
      return await apiClient.get<OrganizationSearchResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to perform organization search"
      );
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(): Promise<OrganizationStats> {
    try {
      return await apiClient.get<OrganizationStats>(`${this.baseUrl}/stats`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch organization statistics"
      );
    }
  }

  /**
   * Update organization notes
   */
  async updateOrganizationNotes(id: number, notes: string): Promise<Organization> {
    return this.updateOrganization(id, { notes });
  }

  /**
   * Add tags to an organization
   */
  async addOrganizationTags(id: number, newTags: string): Promise<Organization> {
    const organization = await this.getOrganizationById(id);
    const existingTags = organization.tags ? organization.tags.split(',').map(tag => tag.trim()) : [];
    const tagsToAdd = newTags.split(',').map(tag => tag.trim());
    const allTags = [...new Set([...existingTags, ...tagsToAdd])];
    return this.updateOrganization(id, { tags: allTags.join(', ') });
  }

  /**
   * Remove tags from an organization
   */
  async removeOrganizationTags(id: number, tagsToRemove: string): Promise<Organization> {
    const organization = await this.getOrganizationById(id);
    const existingTags = organization.tags ? organization.tags.split(',').map(tag => tag.trim()) : [];
    const removeTagsList = tagsToRemove.split(',').map(tag => tag.trim());
    const remainingTags = existingTags.filter(tag => !removeTagsList.includes(tag));
    return this.updateOrganization(id, { tags: remainingTags.join(', ') || undefined });
  }

  /**
   * Perform bulk operations on organizations
   */
  async bulkOperation(operation: BulkOrganizationOperation): Promise<void> {
    try {
      await apiClient.post<void>(`${this.baseUrl}/bulk`, operation);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to perform bulk operation"
      );
    }
  }

  /**
   * Export organizations data
   */
  async exportOrganizations(params: OrganizationExportParams): Promise<Blob> {
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
        error.response?.data?.message || "Failed to export organizations"
      );
    }
  }

  /**
   * Get organizations by industry
   */
  async getOrganizationsByIndustry(
    industry: string,
    params?: Omit<OrganizationsQueryParams, "industry">
  ): Promise<OrganizationsResponse> {
    return this.getOrganizations({ ...params, industry });
  }

  /**
   * Get organizations by country
   */
  async getOrganizationsByCountry(
    country: string,
    params?: Omit<OrganizationsQueryParams, "country">
  ): Promise<OrganizationsResponse> {
    return this.getOrganizations({ ...params, country });
  }

  /**
   * Find duplicate organizations by name or email
   */
  async findDuplicateOrganizations(
    email?: string,
    name?: string
  ): Promise<Organization[]> {
    try {
      const searchParams = new URLSearchParams();
      if (email) searchParams.append("email", email);
      if (name) searchParams.append("name", name);

      return await apiClient.get<Organization[]>(
        `${this.baseUrl}/duplicates?${searchParams.toString()}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to find duplicate organizations"
      );
    }
  }

  /**
   * Get all organizations (without pagination)
   */
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      return await apiClient.get<Organization[]>(`${this.baseUrl}/all`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch all organizations"
      );
    }
  }
}

export const organizationsService = new OrganizationsService(); 
