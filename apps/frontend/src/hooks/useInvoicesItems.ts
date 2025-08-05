// hooks/useInvoiceItems.ts
import { useState, useCallback, useEffect } from 'react';
import {
    InvoiceItem,
    PaginatedResponse,
    CreateInvoiceItemDTO,
    UpdateInvoiceItemDTO,
    InvoiceItemsQueryParams
} from '@/services/invoices-items/types';
import { invoiceItemsService } from '@/services/invoices-items';

// Hook for fetching all invoice items
export const useInvoiceItems = (initialParams: InvoiceItemsQueryParams = {}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<PaginatedResponse<InvoiceItem> | null>(null);
    const [params, setParams] = useState<InvoiceItemsQueryParams>(initialParams);

    const fetchInvoiceItems = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await invoiceItemsService.getAllInvoiceItems(params);
            setData(response);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchInvoiceItems().then();
    }, [fetchInvoiceItems]);

    const refresh = useCallback(() => {
        fetchInvoiceItems().then();
    }, [fetchInvoiceItems]);

    const setPage = useCallback((page: number) => {
        setParams(prev => ({ ...prev, page }));
    }, []);

    const setItemsPerPage = useCallback((itemsPerPage: number) => {
        setParams(prev => ({ ...prev, itemsPerPage }));
    }, []);

    return {
        invoiceItems: data?.items || [],
        meta: data?.meta,
        loading,
        error,
        params,
        setParams,
        setPage,
        setItemsPerPage,
        refresh
    };
};

// Hook for fetching a single invoice item by ID
export const useInvoiceItem = (id: number) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<InvoiceItem | null>(null);

    const fetchInvoiceItem = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const response = await invoiceItemsService.getInvoiceItemById(id);
            setData(response);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchInvoiceItem();
    }, [fetchInvoiceItem]);

    const refresh = useCallback(() => {
        fetchInvoiceItem();
    }, [fetchInvoiceItem]);

    return {
        invoiceItem: data,
        loading,
        error,
        refresh
    };
};

// Hook for fetching invoice items by invoice ID
export const useInvoiceItemsByInvoiceId = (
    invoiceId: number,
    initialParams: { page?: number; itemsPerPage?: number } = {}
) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<PaginatedResponse<InvoiceItem> | null>(null);
    const [params, setParams] = useState(initialParams);

    const fetchInvoiceItemsByInvoiceId = useCallback(async () => {
        if (!invoiceId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await invoiceItemsService.getInvoiceItemsByInvoiceId(invoiceId, params);
            setData(response);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [invoiceId, params]);

    useEffect(() => {
        fetchInvoiceItemsByInvoiceId();
    }, [fetchInvoiceItemsByInvoiceId]);

    const refresh = useCallback(() => {
        fetchInvoiceItemsByInvoiceId();
    }, [fetchInvoiceItemsByInvoiceId]);

    const setPage = useCallback((page: number) => {
        setParams(prev => ({ ...prev, page }));
    }, []);

    const setItemsPerPage = useCallback((itemsPerPage: number) => {
        setParams(prev => ({ ...prev, itemsPerPage }));
    }, []);

    return {
        invoiceItems: data?.items || [],
        meta: data?.meta,
        loading,
        error,
        params,
        setParams,
        setPage,
        setItemsPerPage,
        refresh
    };
};

// Hook for creating, updating, and deleting invoice items
export const useInvoiceItemMutations = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const createInvoiceItem = useCallback(async (data: CreateInvoiceItemDTO) => {
        setLoading(true);
        setError(null);

        try {
            const response = await invoiceItemsService.createInvoiceItem(data);
            return response;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateInvoiceItem = useCallback(async (id: number, data: UpdateInvoiceItemDTO) => {
        setLoading(true);
        setError(null);

        try {
            const response = await invoiceItemsService.updateInvoiceItem(id, data);
            return response;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteInvoiceItem = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            await invoiceItemsService.deleteInvoiceItem(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createInvoiceItem,
        updateInvoiceItem,
        deleteInvoiceItem,
        loading,
        error
    };
};
