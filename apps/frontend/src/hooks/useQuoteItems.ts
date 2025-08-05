// hooks/useQuoteItems.ts
import * as React from 'react';
import {useQuery, useMutation, useQueryClient, useInfiniteQuery} from "@tanstack/react-query";
import { quoteItemsService } from "@/services/quote-items";
import {
  QuoteItem,
  QuoteItemsResponse,
  QuoteItemsQueryParams,
  CreateQuoteItemRequest,
  UpdateQuoteItemRequest,
} from "@/services/quote-items/types";
import {QuoteTotals} from "../services/quote-items/types";


// Query Keys
export const QUOTE_ITEMS_QUERY_KEYS = {
  all: ["logo-upload-dropzone"] as const,
  lists: () => [...QUOTE_ITEMS_QUERY_KEYS.all, "list"] as const,
  list: (params: QuoteItemsQueryParams) =>
      [...QUOTE_ITEMS_QUERY_KEYS.lists(), params] as const,
  details: () => [...QUOTE_ITEMS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUOTE_ITEMS_QUERY_KEYS.details(), id] as const,
  byQuote: (quoteId: number, params?: { page?: number; limit?: number }) =>
      [...QUOTE_ITEMS_QUERY_KEYS.all, "by-quote", quoteId, params] as const,
  totals: (quoteId: number) => [...QUOTE_ITEMS_QUERY_KEYS.all, "totals", quoteId] as const,
};

/**
 * Get Quote Items Hook
 */
