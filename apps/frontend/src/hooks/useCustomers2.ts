// hooks/useCustomers2.ts
import * as React from 'react';

import {
  Customer,
  CustomerList,
  CustomersResponse,
  CustomersQueryParams,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerStats,
  BulkOperation,
  CustomerExportParams
} from '@/services/customers/types';

import {
  Customer as CustomerQuotes
} from '@/services/quotes/types';

import { customersService } from '@/services/customers';
import {
  CustomerKpi,
  HighlightedSearchResult,
  PaginationMeta,
  UnifiedSearchParams,
  UnifiedSearchResponse
} from "../services/customers/types";


/**
 * Hook for fetching a paginated list of customers
 */
export function useCustomers(
    initialParams: CustomersQueryParams = { page: 1, limit: 10 }
) {
  const [customers, setCustomers] = React.useState<CustomerList[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [pagination, setPagination] = React.useState<PaginationMeta | null>(null);
  const [params, setParams] = React.useState<CustomersQueryParams>(initialParams);

  const fetchCustomers = React.useCallback(async (queryParams: CustomersQueryParams = params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.getCustomers(queryParams);
      setCustomers(response.items);
      setPagination(response.meta);
      setParams(prev => ({ ...prev, page: response.meta.currentPage }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [params]);

  React.useEffect(() => {
    fetchCustomers(initialParams);
  }, [JSON.stringify(initialParams)]); // Re-fetch when initialParams changes

  const goToPage = React.useCallback((newPage: number) => {
    if (pagination && newPage > 0 && newPage <= pagination.totalPages) {
      const newParams = { ...params, page: newPage };
      setParams(newParams);
      fetchCustomers(newParams);
    }
  }, [pagination, params, fetchCustomers]);

  const nextPage = React.useCallback(() => {
    if (pagination && params.page && params.page < pagination.totalPages) {
      goToPage((params.page || 1) + 1);
    }
  }, [pagination, params.page, goToPage]);

  const prevPage = React.useCallback(() => {
    if (pagination && params.page && params.page > 1) {
      goToPage((params.page || 1) - 1);
    }
  }, [pagination, params.page, goToPage]);

  const updateParams = React.useCallback((newParams: Partial<CustomersQueryParams>) => {
    const updatedParams = { ...params, ...newParams, page: 1 }; // Reset to page 1 when filters change
    setParams(updatedParams);
    fetchCustomers(updatedParams);
  }, [params, fetchCustomers]);

  return {
    customers,
    loading,
    error,
    pagination,
    params,
    goToPage,
    nextPage,
    prevPage,
    updateParams,
    refetch: fetchCustomers,
  };
}


// Hook for fetching a single customer
export const useCustomer = (id: number | null) => {
  const [customer, setCustomer] = React.useState<CustomerQuotes | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCustomer = React.useCallback(async () => {
    if (!id) {
      setCustomer(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await customersService.getCustomerByIdV2(id);
      setCustomer(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = React.useCallback(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  React.useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    loading,
    error,
    refetch,
  };

};

// Hook for customer mutations (create, update, delete)
export const useCustomerMutations = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const createCustomer = React.useCallback(async (customerData: CreateCustomerDto): Promise<Customer | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.createCustomer(customerData);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomer = React.useCallback(async (id: number, customerData: UpdateCustomerDto): Promise<Customer | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.updateCustomer(id, customerData);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = React.useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await customersService.deleteCustomer(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomerNotes = React.useCallback(async (id: number, notes: string): Promise<Customer | null> => {
    return updateCustomer(id, { notes });
  }, [updateCustomer]);

  const updateCustomerStatus = React.useCallback(async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<Customer | null> => {
    return updateCustomer(id, { status });
  }, [updateCustomer]);

  const convertLead = React.useCallback(async (id: number, customer_type: 'PROSPECT' | 'CUSTOMER'): Promise<Customer | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.convertLead(id, customer_type);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert lead');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTags = React.useCallback(async (id: number, tags: string): Promise<Customer | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.addCustomerTags(id, tags);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tags');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTags = React.useCallback(async (id: number, tags: string): Promise<Customer | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.removeCustomerTags(id, tags);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove tags');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerNotes,
    updateCustomerStatus,
    convertLead,
    addTags,
    removeTags,
    loading,
    error,
  };

};

// Hook for customer search functionality
// export const useCustomerSearch = () => {
//   const [searchResults, setSearchResults] = React.useState<Customer[]>([]);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//
//   const searchCustomers = React.useCallback(async (searchTerm: string, filters?: Partial<CustomersQueryParams>) => {
//     if (!searchTerm.trim()) {
//       setSearchResults([]);
//       return;
//     }
//
//     setLoading(true);
//     setError(null);
//
//     try {
//       const response = await customersService.searchCustomersV2(searchTerm, 50);
//       setSearchResults(response);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to search customers');
//       setSearchResults([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//
//   const clearSearch = React.useCallback(() => {
//     setSearchResults([]);
//     setError(null);
//   }, []);
//
//   return {
//     searchResults,
//     loading,
//     error,
//     searchCustomers,
//     clearSearch,
//   };
//
// };

// Hook for customer statistics/analytics
// export const useCustomerStats = () => {
//   const [stats, setStats] = React.useState<CustomerStats | null>(null);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//
//   const fetchStats = React.useCallback(async () => {
//     setLoading(true);
//     setError(null);
//
//     try {
//       const response = await customersService.getCustomerStats();
//       setStats(response);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch customer stats');
//       setStats(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//
//   React.useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);
//
//   return {
//     stats,
//     loading,
//     error,
//     refetch: fetchStats,
//   };
//
// };

// Hook for bulk operations
export const useBulkOperations = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const performBulkOperation = React.useCallback(async (operation: BulkOperation) => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.bulkOperation(operation);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk operation');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDelete = React.useCallback(async (customerIds: number[]) => {
    return performBulkOperation({
      customer_ids: customerIds,
      operation: 'delete'
    });
  }, [performBulkOperation]);

  const bulkUpdateStatus = React.useCallback(async (customerIds: number[], status: 'ACTIVE' | 'INACTIVE') => {
    return performBulkOperation({
      customer_ids: customerIds,
      operation: 'update_status',
      data: { status }
    });
  }, [performBulkOperation]);

  const bulkUpdateType = React.useCallback(async (customerIds: number[], customer_type: 'LEAD' | 'PROSPECT' | 'CUSTOMER') => {
    return performBulkOperation({
      customer_ids: customerIds,
      operation: 'update_type',
      data: { customerType: customer_type }
    });
  }, [performBulkOperation]);

  const bulkAddTags = React.useCallback(async (customerIds: number[], tags: string) => {
    return performBulkOperation({
      customer_ids: customerIds,
      operation: 'add_tags',
      data: { tags }
    });
  }, [performBulkOperation]);

  const bulkRemoveTags = React.useCallback(async (customerIds: number[], tags: string) => {
    return performBulkOperation({
      customer_ids: customerIds,
      operation: 'remove_tags',
      data: { tags }
    });
  }, [performBulkOperation]);

  return {
    performBulkOperation,
    bulkDelete,
    bulkUpdateStatus,
    bulkUpdateType,
    bulkAddTags,
    bulkRemoveTags,
    loading,
    error,
  };

};

// Hook for customer export functionality
export const useCustomerExport = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const exportCustomers = React.useCallback(async (params: CustomerExportParams) => {
    setLoading(true);
    setError(null);

    try {
      const blob = await customersService.exportCustomers(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers.${params.format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export customers');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportCustomers,
    loading,
    error,
  };

};

// Hook for specific customer types
// export const useCustomersByType = (customer_type: 'LEAD' | 'PROSPECT' | 'CUSTOMER', initialParams?: Omit<CustomersQueryParams, 'customer_type'>) => {
//   const [customers, setCustomers] = React.useState<Customer[]>([]);
//   const [meta, setMeta] = React.useState<CustomersResponse['meta'] | null>(null);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//
//   const fetchCustomers = React.useCallback(async (params?: Omit<CustomersQueryParams, 'customer_type'>) => {
//     setLoading(true);
//     setError(null);
//
//     try {
//       const response = await customersService.getCustomersByType(customer_type, params || initialParams);
//       setCustomers(response.items);
//       setMeta(response.meta);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : `Failed to fetch ${customer_type.toLowerCase()}s`);
//       setCustomers([]);
//       setMeta(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [customer_type, initialParams]);
//
//   React.useEffect(() => {
//     fetchCustomers();
//   }, [fetchCustomers]);
//
//   return {
//     customers,
//     meta,
//     loading,
//     error,
//     refetch: fetchCustomers,
//   };
//
// };

// Hook for duplicate detection
export const useDuplicateDetection = () => {
  const [duplicates, setDuplicates] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const findDuplicates = React.useCallback(async (email?: string, name?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.findDuplicateCustomers(email, name);
      setDuplicates(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find duplicates');
      setDuplicates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDuplicates = React.useCallback(() => {
    setDuplicates([]);
    setError(null);
  }, []);

  return {
    duplicates,
    loading,
    error,
    findDuplicates,
    clearDuplicates,
  };

};

interface InfiniteCustomersState {
  customers: CustomerQuotes[];  // Note please dont change it
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasNextPage: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface UseInfiniteCustomersOptions {
  initialParams?: Omit<CustomersQueryParams, 'page'>;
  pageSize?: number;
  enabled?: boolean;
  threshold?: number; // Distance from bottom to trigger load more

}

export const useInfiniteCustomers = (options: UseInfiniteCustomersOptions = {}) => {
  const {
    initialParams = {},
    pageSize = 20,
    enabled = true,
    threshold = 100
  } = options;

  const [state, setState] = React.useState<InfiniteCustomersState>({
    customers: [],
    loading: false,
    loadingMore: false,

    error: null,
    hasNextPage: false,
    currentPage: 0,
    totalPages: 0,
    totalItems: 0
  });

  const [params, setParams] = React.useState<Omit<CustomersQueryParams, 'page'>>({
    limit: pageSize,
    ...initialParams
  });

  // Refs to track state and prevent duplicate requests
  const isLoadingRef = React.useRef(false);
  const hasNextPageRef = React.useRef(false);
  const currentPageRef = React.useRef(0);
  const paramsRef = React.useRef(params);

  // Update refs when state changes
  React.useEffect(() => {
    hasNextPageRef.current = state.hasNextPage;
    currentPageRef.current = state.currentPage;
  }, [state.hasNextPage, state.currentPage]);

  React.useEffect(() => {
    paramsRef.current = params;
  }, [params]);


  const fetchCustomers = React.useCallback(async (page: number = 1, reset: boolean = false) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;


    setState(prev => ({
      ...prev,
      loading: page === 1 && reset,
      loadingMore: page > 1,
      error: null

    }));

    try {
      const queryParams: CustomersQueryParams = {
        ...paramsRef.current,
        page,
        limit: pageSize
      };

      const response = await customersService.getCustomersV2(queryParams);

      setState(prev => ({
        ...prev,
        customers: reset ? response.items : [...prev.customers, ...response.items],
        loading: false,
        loadingMore: false,
        hasNextPage: response.meta.currentPage < response.meta.totalPages,
        currentPage: response.meta.currentPage,
        totalPages: response.meta.totalPages,
        totalItems: response.meta.totalItems
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: err instanceof Error ? err.message : 'Failed to fetch customers'
      }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [pageSize]);

  const loadMore = React.useCallback(() => {
    if (!hasNextPageRef.current || isLoadingRef.current) return;

    const nextPage = currentPageRef.current + 1;
    fetchCustomers(nextPage, false);
  }, [fetchCustomers]);

  const refresh = React.useCallback(() => {
    fetchCustomers(1, true);
  }, [fetchCustomers]);

  const updateParams = React.useCallback((newParams: Partial<Omit<CustomersQueryParams, 'page'>>) => {
    const updatedParams = { ...params, ...newParams, limit: pageSize };
    setParams(updatedParams);

    // Reset and fetch with new params
    setState(prev => ({
      ...prev,
      customers: [],
      currentPage: 0,
      hasNextPage: false

    }));


    // Small delay to ensure state is updated
    setTimeout(() => {
      fetchCustomers(1, true);
    }, 0);
  }, [params, pageSize, fetchCustomers]);

  // Convenience methods for common filter updates
  const search = React.useCallback((searchTerm: string) => {
    updateParams({ search: searchTerm });
  }, [updateParams]);

  const filterByType = React.useCallback((customer_type: 'LEAD' | 'PROSPECT' | 'CUSTOMER' | undefined) => {
    updateParams({ customer_type });
  }, [updateParams]);

  const filterByStatus = React.useCallback((status: 'ACTIVE' | 'INACTIVE' | undefined) => {
    updateParams({ status });
  }, [updateParams]);

  const sortBy = React.useCallback((field: string, order: 'ASC' | 'DESC' = 'ASC') => {
    updateParams({ sort: field, order: order });
  }, [updateParams]);

  const clearFilters = React.useCallback(() => {
    setParams({ limit: pageSize });
    setState(prev => ({
      ...prev,
      customers: [],
      currentPage: 0,
      hasNextPage: false
    }));
    setTimeout(() => {
      fetchCustomers(1, true);
    }, 0);
  }, [pageSize, fetchCustomers]);

  // Auto-fetch on mount if enabled
  React.useEffect(() => {
    if (enabled && state.customers.length === 0 && !state.loading) {
      fetchCustomers(1, true);
    }
  }, [enabled, fetchCustomers, state.customers.length, state.loading]);

  // Scroll-based infinite loading
  const handleScroll = React.useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold && hasNextPageRef.current && !isLoadingRef.current) {
      loadMore();
    }
  }, [threshold, loadMore]);

  // Intersection Observer based infinite loading
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const lastElementRef = React.useCallback((node: HTMLElement | null) => {
    if (state.loadingMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (node) {
      observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && hasNextPageRef.current && !isLoadingRef.current) {
              loadMore();
            }
          },
          {
            rootMargin: `${threshold}px`,
          }
      );
      observerRef.current.observe(node);
    }
  }, [state.loadingMore, threshold, loadMore]);

  // Cleanup observer on unmount
  React.useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();

      }
    };
  }, []);

  return {
    // Data
    customers: state.customers,

    // Loading states
    loading: state.loading,
    loadingMore: state.loadingMore,

    // Error state
    error: state.error,

    // Pagination info
    hasNextPage: state.hasNextPage,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalItems: state.totalItems,

    // Current params
    params,

    // Actions
    loadMore,
    refresh,
    updateParams,
    search,
    filterByType,
    filterByStatus,
    sortBy,
    clearFilters,

    // Event handlers for manual scroll implementation
    handleScroll,

    // Ref for intersection observer implementation
    lastElementRef,

  };

};

// Hook variant with search debouncing
export const useInfiniteCustomersWithSearch = (

    searchTerm: string,
    options: UseInfiniteCustomersOptions = {},
    debounceMs: number = 300

) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchTerm);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const infiniteQuery = useInfiniteCustomers({
    ...options,
    initialParams: {
      ...options.initialParams,
      search: debouncedSearchTerm || undefined
    }
  });

  // Reset results when search term changes
  React.useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      infiniteQuery.refresh();
    }
  }, [debouncedSearchTerm, searchTerm, infiniteQuery.refresh]);

  return {
    ...infiniteQuery,
    searchTerm: debouncedSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm,
  };

};

// Hook for infinite scrolling with virtual scrolling support
export const useVirtualizedInfiniteCustomers = (
    options: UseInfiniteCustomersOptions = {}

) => {
  const infiniteQuery = useInfiniteCustomers(options);

  // Calculate virtual scroll metrics
  const itemHeight = 80; // Approximate height of each customer row
  const containerHeight = 600; // Height of the scroll container
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const bufferSize = Math.floor(visibleCount / 2);

  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(
      infiniteQuery.customers.length - 1,
      startIndex + visibleCount + bufferSize * 2
  );

  const visibleCustomers = infiniteQuery.customers.slice(startIndex, endIndex + 1);
  const totalHeight = infiniteQuery.customers.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Load more when approaching the end of visible items
  React.useEffect(() => {
    const shouldLoadMore =
        endIndex >= infiniteQuery.customers.length - 10 &&
        infiniteQuery.hasNextPage &&
        !infiniteQuery.loadingMore;

    if (shouldLoadMore) {
      infiniteQuery.loadMore();
    }
  }, [endIndex, infiniteQuery.customers.length, infiniteQuery.hasNextPage, infiniteQuery.loadingMore, infiniteQuery.loadMore]);

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    ...infiniteQuery,
    // Virtual scroll data
    visibleCustomers,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    itemHeight,
    handleScroll,
  };
};

/**
 * Hook for fetching customer KPI data
 */
export function useCustomerKpi() {
  const [kpiData, setKpiData] = React.useState<CustomerKpi | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchKpiData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await customersService.getCustomerKpi();
      setKpiData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchKpiData();
  }, [fetchKpiData]);

  return {
    kpiData,
    loading,
    error,
    refetch: fetchKpiData,
  };
}

interface UseUnifiedSearchOptions {
  /** Initial search query */
  initialQuery?: string;

  /** Initial page number */
  initialPage?: number;

  /** Number of results per page */
  pageSize?: number;

  /** Debounce time in milliseconds */
  debounceMs?: number;

  /** Whether to auto-search on mount */
  autoSearch?: boolean;

  /** Additional filters to apply */
  filters?: UnifiedSearchParams['filters'];
}

/**
 * Hook for using the unified search functionality
 */
export function useUnifiedSearch(options: UseUnifiedSearchOptions = {}) {
  const {
    initialQuery = '',
    initialPage = 1,
    pageSize = 10,
    debounceMs = 300,
    autoSearch = false,
    filters = {}
  } = options;

  // State for search results and metadata
  const [results, setResults] = React.useState<CustomerList[]>([]);
  const [highlights, setHighlights] = React.useState<UnifiedSearchResponse['highlights']>({});
  const [pagination, setPagination] = React.useState<PaginationMeta | null>(null);

  // State for search parameters
  const [query, setQuery] = React.useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>(initialQuery);
  const [page, setPage] = React.useState<number>(initialPage);
  const [searchFilters, setSearchFilters] = React.useState<UnifiedSearchParams['filters']>(filters);

  // State for loading and error status
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Apply debounce to search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Reset page when query or filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery, searchFilters]);

  // Perform search when debounced query, page, or filters change
  React.useEffect(() => {
    if (debouncedQuery.trim() && (autoSearch || debouncedQuery !== initialQuery)) {
      performSearch();
    }
  }, [debouncedQuery, page, searchFilters]);

  // Function to perform the actual search
  const performSearch = React.useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setPagination(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await customersService.search({
        q: debouncedQuery,
        page,
        limit: pageSize,
        filters: searchFilters
      });

      setResults(response.items);
      setPagination(response.meta);
      setHighlights(response.highlights || {});
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to perform search'));
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, pageSize, searchFilters]);

  // Get highlighted results with highlight information attached
  const highlightedResults = React.useMemo(() => {
    return results.map(item => {
      const resultHighlights = highlights?.[item.pk_customer_id.toString()];
      if (resultHighlights) {
        return {
          ...item,
          highlights: resultHighlights
        } as HighlightedSearchResult;
      }
      return item;
    });
  }, [results, highlights]);

  // Navigation functions
  const goToPage = React.useCallback((newPage: number) => {
    if (pagination && newPage > 0 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  }, [pagination]);

  const nextPage = React.useCallback(() => {
    if (pagination && page < pagination.totalPages) {
      goToPage(page + 1);
    }
  }, [pagination, page, goToPage]);

  const prevPage = React.useCallback(() => {
    if (pagination && page > 1) {
      goToPage(page - 1);
    }
  }, [pagination, page, goToPage]);

  // Search manipulation functions
  const updateQuery = React.useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = React.useCallback((newFilters: Partial<UnifiedSearchParams['filters']>) => {
    setSearchFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setSearchFilters({});
  }, []);

  const clearSearch = React.useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setPagination(null);
    setPage(initialPage);
    setSearchFilters({});
  }, [initialPage]);

  // Force a search with current parameters
  const search = React.useCallback((forceQuery?: string) => {
    if (forceQuery !== undefined) {
      setQuery(forceQuery);
      setDebouncedQuery(forceQuery);
    }
    performSearch();
  }, [performSearch]);

  return {
    // Data
    results,
    highlightedResults,
    pagination,

    // Search state
    query,
    debouncedQuery,
    page,
    filters: searchFilters,
    loading,
    error,
    isDebouncing: query !== debouncedQuery,

    // Actions
    search,
    updateQuery,
    updateFilters,
    clearFilters,
    clearSearch,

    // Navigation
    goToPage,
    nextPage,
    prevPage,
  };
}

