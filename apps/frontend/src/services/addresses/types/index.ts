export interface Address {
    pk_address_id: number;
    fk_id: number;
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
    address_type: 'BILLING' | 'SHIPPING';
    table: string;
}

export interface AddressesResponse {
    items: Address[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

export interface CustomerAddressesResponse {
    items: Address[];
    totalItems: number;
}

export interface CreateAddressDto {
    fk_id: number;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    address_type: 'BILLING' | 'SHIPPING';
    table: string;
}

export interface UpdateAddressDto {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    address_type?: 'BILLING' | 'SHIPPING';
}

export interface GetAddressesParams {
    page?: number;
    limit?: number;
}

export interface GetCustomerAddressesParams {
    id: number;
    type?: 'BILLING' | 'SHIPPING';
}

export interface DeleteAddressResponse {
    message: string;
    success: boolean;
}

export interface GetAddressesByTypeParams {
    type: 'BILLING' | 'SHIPPING';
    page?: number;
    limit?: number;
}

export interface GetAddressByForeignKeyParams {
    fk_id: number;
    table: string;
    address_type: 'BILLING' | 'SHIPPING';
}

export enum AddressTypeEnums {
    BILLING = 'BILLING',
    SHIPPING = 'SHIPPING'
}
