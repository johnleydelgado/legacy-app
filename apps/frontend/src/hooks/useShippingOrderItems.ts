// hooks/useShippingOrderItems.ts
import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { shippingOrderItemsService } from "@/services/shipping-order-items";
import {
  ShippingOrderItem,
  ShippingOrderItemsResponse,
  ShippingOrderItemsQueryParams,
  CreateShippingOrderItemRequest,
  UpdateShippingOrderItemRequest,
  ShippingOrderTotals,
} from "@/services/shipping-order-items/types";

// Query Keys
export const SHIPPING_ORDER_ITEMS_QUERY_KEYS = {
  all: ["shipping-order-items"] as const,
  lists: () => [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all, "list"] as const,
  list: (params: ShippingOrderItemsQueryParams) =>
    [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.lists(), params] as const,
  details: () => [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) =>
    [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.details(), id] as const,
  byShippingOrder: (
    shippingOrderId: number,
    params?: { page?: number; limit?: number }
  ) =>
    [
      ...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all,
      "by-shipping-order",
      shippingOrderId,
      params,
    ] as const,
  totals: (shippingOrderId: number) =>
    [
      ...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all,
      "totals",
      shippingOrderId,
    ] as const,
};

/**
 * Get Shipping Order Items Hook
 */
export const useShippingOrderItems = (
  params: ShippingOrderItemsQueryParams = {}
) => {
  return useQuery<ShippingOrderItemsResponse>({
    queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.list(params),
    queryFn: () => shippingOrderItemsService.getShippingOrderItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get Shipping Order Items by Shipping Order ID Hook
 */
export const useShippingOrderItemsByShippingOrderId = (
  shippingOrderId: number,
  params: { page?: number; limit?: number } = {},
  enabled: boolean = true
) => {
  return useQuery<ShippingOrderItemsResponse>({
    queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.byShippingOrder(
      shippingOrderId,
      params
    ),
    queryFn: () =>
      shippingOrderItemsService.getShippingOrderItemsByShippingOrderId(
        shippingOrderId,
        params
      ),
    enabled: enabled && !!shippingOrderId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get Shipping Order Item by ID Hook
 */
export const useShippingOrderItem = (id: number, enabled: boolean = true) => {
  return useQuery<ShippingOrderItem>({
    queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(id),
    queryFn: () => shippingOrderItemsService.getShippingOrderItemById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Create Shipping Order Item Mutation
 */
export const useCreateShippingOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation<ShippingOrderItem, Error, CreateShippingOrderItemRequest>({
    mutationFn: (item: CreateShippingOrderItemRequest) =>
      shippingOrderItemsService.createShippingOrderItem(item),
    onSuccess: (newItem, variables) => {
      // Invalidate and refetch shipping order items list
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate the specific shipping order's items
      queryClient.invalidateQueries({
        queryKey: [
          ...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all,
          "by-shipping-order",
          variables.fkShippingOrderID,
        ],
      });

      // Invalidate totals for the shipping order
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.totals(
          variables.fkShippingOrderID
        ),
      });

      // Add the new item to cache
      queryClient.setQueryData(
        SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(
          newItem.pk_shipping_order_item_id
        ),
        newItem
      );
    },
    onError: (error) => {
      console.error("Failed to create shipping order item:", error);
    },
  });
};

/**
 * Update Shipping Order Item Mutation
 */
export const useUpdateShippingOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ShippingOrderItem,
    Error,
    { id: number; item: UpdateShippingOrderItemRequest }
  >({
    mutationFn: ({
      id,
      item,
    }: {
      id: number;
      item: UpdateShippingOrderItemRequest;
    }) => shippingOrderItemsService.updateShippingOrderItem(id, item),
    onSuccess: (updatedItem, variables) => {
      // Update the specific item in cache
      queryClient.setQueryData(
        SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(variables.id),
        updatedItem
      );

      // Invalidate shipping order items list to refetch
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate the specific shipping order's items if we have shipping order data
      if (updatedItem.shipping_order_data?.pk_shipping_order_id) {
        queryClient.invalidateQueries({
          queryKey: [
            ...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all,
            "by-shipping-order",
            updatedItem.shipping_order_data.pk_shipping_order_id,
          ],
        });

        // Invalidate totals for the shipping order
        queryClient.invalidateQueries({
          queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.totals(
            updatedItem.shipping_order_data.pk_shipping_order_id
          ),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to update shipping order item:", error);
    },
  });
};

/**
 * Delete Shipping Order Item Mutation
 */
export const useDeleteShippingOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number>({
    mutationFn: (id: number) =>
      shippingOrderItemsService.deleteShippingOrderItem(id),
    onSuccess: (deletedItem, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate shipping order items list
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate all by-shipping-order queries since we don't know which shipping order this item belonged to
      queryClient.invalidateQueries({
        queryKey: [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all, "by-shipping-order"],
      });

      // Invalidate all totals queries since we don't know which shipping order this item belonged to
      queryClient.invalidateQueries({
        queryKey: [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all, "totals"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete shipping order item:", error);
    },
  });
};

/**
 * Delete Shipping Order Items by Shipping Order ID Mutation
 */
export const useDeleteShippingOrderItemsByShippingOrderId = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number>({
    mutationFn: (shippingOrderId: number) =>
      shippingOrderItemsService.deleteShippingOrderItemsByShippingOrderId(
        shippingOrderId
      ),
    onSuccess: (deletedItems, shippingOrderId) => {
      // Invalidate shipping order items list
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate the specific shipping order's items
      queryClient.invalidateQueries({
        queryKey: [
          ...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all,
          "by-shipping-order",
          shippingOrderId,
        ],
      });

      // Invalidate totals for the shipping order
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.totals(shippingOrderId),
      });
    },
    onError: (error) => {
      console.error(
        "Failed to delete shipping order items by shipping order ID:",
        error
      );
    },
  });
};

/**
 * Bulk Create Shipping Order Items Mutation
 */
export const useBulkCreateShippingOrderItems = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ShippingOrderItem[],
    Error,
    CreateShippingOrderItemRequest[]
  >({
    mutationFn: (items: CreateShippingOrderItemRequest[]) =>
      shippingOrderItemsService.bulkCreateShippingOrderItems(items),
    onSuccess: (newItems, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate by-shipping-order queries for affected shipping orders
      const affectedShippingOrders = [
        ...new Set(variables.map((item) => item.fkShippingOrderID)),
      ];
      affectedShippingOrders.forEach((shippingOrderId) => {
        queryClient.invalidateQueries({
          queryKey: [
            ...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all,
            "by-shipping-order",
            shippingOrderId,
          ],
        });

        // Invalidate totals for the shipping order
        queryClient.invalidateQueries({
          queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.totals(shippingOrderId),
        });
      });

      // Add new items to cache
      newItems.forEach((item) => {
        queryClient.setQueryData(
          SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(
            item.pk_shipping_order_item_id
          ),
          item
        );
      });
    },
    onError: (error) => {
      console.error("Failed to bulk create shipping order items:", error);
    },
  });
};

/**
 * Bulk Update Shipping Order Items Mutation
 */
export const useBulkUpdateShippingOrderItems = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ShippingOrderItem[],
    Error,
    { id: number; item: UpdateShippingOrderItemRequest }[]
  >({
    mutationFn: (
      updates: { id: number; item: UpdateShippingOrderItemRequest }[]
    ) => shippingOrderItemsService.bulkUpdateShippingOrderItems(updates),
    onSuccess: (updatedItems, variables) => {
      // Update items in cache
      updatedItems.forEach((item) => {
        queryClient.setQueryData(
          SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(
            item.pk_shipping_order_item_id
          ),
          item
        );
      });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate affected shipping orders
      const affectedShippingOrders = [
        ...new Set(
          updatedItems.map(
            (item) => item.shipping_order_data.pk_shipping_order_id
          )
        ),
      ];
      affectedShippingOrders.forEach((shippingOrderId) => {
        queryClient.invalidateQueries({
          queryKey: [
            ...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all,
            "by-shipping-order",
            shippingOrderId,
          ],
        });

        // Invalidate totals for the shipping order
        queryClient.invalidateQueries({
          queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.totals(shippingOrderId),
        });
      });
    },
    onError: (error) => {
      console.error("Failed to bulk update shipping order items:", error);
    },
  });
};

/**
 * Bulk Delete Shipping Order Items Mutation
 */
export const useBulkDeleteShippingOrderItems = () => {
  const queryClient = useQueryClient();

  return useMutation<any[], Error, number[]>({
    mutationFn: (ids: number[]) =>
      shippingOrderItemsService.bulkDeleteShippingOrderItems(ids),
    onSuccess: (deletedItems, deletedIds) => {
      // Remove items from cache
      deletedIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(id),
        });
      });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.lists(),
      });

      // Invalidate all by-shipping-order queries since we don't know which shipping orders these items belonged to
      queryClient.invalidateQueries({
        queryKey: [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all, "by-shipping-order"],
      });

      // Invalidate all totals queries since we don't know which shipping orders these items belonged to
      queryClient.invalidateQueries({
        queryKey: [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all, "totals"],
      });
    },
    onError: (error) => {
      console.error("Failed to bulk delete shipping order items:", error);
    },
  });
};