export const useQuoteItems = (params: QuoteItemsQueryParams = {}) => {
  return useQuery<QuoteItemsResponse>({
    queryKey: QUOTE_ITEMS_QUERY_KEYS.list(params),
    queryFn: () => quoteItemsService.getQuoteItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get Quote Items by Quote ID Hook
 */
export const useQuoteItemsByQuoteId = (
    quoteId: number,
    params: { page?: number; limit?: number } = {},
    enabled: boolean = true
) => {
  return useQuery<QuoteItemsResponse>({
    queryKey: QUOTE_ITEMS_QUERY_KEYS.byQuote(quoteId, params),
    queryFn: () => quoteItemsService.getQuoteItemsByQuoteId(quoteId, params),
    enabled: enabled && !!quoteId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get Quote Item by ID Hook
 */
export const useQuoteItem = (id: number, enabled: boolean = true) => {
  return useQuery<QuoteItem>({
    queryKey: QUOTE_ITEMS_QUERY_KEYS.detail(id),
    queryFn: () => quoteItemsService.getQuoteItemById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Create Quote Item Mutation
 */
export const useCreateQuoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation<QuoteItem, Error, CreateQuoteItemRequest>({
    mutationFn: (item: CreateQuoteItemRequest) =>
        quoteItemsService.createQuoteItem(item),
    onSuccess: (newItem, variables) => {
      // Invalidate and refetch quote items list
      queryClient.invalidateQueries({
        queryKey: QUOTE_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate the specific quote's items
      queryClient.invalidateQueries({
        queryKey: [...QUOTE_ITEMS_QUERY_KEYS.all, "by-quote", variables.fkQuoteID],
      });

      // Add the new item to cache
      queryClient.setQueryData(
          QUOTE_ITEMS_QUERY_KEYS.detail(newItem.pk_quote_item_id),
          newItem
      );
    },
    onError: (error) => {
      console.error("Failed to create quote item:", error);
    },
  });
};

/**
 * Update Quote Item Mutation
 */
export const useUpdateQuoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation<QuoteItem, Error, { id: number; item: UpdateQuoteItemRequest }>({
    mutationFn: ({ id, item }: { id: number; item: UpdateQuoteItemRequest }) =>
        quoteItemsService.updateQuoteItem(id, item),
    onSuccess: (updatedItem, variables) => {
      // Update the specific item in cache
      queryClient.setQueryData(
          QUOTE_ITEMS_QUERY_KEYS.detail(variables.id),
          updatedItem
      );

      // Invalidate quote items list to refetch
      queryClient.invalidateQueries({
        queryKey: QUOTE_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate the specific quote's items if we have quote data
      if (updatedItem.quote_data?.pk_quote_id) {
        queryClient.invalidateQueries({
          queryKey: [...QUOTE_ITEMS_QUERY_KEYS.all, "by-quote", updatedItem.quote_data.pk_quote_id],
        });
      }
    },
    onError: (error) => {
      console.error("Failed to update quote item:", error);
    },
  });
};

/**
 * Delete Quote Item Mutation
 */
export const useDeleteQuoteItem = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number>({
    mutationFn: (id: number) => quoteItemsService.deleteQuoteItem(id),
    onSuccess: (deletedItem, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: QUOTE_ITEMS_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate quote items list
      queryClient.invalidateQueries({
        queryKey: QUOTE_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate all by-quote queries since we don't know which quote this item belonged to
      queryClient.invalidateQueries({
        queryKey: [...QUOTE_ITEMS_QUERY_KEYS.all, "by-quote"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete quote item:", error);
    },
  });
};

/**
 * Bulk Create Quote Items Mutation
 */
export const useBulkCreateQuoteItems = () => {
  const queryClient = useQueryClient();

  return useMutation<QuoteItem[], Error, CreateQuoteItemRequest[]>({
    mutationFn: (items: CreateQuoteItemRequest[]) =>
        quoteItemsService.bulkCreateQuoteItems(items),
    onSuccess: (newItems, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: QUOTE_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate by-quote queries for affected quotes
      const affectedQuotes = [...new Set(variables.map(item => item.fkQuoteID))];
      affectedQuotes.forEach(quoteId => {
        queryClient.invalidateQueries({
          queryKey: [...QUOTE_ITEMS_QUERY_KEYS.all, "by-quote", quoteId],
        });
      });

      // Add new items to cache
      newItems.forEach(item => {
        queryClient.setQueryData(
            QUOTE_ITEMS_QUERY_KEYS.detail(item.pk_quote_item_id),
            item
        );
      });
    },
    onError: (error) => {
      console.error("Failed to bulk create quote items:", error);
    },
  });
};

/**
 * Bulk Update Quote Items Mutation
 */
export const useBulkUpdateQuoteItems = () => {
  const queryClient = useQueryClient();

  return useMutation<QuoteItem[], Error, { id: number; item: UpdateQuoteItemRequest }[]>({
    mutationFn: (updates: { id: number; item: UpdateQuoteItemRequest }[]) =>
        quoteItemsService.bulkUpdateQuoteItems(updates),
    onSuccess: (updatedItems, variables) => {
      // Update items in cache
      updatedItems.forEach((item, index) => {
        queryClient.setQueryData(
            QUOTE_ITEMS_QUERY_KEYS.detail(variables[index].id),
            item
        );
      });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: QUOTE_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate by-quote queries
      const affectedQuotes = [
        ...new Set(
            updatedItems
                .map(item => item.quote_data?.pk_quote_id)
                .filter(Boolean) as number[]
        )
      ];

      affectedQuotes.forEach(quoteId => {
        queryClient.invalidateQueries({
          queryKey: [...QUOTE_ITEMS_QUERY_KEYS.all, "by-quote", quoteId],
        });
      });
    },
    onError: (error) => {
      console.error("Failed to bulk update quote items:", error);
    },
  });
};

/**
 * Bulk Delete Quote Items Mutation
 */
export const useBulkDeleteQuoteItems = () => {
  const queryClient = useQueryClient();

  return useMutation<any[], Error, number[]>({
    mutationFn: (ids: number[]) => quoteItemsService.bulkDeleteQuoteItems(ids),
    onSuccess: (deletedItems, deletedIds) => {
      // Remove from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({
          queryKey: QUOTE_ITEMS_QUERY_KEYS.detail(id),
        });
      });

      // Invalidate lists and by-quote queries
      queryClient.invalidateQueries({
        queryKey: QUOTE_ITEMS_QUERY_KEYS.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: [...QUOTE_ITEMS_QUERY_KEYS.all, "by-quote"],
      });
    },
    onError: (error) => {
      console.error("Failed to bulk delete quote items:", error);
    },
  });
};

/**
 * Prefetch Hook
 */
export const usePrefetchQuoteItem = () => {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: QUOTE_ITEMS_QUERY_KEYS.detail(id),
      queryFn: () => quoteItemsService.getQuoteItemById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Prefetch Quote Items by Quote ID
 */
export const usePrefetchQuoteItemsByQuoteId = () => {
  const queryClient = useQueryClient();

  return (quoteId: number, params: { page?: number; limit?: number } = {}) => {
    queryClient.prefetchQuery({
      queryKey: QUOTE_ITEMS_QUERY_KEYS.byQuote(quoteId, params),
      queryFn: () => quoteItemsService.getQuoteItemsByQuoteId(quoteId, params),
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Infinite Query Hook for Quote Items
 */
export const useInfiniteQuoteItems = (params: Omit<QuoteItemsQueryParams, 'page'> = {}) => {
  return useInfiniteQuery<QuoteItemsResponse, Error>({
    queryKey: [...QUOTE_ITEMS_QUERY_KEYS.lists(), "infinite", params],
    queryFn: ({ pageParam }) =>
        quoteItemsService.getQuoteItems({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: QuoteItemsResponse) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook for optimistic updates
 */
export const useOptimisticQuoteItemUpdate = () => {
  const queryClient = useQueryClient();

  const optimisticUpdate = (id: number, updates: Partial<QuoteItem>) => {
    queryClient.setQueryData(
        QUOTE_ITEMS_QUERY_KEYS.detail(id),
        (oldData: QuoteItem | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updates };
        }
    );
  };

  const revertOptimisticUpdate = (id: number) => {
    queryClient.invalidateQueries({
      queryKey: QUOTE_ITEMS_QUERY_KEYS.detail(id),
    });
  };

  return { optimisticUpdate, revertOptimisticUpdate };
};

/**
 * Hook to get quote items statistics
 */
export const useQuoteItemsStats = (quoteId?: number) => {
  const { data } = useQuoteItemsByQuoteId(quoteId || 0, {}, !!quoteId);

  return React.useMemo(() => {
    if (!data?.items) {
      return {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        averagePrice: 0,
      };
    }

    const totalItems = data.items.length;
    const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = data.items.reduce((sum, item) => sum + (item.quantity * parseFloat(`${item.unit_price}`)), 0);
    const averagePrice = totalItems > 0 ? totalValue / totalQuantity : 0;

    return {
      totalItems,
      totalQuantity,
      totalValue,
      averagePrice,
    };
  }, [data]);
};

/**
 * Get Quote Totals by Quote ID Hook
 */
export const useQuoteTotals = (quoteId: number, enabled: boolean = true) => {
  return useQuery<QuoteTotals>({
    queryKey: QUOTE_ITEMS_QUERY_KEYS.totals(quoteId),
    queryFn: () => quoteItemsService.getQuoteTotals(quoteId),
    enabled: enabled && !!quoteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};
