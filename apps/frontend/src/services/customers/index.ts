// services/customers/index.tsx
import { apiClient } from "@/lib/axios";
import {
  CreateCustomerDto,
  Customer,
  CustomersQueryParams,
  CustomersResponse,
  UpdateCustomerDto,
  Contact,
  Address,
  BulkOperation,
  CustomerExportParams,
  CustomersV2Response,
  CustomersWithContactsResponse,
  CustomerList,
  CustomerKpi,
  UnifiedSearchParams, UnifiedSearchResponse,
} from "./types";

import {
  Customer as CustomerV2,
} from "@/services/quotes/types";

class CustomersService {
  private baseUrl = "/api/v1/customers";

  /**
   * Get a paginated list of customers
   */
  async getCustomers(params?: CustomersQueryParams): Promise<CustomersResponse> {
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
      return await apiClient.get<CustomersResponse>(url);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to fetch customers"
      );
    }
  }

  async getCustomersV2(params?: CustomersQueryParams): Promise<CustomersV2Response> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    try {
      return await apiClient.get<CustomersV2Response>(url);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customers');
    }
  }

  // Get customers with contacts and addresses included
  async getCustomersWithContacts(params?: {
    page?: number;
    limit?: number;
  }): Promise<CustomersWithContactsResponse> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/with-contacts${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    try {
      return await apiClient.get<CustomersWithContactsResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch customers with contacts"
      );
    }
  }

  async getCustomerByIdV2(id: number): Promise<CustomerV2> {
    try {
      return await apiClient.get<CustomerV2>(`${this.baseUrl}/get-v2/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customer');
    }
  }

  async convertLead(id: number, customerType: 'PROSPECT' | 'CUSTOMER'): Promise<Customer> {
    return this.updateCustomer(id, {
      customerType,
      convertedAt: new Date().toISOString()
    });
  }

  async addCustomerTags(id: number, newTags: string): Promise<Customer> {
    const customer = await this.getCustomerById(id);
    const existingTags = customer.tags ? customer.tags.split(',').map(tag => tag.trim()) : [];
    const tagsToAdd = newTags.split(',').map(tag => tag.trim());
    const allTags = [...new Set([...existingTags, ...tagsToAdd])];
    return this.updateCustomer(id, { tags: allTags.join(', ') });
  }

  async removeCustomerTags(id: number, tagsToRemove: string): Promise<Customer> {
    const customer = await this.getCustomerById(id);
    const existingTags = customer.tags ? customer.tags.split(',').map(tag => tag.trim()) : [];
    const removeTagsList = tagsToRemove.split(',').map(tag => tag.trim());
    const remainingTags = existingTags.filter(tag => !removeTagsList.includes(tag));
    return this.updateCustomer(id, { tags: remainingTags.join(', ') || undefined });
  }

  async searchCustomersV2(query: string, limit: number = 10): Promise<CustomerList[]> {
    const response = await this.getCustomers({
      search: query,
      limit
    });

    return response.items;
  }

  // Optimized endpoint for getting all customers with contacts and addresses
  async getAllCustomersWithContactsOptimized(): Promise<Customer[]> {
    try {
      return await apiClient.get<Customer[]>(
        `${this.baseUrl}/all-with-contacts-optimized`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch customers with optimized query"
      );
    }
  }

  // Advanced search with contacts and addresses included
  async searchCustomersWithDetails(
    searchTerm: string,
    params?: { page?: number; limit?: number }
  ): Promise<CustomersResponse> {
    const searchParams = new URLSearchParams();

    searchParams.append("q", encodeURIComponent(searchTerm));

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/search?${searchParams.toString()}`;

    try {
      return await apiClient.get<CustomersResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to search customers"
      );
    }
  }

  async getCustomerById(id: number): Promise<Customer> {
    try {
      return await apiClient.get<Customer>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch customer"
      );
    }
  }

  // Get customer by ID with contacts and addresses for editing
  async getCustomerByIdWithDetails(
    id: number
  ): Promise<Customer & { contacts: Contact[]; addresses: Address[] }> {
    try {
      return await apiClient.get<
        Customer & { contacts: Contact[]; addresses: Address[] }
      >(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch customer with [id]"
      );
    }
  }

  async createCustomer(customerData: CreateCustomerDto): Promise<Customer> {
    try {
      return await apiClient.post<Customer>(this.baseUrl, customerData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create customer"
      );
    }
  }

  async updateCustomer(
    id: number,
    customerData: UpdateCustomerDto
  ): Promise<Customer> {
    try {
      return await apiClient.put<Customer>(
        `/api/v1/customers/${id}`,
        customerData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update customer"
      );
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete customer"
      );
    }
  }

  async updateCustomerNotes(id: number, notes: string): Promise<Customer> {
    return this.updateCustomer(id, { notes });
  }

  async bulkOperation(operation: BulkOperation): Promise<void> {
    try {
      await apiClient.post<void>(`${this.baseUrl}/bulk`, operation);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to perform bulk operation"
      );
    }
  }

  async exportCustomers(params: CustomerExportParams): Promise<Blob> {
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
        error.response?.data?.message || "Failed to export customers"
      );
    }
  }

  async getCustomersByType(
    customer_type: "LEAD" | "PROSPECT" | "CUSTOMER",
    params?: Omit<CustomersQueryParams, "customer_type">
  ): Promise<CustomersResponse> {
    return this.getCustomers({ ...params, customer_type });
  }

  async findDuplicateCustomers(
    email?: string,
    name?: string
  ): Promise<Customer[]> {
    try {
      const searchParams = new URLSearchParams();
      if (email) searchParams.append("email", email);
      if (name) searchParams.append("name", name);

      return await apiClient.get<Customer[]>(
        `${this.baseUrl}/duplicates?${searchParams.toString()}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to find duplicate customers"
      );
    }
  }

  // Utility method for basic search (using the regular endpoint with search params)
  async searchCustomers(
    searchTerm: string,
    params?: CustomersQueryParams
  ): Promise<CustomersResponse> {
    const searchParams = { ...params, search: searchTerm };
    return this.getCustomers(searchParams);
  }

  // Get customer statistics/counts by type and status
  async getCustomerStats(): Promise<{
    totalCustomers: number;
    totalLeads: number;
    totalProspects: number;
    activeCustomers: number;
    inactiveCustomers: number;
  }> {
    try {
      // Make parallel requests to get counts for different types and statuses
      const [allCustomers, leads, prospects, active, inactive] =
        await Promise.all([
          this.getCustomers({ limit: 1 }), // Just get meta info
          this.getCustomers({ customer_type: "CUSTOMER", limit: 1 }),
          this.getCustomers({ customer_type: "LEAD", limit: 1 }),
          this.getCustomers({ status: "ACTIVE", limit: 1 }),
          this.getCustomers({ status: "INACTIVE", limit: 1 }),
        ]);

      return {
        totalCustomers: allCustomers.meta.totalItems,
        totalLeads: leads.meta.totalItems,
        totalProspects: prospects.meta.totalItems,
        activeCustomers: active.meta.totalItems,
        inactiveCustomers: inactive.meta.totalItems,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch customer statistics"
      );
    }
  }

  async getCustomerKpi(): Promise<CustomerKpi> {
    try {
      return await apiClient.get<CustomerKpi>(`${this.baseUrl}/kpi`);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to fetch customer KPIs"
      );
    }
  }

  /**
   * Perform a unified search across customers
   * @param params Search parameters including query (q), page, and limit
   * @returns Search results with pagination metadata
   */
  async search(params: UnifiedSearchParams): Promise<UnifiedSearchResponse> {
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

    const url = `${this.baseUrl}/unified-search?${searchParams.toString()}`;

    try {
      return await apiClient.get<UnifiedSearchResponse>(url);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to perform unified search"
      );
    }
  }
}

export const customersService = new CustomersService();
