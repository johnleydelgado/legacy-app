// hooks/useQuotes.ts
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesService } from "@/services/quotes";
import {
  QuoteTypes,
  QuotesResponse,
  QuotesSearchResponse,
  QuotesQueryParams,
  QuotesSearchParams,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  QuotesDashboardSummaryResponse,
} from "@/services/quotes/types";

// Query Keys
export const QUOTES_QUERY_KEYS = {
  all: ["quotes"] as const,
  lists: () => [...QUOTES_QUERY_KEYS.all, "list"] as const,
  list: (params: QuotesQueryParams) =>
      [...QUOTES_QUERY_KEYS.lists(), params] as const,
  search: () => [...QUOTES_QUERY_KEYS.all, "search"] as const,
  searchQuery: (params: QuotesSearchParams) =>
      [...QUOTES_QUERY_KEYS.search(), params] as const,
  details: () => [...QUOTES_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUOTES_QUERY_KEYS.details(), id] as const,
  byCustomer: () => [...QUOTES_QUERY_KEYS.all, "by-customer"] as const,
  customerQuotes: (customerId: number, params?: any) =>
      [...QUOTES_QUERY_KEYS.byCustomer(), customerId, params] as const,
  dashboard: () => [...QUOTES_QUERY_KEYS.all, "dashboard"] as const,
  dashboardSummary: () => [...QUOTES_QUERY_KEYS.dashboard(), "summary"] as const,
  status: () => [...QUOTES_QUERY_KEYS.all, "status"] as const,
};

export const useQuotes = (params: QuotesQueryParams = {}) => {
  // If there's a search term, use the search endpoint
  const isSearching = !!params.search;

  // @ts-ignore
  return useQuery({
    queryKey: isSearching
        ? QUOTES_QUERY_KEYS.searchQuery({
          q: params.search!,
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          filter: params.filter,
        })
        : QUOTES_QUERY_KEYS.list(params),
    queryFn: () => {
      if (isSearching) {
        return quotesService.searchQuotes({
          q: params.search!,
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          filter: params.filter,
        });
      }
      return quotesService.getQuotes(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
    // Enable the query even when search is empty to show all quotes
    enabled: true,
  });
};

// Dedicated Search Hook (alternative approach)
export const useSearchQuotes = (
    params: QuotesSearchParams,
    enabled: boolean = true
) => {
  // @ts-ignore
  return useQuery({
    queryKey: QUOTES_QUERY_KEYS.searchQuery(params),
    queryFn: () => quotesService.searchQuotes(params),
    enabled: enabled && !!params.q.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Get Quote by ID Hook
export const useQuote = (id: number, enabled: boolean = true) => {
  // @ts-ignore
  return useQuery({
    queryKey: QUOTES_QUERY_KEYS.detail(id),
    queryFn: () => quotesService.getQuoteById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

// Get Quotes by Customer ID Hook
export const useQuotesByCustomerId = (
    customerId: number,
    params: { page?: number; limit?: number } = {},
    enabled: boolean = true
) => {
  // @ts-ignore
  return useQuery({
    queryKey: QUOTES_QUERY_KEYS.customerQuotes(customerId, params),
    queryFn: () => quotesService.getQuotesByCustomerId(customerId, params),
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

// // Get Quotes Status Hook
// export const useQuotesStatus = (enabled: boolean = true) => {
//   // @ts-ignore
//   return useQuery({
//     queryKey: QUOTES_QUERY_KEYS.status(),
//     queryFn: () => quotesService.getQuotesStatus(),
//     enabled,
//     staleTime: 3 * 60 * 1000, // 3 minutes
//     retry: 3,
//     refetchOnWindowFocus: false,
//   });
// };

// Dashboard Summary Hook
export const useQuotesDashboardSummary = (enabled: boolean = true) => {
  // @ts-ignore
  return useQuery({
    queryKey: QUOTES_QUERY_KEYS.dashboardSummary(),
    queryFn: () => quotesService.getDashboardSummary(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
    retry: 3,
    refetchOnWindowFocus: true, // Refetch when user returns to the dashboard
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};

// Create Quote Mutation
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  // @ts-ignore
  return useMutation({
    mutationFn: (quote: CreateQuoteRequest) => quotesService.createQuote(quote),
    onSuccess: (newQuote) => {
      // Invalidate and refetch quotes list
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.lists() });
      // Also invalidate search results
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.search() });
      // Invalidate dashboard summary as new quote affects totals
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.dashboardSummary() });
      // Invalidate status data
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.status() });

      // Add the new quote to cache
      queryClient.setQueryData(
          QUOTES_QUERY_KEYS.detail(newQuote.pk_quote_id),
          newQuote
      );
    },
    onError: (error) => {
      console.error("Failed to create quote:", error);
    },
  });
};

// Update Quote Mutation
export const useUpdateQuote = () => {
  const queryClient = useQueryClient();

  // @ts-ignore
  return useMutation({
    mutationFn: ({ id, quote }: { id: number; quote: UpdateQuoteRequest }) =>
        quotesService.updateQuote(id, quote),
    onSuccess: (updatedQuote, variables) => {
      // Update the specific quote in cache
      queryClient.setQueryData(
          QUOTES_QUERY_KEYS.detail(variables.id),
          updatedQuote
      );

      // Invalidate quotes list to refetch
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.lists() });
      // Also invalidate search results
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.search() });
      // Invalidate dashboard summary as updated quote may affect totals/statuses
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.dashboardSummary() });
      // Invalidate status data
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.status() });
    },
    onError: (error) => {
      console.error("Failed to update quote:", error);
    },
  });
};

