import { useState, useEffect, useCallback, useRef } from "react";
import { statusService } from "@/services/status";
import { StatusResponse, StatusQueryParams, StatusItem } from "@/services/status/types";

interface UseStatusesResult {
  data: StatusResponse | null;
  isLoading: boolean;
  error: Error | null;
  fetchStatuses: (params?: StatusQueryParams) => Promise<void>;
}

export const useStatuses = (initialParams: StatusQueryParams = {}): UseStatusesResult => {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [queryParams, setQueryParams] = useState<StatusQueryParams>(initialParams);

  const fetchStatuses = useCallback(async (params?: StatusQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const newParams = params ?? queryParams;
      setQueryParams(newParams);

      const response = await statusService.getStatuses(newParams);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch statuses"));
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchStatuses();
  }, []);

  return { data, isLoading, error, fetchStatuses };
};

interface UseStatusResult {
  data: StatusItem | null;
  isLoading: boolean;
  error: Error | null;
  fetchStatus: (id: number) => Promise<void>;
}

export const useStatus = (initialId?: number): UseStatusResult => {
  const [data, setData] = useState<StatusItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!initialId);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await statusService.getStatusById(id);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch status with id ${id}`));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) {
      fetchStatus(initialId);
    }
  }, [initialId, fetchStatus]);

  return { data, isLoading, error, fetchStatus };
};

interface UseInfiniteStatusesResult {
  items: StatusItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  updateParams: (newParams: StatusQueryParams) => Promise<void>;
}

/**
 * Hook for fetching status items with infinite loading capability
 * @param initialParams Initial query parameters
 * @returns An object with status items and methods to load more
 */
export const useInfiniteStatuses = (initialParams: StatusQueryParams = {}): UseInfiniteStatusesResult => {
  const [items, setItems] = useState<StatusItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Use refs to track current page and query params
  const currentPageRef = useRef<number>(1);
  const queryParamsRef = useRef<StatusQueryParams>({
    ...initialParams,
    page: 1,
    limit: initialParams.limit || 20
  });

  // Track if there are active fetch requests
  const activeRequestRef = useRef<AbortController | null>(null);

  /**
   * Fetch status items based on current params
   */
  const fetchItems = useCallback(async (isInitialFetch: boolean = true): Promise<void> => {
    // Cancel any ongoing requests
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    // Create a new abort controller for this request
    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    try {
      if (isInitialFetch) {
        setIsLoading(true);
        currentPageRef.current = 1;
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      // Prepare query params with current page
      const params: StatusQueryParams = {
        ...queryParamsRef.current,
        page: currentPageRef.current
      };

      const response = await statusService.getStatuses(params);

      // Only update state if the request wasn't aborted
      if (!abortController.signal.aborted) {
        // If initial fetch, replace items, otherwise append
        if (isInitialFetch) {
          setItems(response.items);
        } else {
          setItems(prevItems => [...prevItems, ...response.items]);
        }

        // Check if there are more pages
        setHasMore(response.meta.currentPage < response.meta.totalPages);
      }
    } catch (err) {
      // Only set error if the request wasn't aborted
      if (err instanceof Error && err.name !== 'AbortError' && !abortController.signal.aborted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch statuses"));
      }
    } finally {
      // Only update loading states if the request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }

      // Clear the reference if this is the active request
      if (activeRequestRef.current === abortController) {
        activeRequestRef.current = null;
      }
    }
  }, []);

  /**
   * Load more items by incrementing page and fetching
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasMore) return;

    currentPageRef.current += 1;
    await fetchItems(false);
  }, [isLoadingMore, hasMore, fetchItems]);

  /**
   * Refresh the list by resetting to page 1 and fetching
   */
  const refresh = useCallback(async (): Promise<void> => {
    currentPageRef.current = 1;
    await fetchItems(true);
  }, [fetchItems]);

  /**
   * Update query params and refresh
   */
  const updateParams = useCallback((newParams: StatusQueryParams): Promise<void> => {
    // Only update params that are defined
    const filteredParams = Object.entries(newParams).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof StatusQueryParams] = value;
      }
      return acc;
    }, {} as StatusQueryParams);

    queryParamsRef.current = {
      ...queryParamsRef.current,
      ...filteredParams,
      page: 1 // Reset page when params change
    };

    return refresh();
  }, [refresh]);

  // Initial fetch on mount
  useEffect(() => {
    fetchItems(true);

    // Cleanup function
    return () => {
      // Cancel any ongoing requests when component unmounts
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
    };
  }, [fetchItems]);

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    updateParams
  };
};