/**
 * Prefetch Shipping Order Item Hook
 */
export const usePrefetchShippingOrderItem = () => {
  const queryClient = useQueryClient();

  return React.useCallback(
    (id: number) => {
      queryClient.prefetchQuery({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(id),
        queryFn: () => shippingOrderItemsService.getShippingOrderItemById(id),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
};

/**
 * Prefetch Shipping Order Items by Shipping Order ID Hook
 */
export const usePrefetchShippingOrderItemsByShippingOrderId = () => {
  const queryClient = useQueryClient();

  return React.useCallback(
    (
      shippingOrderId: number,
      params: { page?: number; limit?: number } = {}
    ) => {
      queryClient.prefetchQuery({
        queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.byShippingOrder(
          shippingOrderId,
          params
        ),
        queryFn: () =>
          shippingOrderItemsService.getShippingOrderItemsByShippingOrderId(
            shippingOrderId,
            params
          ),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
};

/**
 * Infinite Query Hook for Shipping Order Items
 */
export const useInfiniteShippingOrderItems = (
  params: Omit<ShippingOrderItemsQueryParams, "page"> = {}
) => {
  return useInfiniteQuery<ShippingOrderItemsResponse>({
    queryKey: [...SHIPPING_ORDER_ITEMS_QUERY_KEYS.all, "infinite", params],
    queryFn: ({ pageParam }) =>
      shippingOrderItemsService.getShippingOrderItems({
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.meta.currentPage < lastPage.meta.totalPages
        ? lastPage.meta.currentPage + 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Optimistic Update Hook for Shipping Order Items
 */
export const useOptimisticShippingOrderItemUpdate = () => {
  const queryClient = useQueryClient();

  const optimisticUpdate = (
    id: number,
    updates: Partial<ShippingOrderItem>
  ) => {
    queryClient.setQueryData(
      SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(id),
      (oldData: ShippingOrderItem) => ({
        ...oldData,
        ...updates,
      })
    );
  };

  const revertOptimisticUpdate = (id: number) => {
    queryClient.invalidateQueries({
      queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.detail(id),
    });
  };

  return { optimisticUpdate, revertOptimisticUpdate };
};

/**
 * Shipping Order Items Stats Hook
 */
export const useShippingOrderItemsStats = (shippingOrderId?: number) => {
  const { data: items } = useShippingOrderItemsByShippingOrderId(
    shippingOrderId!,
    { page: 1, limit: 1000 }, // Get all items for stats
    !!shippingOrderId
  );

  return React.useMemo(() => {
    if (!items?.items) return null;

    const totalItems = items.items.length;
    const totalQuantity = items.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      totalItems,
      totalQuantity,
    };
  }, [items]);
};

/**
 * Get Shipping Order Totals Hook
 */
export const useShippingOrderTotals = (
  shippingOrderId: number,
  enabled: boolean = true
) => {
  return useQuery<ShippingOrderTotals>({
    queryKey: SHIPPING_ORDER_ITEMS_QUERY_KEYS.totals(shippingOrderId),
    queryFn: () =>
      shippingOrderItemsService.getShippingOrderTotals(shippingOrderId),
    enabled: enabled && !!shippingOrderId,
    staleTime: 2 * 60 * 1000, // 2 minutes for totals
    retry: 3,
  });
};
