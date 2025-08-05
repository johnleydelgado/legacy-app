import { useState, useEffect, useCallback } from 'react';
import { invoiceService } from '@/services/invoices';
import {
    Invoice,
    InvoicesResponse,
    InvoiceKpi,
    GetInvoicesParams,
    GetCustomerInvoicesParams,
    SearchInvoicesParams,
    CreateInvoiceDto,
    UpdateInvoiceDto
} from '@/services/invoices/types';

// Hook for fetching all invoices
export const useInvoices = (params: GetInvoicesParams = {}) => {
    const [invoices, setInvoices] = useState<InvoicesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [queryParams, setQueryParams] = useState<GetInvoicesParams>(params);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const response = await invoiceService.getInvoices(queryParams);
            setInvoices(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const refresh = () => {
        fetchInvoices();
    };

    const setParams = (newParams: GetInvoicesParams) => {
        setQueryParams(prev => ({ ...prev, ...newParams }));
    };

    const goToPage = (page: number) => {
        setQueryParams(prev => ({ ...prev, page }));
    };

    return {
        invoices,
        loading,
        error,
        refresh,
        setParams,
        goToPage,
        page: queryParams.page || 1
    };
};

// Hook for fetching invoice KPIs
export const useInvoiceKpi = () => {
    const [kpi, setKpi] = useState<InvoiceKpi | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchKpi = useCallback(async () => {
        try {
            setLoading(true);
            const response = await invoiceService.getInvoiceKpi();
            setKpi(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKpi();
    }, [fetchKpi]);

    const refresh = () => {
        fetchKpi();
    };

    return { kpi, loading, error, refresh };
};

// Hook for fetching a single invoice by ID
export const useInvoice = (invoiceId: number | null) => {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchInvoice = useCallback(async () => {
        if (!invoiceId) return;

        try {
            setLoading(true);
            const response = await invoiceService.getInvoiceById(invoiceId);
            setInvoice(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [invoiceId]);

    useEffect(() => {
        if (invoiceId) {
            fetchInvoice();
        }
    }, [invoiceId, fetchInvoice]);

    const refresh = () => {
        fetchInvoice();
    };

    return { invoice, loading, error, refresh };
};

// Hook for fetching invoices by customer ID
export const useCustomerInvoices = (params: GetCustomerInvoicesParams) => {
    const [invoices, setInvoices] = useState<InvoicesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [queryParams, setQueryParams] = useState<GetCustomerInvoicesParams>(params);

    const fetchCustomerInvoices = useCallback(async () => {
        if (!queryParams.customerId) return;

        try {
            setLoading(true);
            const response = await invoiceService.getCustomerInvoices(queryParams);
            setInvoices(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        if (queryParams.customerId) {
            fetchCustomerInvoices();
        }
    }, [queryParams, fetchCustomerInvoices]);

    const refresh = () => {
        fetchCustomerInvoices();
    };

    const setParams = (newParams: Partial<GetCustomerInvoicesParams>) => {
        setQueryParams(prev => ({ ...prev, ...newParams }));
    };

    const goToPage = (page: number) => {
        setQueryParams(prev => ({ ...prev, page }));
    };

    return {
        invoices,
        loading,
        error,
        refresh,
        setParams,
        goToPage,
        page: queryParams.page || 1
    };
};

// Hook for searching invoices
export const useSearchInvoices = (initialParams: SearchInvoicesParams = {}) => {
    const [invoices, setInvoices] = useState<InvoicesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [searchParams, setSearchParams] = useState<SearchInvoicesParams>(initialParams);

    const searchInvoices = useCallback(async () => {
        if (!searchParams.q) return;

        try {
            setLoading(true);
            const response = await invoiceService.searchInvoices(searchParams);
            setInvoices(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        if (searchParams.q) {
            searchInvoices();
        }
    }, [searchParams, searchInvoices]);

    const search = (q: string) => {
        setSearchParams(prev => ({ ...prev, q, page: 1 }));
    };

    const setParams = (newParams: SearchInvoicesParams) => {
        setSearchParams(prev => ({ ...prev, ...newParams }));
    };

    const goToPage = (page: number) => {
        setSearchParams(prev => ({ ...prev, page }));
    };

    return {
        invoices,
        loading,
        error,
        search,
        setParams,
        goToPage,
        searchQuery: searchParams.q,
        page: searchParams.page || 1
    };
};

// Hook for creating an invoice
export const useCreateInvoice = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

    const createInvoice = async (data: CreateInvoiceDto) => {
        try {
            setLoading(true);
            const response = await invoiceService.createInvoice(data);
            setCreatedInvoice(response);
            setError(null);
            return response;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { createInvoice, loading, error, createdInvoice };
};

// Hook for updating an invoice
export const useUpdateInvoice = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [updatedInvoice, setUpdatedInvoice] = useState<Invoice | null>(null);

    const updateInvoice = async (id: number, data: UpdateInvoiceDto) => {
        try {
            setLoading(true);
            const response = await invoiceService.updateInvoice(id, data);
            setUpdatedInvoice(response);
            setError(null);
            return response;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { updateInvoice, loading, error, updatedInvoice };
};

// Hook for deleting an invoice
export const useDeleteInvoice = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const deleteInvoice = async (id: number) => {
        try {
            setLoading(true);
            const response = await invoiceService.deleteInvoice(id);
            setSuccess(response.success);
            setError(null);
            return response;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            setError(error);
            setSuccess(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { deleteInvoice, loading, error, success };
};