interface UseInfiniteUnifiedSearchOptions {
  /** Initial search query */
  initialQuery?: string;

  /** Number of results per page */
  pageSize?: number;

  /** Debounce time in milliseconds */
  debounceMs?: number;

  /** Whether to enable the search */
  enabled?: boolean;

  /** Distance from bottom to trigger loading more (in px) */
  scrollThreshold?: number;

  /** Additional filters to apply */
  filters?: UnifiedSearchParams['filters'];
}

/**
 * Hook for unified search with infinite scrolling
 */
export function useInfiniteUnifiedSearch(options: UseInfiniteUnifiedSearchOptions = {}) {
  const {
    initialQuery = '',
    pageSize = 10,
    debounceMs = 300,
    enabled = true,
    scrollThreshold = 100,
    filters = {}
  } = options;

  // State for search results
  const [results, setResults] = React.useState<CustomerList[]>([]);
  const [highlights, setHighlights] = React.useState<Record<string, Record<string, string[]>>>({});

  // Search parameters state
  const [query, setQuery] = React.useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>(initialQuery);
  const [searchFilters, setSearchFilters] = React.useState<UnifiedSearchParams['filters']>(filters);

  // Pagination state
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [totalItems, setTotalItems] = React.useState<number>(0);

  // Loading and error states
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Refs to track state between renders
  const isLoadingRef = React.useRef(false);
  const hasNextPageRef = React.useRef(false);
  const currentQueryRef = React.useRef(debouncedQuery);
  const filtersRef = React.useRef(searchFilters);

  // Apply debounce to search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Update refs when state changes
  React.useEffect(() => {
    hasNextPageRef.current = hasNextPage;
    currentQueryRef.current = debouncedQuery;
    filtersRef.current = searchFilters;
  }, [hasNextPage, debouncedQuery, searchFilters]);

  // Reset results when query or filters change
  React.useEffect(() => {
    if (enabled && debouncedQuery.trim()) {
      setResults([]);
      setCurrentPage(1);
      fetchResults(debouncedQuery, 1, searchFilters, true);
    } else if (debouncedQuery === '') {
      // Clear results when query is empty
      setResults([]);
      setHasNextPage(false);
      setTotalPages(0);
      setTotalItems(0);
    }
  }, [enabled, debouncedQuery, JSON.stringify(searchFilters)]);

  // Function to fetch search results
  const fetchResults = React.useCallback(async (
      searchQuery: string,
      page: number,
      searchFilters: UnifiedSearchParams['filters'],
      isNewSearch: boolean
  ) => {
    if (!searchQuery.trim() || isLoadingRef.current) return;

    isLoadingRef.current = true;

    if (isNewSearch) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      const response = await customersService.search({
        q: searchQuery,
        page,
        limit: pageSize,
        filters: searchFilters
      });

      setResults(prev =>
          isNewSearch ? response.items : [...prev, ...response.items]
      );

      // Update highlights by merging with existing ones
      if (response.highlights) {
        setHighlights(prev => ({
          ...prev,
          ...response.highlights
        }));
      }

      setHasNextPage(response.meta.currentPage < response.meta.totalPages);
      setCurrentPage(response.meta.currentPage);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to perform unified search'));
      if (isNewSearch) {
        setResults([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [pageSize]);

  // Get highlighted results
  const highlightedResults = React.useMemo(() => {
    return results.map(item => {
      const resultHighlights = highlights?.[item.pk_customer_id.toString()];
      if (resultHighlights) {
        return {
          ...item,
          highlights: resultHighlights
        } as HighlightedSearchResult;
      }
      return item;
    });
  }, [results, highlights]);

  // Function to load more results
  const loadMore = React.useCallback(() => {
    if (!hasNextPageRef.current || isLoadingRef.current) return;

    const nextPage = currentPage + 1;
    fetchResults(currentQueryRef.current, nextPage, filtersRef.current, false);
  }, [currentPage, fetchResults]);

  // Update search query
  const updateQuery = React.useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  // Update search filters
  const updateFilters = React.useCallback((newFilters: Partial<UnifiedSearchParams['filters']>) => {
    setSearchFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Clear all filters
  const clearFilters = React.useCallback(() => {
    setSearchFilters({});
  }, []);

  // Refresh search with current parameters
  const refresh = React.useCallback(() => {
    if (debouncedQuery.trim()) {
      setResults([]);
      setCurrentPage(1);
      fetchResults(debouncedQuery, 1, searchFilters, true);
    }
  }, [debouncedQuery, searchFilters, fetchResults]);

  // Clear all search state
  const clearSearch = React.useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setHasNextPage(false);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalItems(0);
    setSearchFilters({});
  }, []);

  // Force a search with specific query
  const search = React.useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setDebouncedQuery(searchQuery);
    setResults([]);
    setCurrentPage(1);
    if (searchQuery.trim()) {
      fetchResults(searchQuery, 1, searchFilters, true);
    }
  }, [searchFilters, fetchResults]);

  // Intersection Observer for infinite scrolling
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const lastElementRef = React.useCallback((node: HTMLElement | null) => {
    if (loadingMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (node) {
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPageRef.current && !isLoadingRef.current) {
          loadMore();
        }
      }, {
        rootMargin: `0px 0px ${scrollThreshold}px 0px`
      });

      observerRef.current.observe(node);
    }
  }, [loadingMore, loadMore, scrollThreshold]);

  // Event handler for manual scroll implementation
  const handleScroll = React.useCallback((event: React.UIEvent<HTMLElement> | Event) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < scrollThreshold && hasNextPageRef.current && !isLoadingRef.current) {
      loadMore();
    }
  }, [scrollThreshold, loadMore]);

  // Cleanup observer on unmount
  React.useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    // Data
    results,
    highlightedResults,

    // Search state
    query,
    debouncedQuery,
    filters: searchFilters,

    // Pagination info
    hasNextPage,
    currentPage,
    totalPages,
    totalItems,

    // Loading and error states
    loading,
    loadingMore,
    error,
    isDebouncing: query !== debouncedQuery,

    // Actions
    search,
    updateQuery,
    updateFilters,
    clearFilters,
    loadMore,
    refresh,
    clearSearch,

    // Refs and handlers for infinite scrolling
    lastElementRef,
    handleScroll,
  };
}