// Add this type for context if it doesn't exist already
interface DeleteQuoteContext {
  previousQuote: any;
  listsQueries: [any, any][];
}

// Define a type for the list data structure
interface QuoteListData {
  items: Array<{ pk_quote_id: number; [key: string]: any }>;
  total?: number;
  [key: string]: any;
}

// Enhanced Delete Quote Mutation with proper TypeScript types
export const useDeleteQuote = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number, DeleteQuoteContext>({
    mutationFn: async (id: number) => {
      // Validate the ID
      if (!id || id <= 0) {
        throw new Error("Invalid quote ID for deletion");
      }

      try {
        // Call the delete service
        return await quotesService.deleteQuote(id);
      } catch (error: any) {
        // Enhanced error handling
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || 'Unknown server error';

          if (status === 404) {
            throw new Error(`Quote with ID ${id} not found`);
          } else if (status === 403) {
            throw new Error('You do not have permission to delete this quote');
          } else if (status >= 500) {
            throw new Error(`Server error (${status}): ${message}`);
          }
        }

        // For network errors or other issues
        throw error;
      }
    },

    // Optimistic update
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUOTES_QUERY_KEYS.detail(deletedId),
      });

      // Snapshot the previous value
      const previousQuote = queryClient.getQueryData(
          QUOTES_QUERY_KEYS.detail(deletedId)
      );

      // Optimistically remove the quote from the cache
      queryClient.setQueryData(QUOTES_QUERY_KEYS.detail(deletedId), null);

      // Update any lists that might contain this quote
      const listsQueries = queryClient.getQueriesData({
        queryKey: QUOTES_QUERY_KEYS.lists(),
      });

      listsQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)) {
          // Safely cast data to QuoteListData since we've verified it has the required structure
          const typedData = data as QuoteListData;
          const updatedItems = (typedData.items || []).filter(
              (item: any) => item.pk_quote_id !== deletedId
          );

          queryClient.setQueryData(queryKey, {
            ...typedData,
            items: updatedItems,
            total: typedData.total ? typedData.total - 1 : undefined,
          });
        }
      });

      // Return a context object with the snapshotted value
      return { previousQuote, listsQueries };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, deletedId, context) => {
      if (context?.previousQuote) {
        queryClient.setQueryData(
            QUOTES_QUERY_KEYS.detail(deletedId),
            context.previousQuote
        );
      }

      console.error("Failed to delete quote:", err);
    },

    // Always refetch after error or success:
    onSettled: (_, error, deletedId) => {
      if (error) {
        // If there was an error, refresh the data to ensure consistency
        queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.detail(deletedId) });
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.search() });
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.dashboardSummary() });

      // If you have customer-related quote queries, invalidate those too
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.byCustomer() });

      // Invalidate status data if applicable
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.status() });
    },
  });
};

// Prefetch Quote Hook
export const usePrefetchQuote = () => {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: QUOTES_QUERY_KEYS.detail(id),
      queryFn: () => quotesService.getQuoteById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Prefetch Dashboard Summary Hook
export const usePrefetchDashboardSummary = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: QUOTES_QUERY_KEYS.dashboardSummary(),
      queryFn: () => quotesService.getDashboardSummary(),
      staleTime: 2 * 60 * 1000,
    });
  };
};

// Prefetch Quotes Status Hook
// export const usePrefetchQuotesStatus = () => {
//   const queryClient = useQueryClient();
//
//   return () => {
//     queryClient.prefetchQuery({
//       queryKey: QUOTES_QUERY_KEYS.status(),
//       queryFn: () => quotesService.getQuotesStatus(),
//       staleTime: 3 * 60 * 1000,
//     });
//   };
// };

// Bulk operations hook
export const useInvalidateQuotesData = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.all });
    },
    invalidateLists: () => {
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.lists() });
    },
    invalidateSearch: () => {
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.search() });
    },
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.dashboardSummary() });
    },
    invalidateStatus: () => {
      queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEYS.status() });
    },
  };
};
