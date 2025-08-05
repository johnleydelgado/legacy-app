// hooks/useShippingOrders.ts
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shippingOrdersService } from "@/services/shipping-orders";
import {
  ShippingOrderTypes,
  ShippingOrdersResponse,
  ShippingOrdersSearchResponse,
  ShippingOrdersQueryParams,
  ShippingOrdersSearchParams,
  CreateShippingOrderRequest,
  UpdateShippingOrderRequest,
  ShippingOrdersDashboardSummaryResponse,
} from "@/services/shipping-orders/types";

// Query Keys
export const SHIPPING_ORDERS_QUERY_KEYS = {
  all: ["shipping-orders"] as const,
  lists: () => [...SHIPPING_ORDERS_QUERY_KEYS.all, "list"] as const,
  list: (params: ShippingOrdersQueryParams) =>
    [...SHIPPING_ORDERS_QUERY_KEYS.lists(), params] as const,
  search: () => [...SHIPPING_ORDERS_QUERY_KEYS.all, "search"] as const,
  searchQuery: (params: ShippingOrdersSearchParams) =>
    [...SHIPPING_ORDERS_QUERY_KEYS.search(), params] as const,
  details: () => [...SHIPPING_ORDERS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) =>
    [...SHIPPING_ORDERS_QUERY_KEYS.details(), id] as const,
  byCustomer: () => [...SHIPPING_ORDERS_QUERY_KEYS.all, "by-customer"] as const,
  customerShippingOrders: (customerId: number, params?: any) =>
    [...SHIPPING_ORDERS_QUERY_KEYS.byCustomer(), customerId, params] as const,
  dashboard: () => [...SHIPPING_ORDERS_QUERY_KEYS.all, "dashboard"] as const,
  dashboardSummary: () =>
    [...SHIPPING_ORDERS_QUERY_KEYS.dashboard(), "summary"] as const,
  status: () => [...SHIPPING_ORDERS_QUERY_KEYS.all, "status"] as const,
};

// Get Shipping Orders Hook (handles both regular list and search)
export const useShippingOrders = (params: ShippingOrdersQueryParams = {}) => {
  // If there's a search term, use the search endpoint
  const isSearching = !!params.search;

  // @ts-ignore
  return useQuery({
    queryKey: isSearching
      ? SHIPPING_ORDERS_QUERY_KEYS.searchQuery({
          q: params.search!,
          page: params.page,
          limit: params.limit,
        })
      : SHIPPING_ORDERS_QUERY_KEYS.list(params),
    queryFn: () => {
      if (isSearching) {
        return shippingOrdersService.searchShippingOrders({
          q: params.search!,
          page: params.page,
          limit: params.limit,
        });
      }
      return shippingOrdersService.getShippingOrders(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
    // Enable the query even when search is empty to show all shipping orders
    enabled: true,
  });
};

// Dedicated Search Hook (alternative approach)
export const useSearchShippingOrders = (
  params: ShippingOrdersSearchParams,
  enabled: boolean = true
) => {
  // @ts-ignore
  return useQuery({
    queryKey: SHIPPING_ORDERS_QUERY_KEYS.searchQuery(params),
    queryFn: () => shippingOrdersService.searchShippingOrders(params),
    enabled: enabled && !!params.q.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Get Shipping Order by ID Hook
export const useShippingOrder = (id: number, enabled: boolean = true) => {
  // @ts-ignore
  return useQuery({
    queryKey: SHIPPING_ORDERS_QUERY_KEYS.detail(id),
    queryFn: () => shippingOrdersService.getShippingOrderById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

// Get Shipping Orders by Customer ID Hook
export const useShippingOrdersByCustomerId = (
  customerId: number,
  params: { page?: number; limit?: number } = {},
  enabled: boolean = true
) => {
  // @ts-ignore
  return useQuery({
    queryKey: SHIPPING_ORDERS_QUERY_KEYS.customerShippingOrders(
      customerId,
      params
    ),
    queryFn: () =>
      shippingOrdersService.getShippingOrdersByCustomerId(customerId, params),
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

// Dashboard Summary Hook
export const useShippingOrdersDashboardSummary = (enabled: boolean = true) => {
  // @ts-ignore
  return useQuery({
    queryKey: SHIPPING_ORDERS_QUERY_KEYS.dashboardSummary(),
    queryFn: () => shippingOrdersService.getDashboardSummary(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
    retry: 3,
    refetchOnWindowFocus: true, // Refetch when user returns to the dashboard
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};

// Create Shipping Order Mutation
export const useCreateShippingOrder = () => {
  const queryClient = useQueryClient();

  // @ts-ignore
  return useMutation({
    mutationFn: (shippingOrder: CreateShippingOrderRequest) =>
      shippingOrdersService.createShippingOrder(shippingOrder),
    onSuccess: (newShippingOrder) => {
      // Invalidate and refetch shipping orders list
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.lists(),
      });
      // Also invalidate search results
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.search(),
      });
      // Invalidate dashboard summary as new shipping order affects totals
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.dashboardSummary(),
      });
      // Invalidate status data
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.status(),
      });

      // Add the new shipping order to cache
      queryClient.setQueryData(
        SHIPPING_ORDERS_QUERY_KEYS.detail(
          newShippingOrder.pk_shipping_order_id
        ),
        newShippingOrder
      );
    },
    onError: (error) => {
      console.error("Failed to create shipping order:", error);
    },
  });
};

// Update Shipping Order Mutation
export const useUpdateShippingOrder = () => {
  const queryClient = useQueryClient();

  // @ts-ignore
  return useMutation({
    mutationFn: ({
      id,
      shippingOrder,
    }: {
      id: number;
      shippingOrder: UpdateShippingOrderRequest;
    }) => shippingOrdersService.updateShippingOrder(id, shippingOrder),
    onSuccess: (updatedShippingOrder, variables) => {
      // Update the specific shipping order in cache
      queryClient.setQueryData(
        SHIPPING_ORDERS_QUERY_KEYS.detail(variables.id),
        updatedShippingOrder
      );

      // Invalidate shipping orders list to refetch
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.lists(),
      });
      // Also invalidate search results
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.search(),
      });
      // Invalidate dashboard summary as updated shipping order may affect totals/statuses
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.dashboardSummary(),
      });
      // Invalidate status data
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.status(),
      });
    },
    onError: (error) => {
      console.error("Failed to update shipping order:", error);
    },
  });
};

