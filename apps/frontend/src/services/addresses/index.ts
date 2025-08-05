// services/addresses/index.tsx
import { apiClient } from "@/lib/axios";
import {
    Address,
    AddressesResponse,
    CustomerAddressesResponse,
    GetAddressesParams,
    GetCustomerAddressesParams,
    CreateAddressDto,
    UpdateAddressDto,
    DeleteAddressResponse,
    GetAddressByForeignKeyParams,
} from "@/services/addresses/types";
import {GetAddressesByTypeParams} from "./types";

export class AddressService {
    private readonly endpoint = "/api/v1/addresses";

    /**
     * Get all addresses with pagination
     */
    async getAddresses(params: GetAddressesParams = {}): Promise<AddressesResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = `${this.endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        return apiClient.get<AddressesResponse>(url);
    }

    /**
     * Get address by ID
     */
    async getAddressById(id: number): Promise<Address> {
        return apiClient.get<Address>(`${this.endpoint}/${id}`);
    }

    /**
     * Get customer addresses by customer ID and optional type
     */
    async getCustomerAddresses(params: GetCustomerAddressesParams): Promise<CustomerAddressesResponse> {
        const queryParams = new URLSearchParams();
        queryParams.append('id', params.id.toString());

        if (params.type) {
            queryParams.append('type', params.type);
        }

        const url = `${this.endpoint}/customers?${queryParams.toString()}`;
        return apiClient.get<CustomerAddressesResponse>(url);
    }

    /**
     * Create new address
     */
    async createAddress(data: CreateAddressDto): Promise<Address> {
        return apiClient.post<Address>(this.endpoint, data);
    }

    /**
     * Update address by ID
     */
    async updateAddress(id: number, data: UpdateAddressDto): Promise<Address> {
        return apiClient.put<Address>(`${this.endpoint}/${id}`, data);
    }

    /**
     * Delete address by ID
     */
    async deleteAddress(id: number): Promise<DeleteAddressResponse> {
        return apiClient.delete<DeleteAddressResponse>(`${this.endpoint}/${id}`);
    }

    /**
     * Get addresses by type with pagination
     */
    async getAddressesByType(params: GetAddressesByTypeParams): Promise<AddressesResponse> {
        const queryParams = new URLSearchParams();
        queryParams.append('type', params.type);

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = `${this.endpoint}/type?${queryParams.toString()}`;

        return apiClient.get<AddressesResponse>(url);
    }

    /**
     * Get address by foreign key ID, table, and address type
     */
    async getAddressByForeignKey(params: GetAddressByForeignKeyParams): Promise<Address> {
        const { fk_id, table, address_type } = params;
        return apiClient.get<Address>(`${this.endpoint}/${fk_id}/${table}/${address_type}`);
    }
}

export const addressService = new AddressService();
