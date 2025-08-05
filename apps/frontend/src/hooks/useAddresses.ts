// hooks/useAddresses.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Address,
    AddressesResponse, CreateAddressDto,
    CustomerAddressesResponse,
    GetAddressByForeignKeyParams,
    GetAddressesParams,
    GetCustomerAddressesParams, UpdateAddressDto
} from "@/services/addresses/types";
import {addressService} from "@/services/addresses";
import {GetAddressesByTypeParams} from "../services/addresses/types";

// Hook for fetching all addresses with pagination
export const useAddresses = (params: GetAddressesParams = {}) => {
    const [data, setData] = useState<AddressesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await addressService.getAddresses(params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    }, [params.page, params.limit]);

    useEffect(() => {
        fetchAddresses().then();
    }, [fetchAddresses]);

    const refetch = useCallback(() => {
        fetchAddresses().then();
    }, [fetchAddresses]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

// Hook for fetching a single address by ID
export const useAddress = (id: number | null) => {
    const [data, setData] = useState<Address | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddress = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await addressService.getAddressById(id);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch address');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAddress().then();
    }, [fetchAddress]);

    const refetch = useCallback(() => {
        fetchAddress().then();
    }, [fetchAddress]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

// Hook for fetching customer addresses
export const useCustomerAddresses = (params: GetCustomerAddressesParams) => {
    const [data, setData] = useState<CustomerAddressesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomerAddresses = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await addressService.getCustomerAddresses(params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch customer addresses');
        } finally {
            setLoading(false);
        }
    }, [params.id, params.type]);

    useEffect(() => {
        fetchCustomerAddresses().then();
    }, [fetchCustomerAddresses]);

    const refetch = useCallback(() => {
        fetchCustomerAddresses().then();
    }, [fetchCustomerAddresses]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

// Hook for address mutations (create, update, delete)
export const useAddressMutations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createAddress = useCallback(async (data: CreateAddressDto): Promise<Address | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await addressService.createAddress(data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create address');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAddress = useCallback(async ({id, data}: {id: number, data: UpdateAddressDto}): Promise<Address | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await addressService.updateAddress(id, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update address');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAddress = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await addressService.deleteAddress(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete address');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createAddress,
        updateAddress,
        deleteAddress,
        loading,
        error,
    };
};

// Specialized hook for customer billing and shipping addresses
export const useCustomerBillingShipping = (customerId: number) => {
    const [billingAddress, setBillingAddress] = useState<Address | null>(null);
    const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        if (!customerId) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch billing address
            const billingResponse = await addressService.getCustomerAddresses({
                id: customerId,
                type: 'BILLING'
            });

            // Fetch shipping addresses
            const shippingResponse = await addressService.getCustomerAddresses({
                id: customerId,
                type: 'SHIPPING'
            });

            setBillingAddress(billingResponse.items[0] || null);
            setShippingAddresses(shippingResponse.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch customer addresses');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchAddresses().then();
    }, [fetchAddresses]);

    const refetch = useCallback(() => {
        fetchAddresses().then();
    }, [fetchAddresses]);

    return {
        billingAddress,
        shippingAddresses,
        loading,
        error,
        refetch,
    };
};

// Hook for optimistic updates and caching
export const useAddressCache = () => {
    const [cache, setCache] = useState<Map<number, Address>>(new Map());

    const addToCache = useCallback((address: Address) => {
        setCache(prev => new Map(prev).set(address.pk_address_id, address));
    }, []);

    const removeFromCache = useCallback((id: number) => {
        setCache(prev => {
            const newCache = new Map(prev);
            newCache.delete(id);
            return newCache;
        });
    }, []);

    const updateCache = useCallback((id: number, updates: Partial<Address>) => {
        setCache(prev => {
            const newCache = new Map(prev);
            const existing = newCache.get(id);
            if (existing) {
                newCache.set(id, { ...existing, ...updates });
            }
            return newCache;
        });
    }, []);

    const getFromCache = useCallback((id: number): Address | undefined => {
        return cache.get(id);
    }, [cache]);

    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    return {
        cache,
        addToCache,
        removeFromCache,
        updateCache,
        getFromCache,
        clearCache,
    };
};

// Hook for fetching addresses by type with pagination
export const useAddressesByType = (params: GetAddressesByTypeParams) => {
    const [data, setData] = useState<AddressesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddressesByType = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await addressService.getAddressesByType(params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch addresses by type');
        } finally {
            setLoading(false);
        }
    }, [params.type, params.page, params.limit]);

    useEffect(() => {
        fetchAddressesByType().then();
    }, [fetchAddressesByType]);

    const refetch = useCallback(() => {
        fetchAddressesByType().then();
    }, [fetchAddressesByType]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

interface UseInfiniteShippingAddressesReturn {
    data: Address[];
    loading: boolean;
    error: string | null;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => Promise<void>;
    refetch: () => Promise<void>;
    totalCount: number;
    currentPage: number;
}

export const useInfiniteShippingAddresses = (customerId: number): UseInfiniteShippingAddressesReturn => {
    const [displayedAddresses, setDisplayedAddresses] = useState<Address[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const limit = 10; // Fixed limit for shipping addresses

    // Use useCustomerAddresses hook to fetch shipping addresses
    const {
        data: customerAddressesResponse,
        loading,
        error,
        refetch
    } = useCustomerAddresses({
        id: customerId,
        type: 'SHIPPING'
    });

    // Update displayed addresses when data changes or page changes
    useEffect(() => {
        if (customerAddressesResponse?.items) {
            const endIndex = currentPage * limit;
            const addressesToShow = customerAddressesResponse.items.slice(0, endIndex);
            setDisplayedAddresses(addressesToShow);
            setIsFetchingNextPage(false);
        }
    }, [customerAddressesResponse, currentPage, limit]);

    // Calculate pagination info
    const { hasNextPage, totalCount } = useMemo(() => {
        if (!customerAddressesResponse?.items) {
            return { hasNextPage: false, totalCount: 0 };
        }

        const total = customerAddressesResponse.items.length;
        const currentlyDisplayed = currentPage * limit;

        return {
            hasNextPage: currentlyDisplayed < total,
            totalCount: total
        };
    }, [customerAddressesResponse, currentPage, limit]);

    const fetchNextPage = useCallback(async () => {
        if (!hasNextPage || isFetchingNextPage || loading) return Promise.resolve();

        setIsFetchingNextPage(true);
        setCurrentPage(prev => prev + 1);
        return Promise.resolve();
    }, [hasNextPage, isFetchingNextPage, loading]);

    const refetchAll = useCallback(async () => {
        setCurrentPage(1);
        setDisplayedAddresses([]);
        await refetch();
    }, [refetch]);

    return {
        data: displayedAddresses,
        loading,
        error,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        refetch: refetchAll,
        totalCount,
        currentPage,
    };
};

export const useSelectedAddress = (selectedId: string | undefined, customerId: number) => {
    const { data: addresses } = useInfiniteShippingAddresses(customerId);

    return useMemo(() => {
        if (!selectedId) return null;
        return addresses.find(addr => addr.pk_address_id.toString() === selectedId) || null;
    }, [selectedId, addresses]);
};

export const useAddressByForeignKey = (params: GetAddressByForeignKeyParams) => {
    const [data, setData] = useState<Address | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddress = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await addressService.getAddressByForeignKey(params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch address by foreign key');
        } finally {
            setLoading(false);
        }
    }, [params.fk_id, params.table, params.address_type]);

    useEffect(() => {
        fetchAddress().then();
    }, [fetchAddress]);

    const refetch = useCallback(() => {
        fetchAddress().then();
    }, [fetchAddress]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};