// Delete Shipping Order Mutation
export const useDeleteShippingOrder = () => {
  const queryClient = useQueryClient();

  // @ts-ignore
  return useMutation({
    mutationFn: (id: number) => shippingOrdersService.deleteShippingOrder(id),
    onMutate: async (deletedId: number) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.detail(deletedId),
      });

      // Snapshot the previous value
      const previousShippingOrder = queryClient.getQueryData(
        SHIPPING_ORDERS_QUERY_KEYS.detail(deletedId)
      );

      // Optimistically update the lists by removing the deleted item
      queryClient.setQueriesData(
        { queryKey: SHIPPING_ORDERS_QUERY_KEYS.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.filter(
              (item: ShippingOrderTypes) =>
                item.pk_shipping_order_id !== deletedId
            ),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousShippingOrder };
    },
    onError: (err, deletedId, context) => {
      // If the mutation fails, use the context we returned to roll back
      if (context?.previousShippingOrder) {
        queryClient.setQueryData(
          SHIPPING_ORDERS_QUERY_KEYS.detail(deletedId),
          context.previousShippingOrder
        );
      }
    },
    onSettled: (data, error, deletedId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.search(),
      });
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.dashboardSummary(),
      });
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.status(),
      });
      queryClient.removeQueries({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.detail(deletedId),
      });
    },
  });
};

// Prefetch Shipping Order Hook
export const usePrefetchShippingOrder = () => {
  const queryClient = useQueryClient();

  return React.useCallback(
    (id: number) => {
      queryClient.prefetchQuery({
        queryKey: SHIPPING_ORDERS_QUERY_KEYS.detail(id),
        queryFn: () => shippingOrdersService.getShippingOrderById(id),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
};

// Prefetch Dashboard Summary Hook
export const usePrefetchDashboardSummary = () => {
  const queryClient = useQueryClient();

  return React.useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: SHIPPING_ORDERS_QUERY_KEYS.dashboardSummary(),
      queryFn: () => shippingOrdersService.getDashboardSummary(),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);
};

// Invalidate All Shipping Orders Data Hook
export const useInvalidateShippingOrdersData = () => {
  const queryClient = useQueryClient();

  return React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SHIPPING_ORDERS_QUERY_KEYS.all });
  }, [queryClient]);
};
