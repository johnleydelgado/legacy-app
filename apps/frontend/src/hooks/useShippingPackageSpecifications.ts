// hooks/useShippingPackageSpecifications.ts
import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { shippingPackageSpecificationsService } from "@/services/shipping-package-specifications";
import {
  ShippingPackageSpecification,
  ShippingPackageSpecificationsResponse,
  ShippingPackageSpecificationsQueryParams,
  CreateShippingPackageSpecificationsRequest,
  UpdateShippingPackageSpecificationsRequest,
  ShippingPackageSpecificationStats,
} from "@/services/shipping-package-specifications/types";

// Query Keys
export const SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS = {
  all: ["shipping-package-specifications"] as const,
  lists: () =>
    [...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all, "list"] as const,
  list: (params: ShippingPackageSpecificationsQueryParams) =>
    [...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.lists(), params] as const,
  details: () =>
    [...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) =>
    [...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.details(), id] as const,
  byShippingOrder: (
    shippingOrderId: number,
    params?: { page?: number; limit?: number }
  ) =>
    [
      ...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all,
      "by-shipping-order",
      shippingOrderId,
      params,
    ] as const,
  // Removed byShippingOrderItem key as shipping_package_specifications no longer link to order items
  stats: (shippingOrderId: number) =>
    [
      ...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all,
      "stats",
      shippingOrderId,
    ] as const,
};

/**
 * Get Shipping Package Specifications Hook
 */
export const useShippingPackageSpecifications = (
  params: ShippingPackageSpecificationsQueryParams = {}
) => {
  return useQuery<ShippingPackageSpecificationsResponse>({
    queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.list(params),
    queryFn: () =>
      shippingPackageSpecificationsService.getShippingPackageSpecifications(
        params
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get Shipping Package Specifications by Shipping Order ID Hook
 */
export const useShippingPackageSpecificationsByShippingOrderId = (
  shippingOrderId: number,
  params: { page?: number; limit?: number } = {},
  enabled: boolean = true
) => {
  return useQuery<ShippingPackageSpecificationsResponse>({
    queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.byShippingOrder(
      shippingOrderId,
      params
    ),
    queryFn: () =>
      shippingPackageSpecificationsService.getShippingPackageSpecificationsByShippingOrderId(
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
 * Get Shipping Package Specification by ID Hook
 */
export const useShippingPackageSpecification = (
  id: number,
  enabled: boolean = true
) => {
  return useQuery<ShippingPackageSpecification>({
    queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(id),
    queryFn: () =>
      shippingPackageSpecificationsService.getShippingPackageSpecificationById(
        id
      ),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Create Shipping Package Specification Mutation
 */
export const useCreateShippingPackageSpecification = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ShippingPackageSpecification,
    Error,
    CreateShippingPackageSpecificationsRequest
  >({
    mutationFn: (spec: CreateShippingPackageSpecificationsRequest) =>
      shippingPackageSpecificationsService.createShippingPackageSpecification(
        spec
      ),
    onSuccess: (newSpec, variables) => {
      // Invalidate and refetch shipping package specifications list
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.lists(),
      });

      // Invalidate the specific shipping order's package specifications
      queryClient.invalidateQueries({
        queryKey: [
          ...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all,
          "by-shipping-order",
          variables.fkShippingOrderId,
        ],
      });

      // Removed invalidation for by-shipping-order-item queries

      // Invalidate stats for the shipping order
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.stats(
          variables.fkShippingOrderId
        ),
      });

      // Add the new spec to cache
      queryClient.setQueryData(
        SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(
          newSpec.pk_shipping_package_spec_id
        ),
        newSpec
      );
    },
    onError: (error) => {
      console.error("Failed to create shipping package specification:", error);
    },
  });
};

/**
 * Update Shipping Package Specification Mutation
 */
export const useUpdateShippingPackageSpecification = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ShippingPackageSpecification,
    Error,
    { id: number; spec: UpdateShippingPackageSpecificationsRequest }
  >({
    mutationFn: ({
      id,
      spec,
    }: {
      id: number;
      spec: UpdateShippingPackageSpecificationsRequest;
    }) =>
      shippingPackageSpecificationsService.updateShippingPackageSpecification(
        id,
        spec
      ),
    onSuccess: (updatedSpec, variables) => {
      // Update the specific spec in cache
      queryClient.setQueryData(
        SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(variables.id),
        updatedSpec
      );

      // Invalidate shipping package specifications list to refetch
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.lists(),
      });

      // Removed invalidation for by-shipping-order-item queries
    },
    onError: (error) => {
      console.error("Failed to update shipping package specification:", error);
    },
  });
};

/**
 * Delete Shipping Package Specification Mutation
 */
export const useDeleteShippingPackageSpecification = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number>({
    mutationFn: (id: number) =>
      shippingPackageSpecificationsService.deleteShippingPackageSpecification(
        id
      ),
    onSuccess: (deletedSpec, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate shipping package specifications list
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.lists(),
      });

      // Invalidate all by-shipping-order queries since we don't know which shipping order this spec belonged to
      queryClient.invalidateQueries({
        queryKey: [
          ...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all,
          "by-shipping-order",
        ],
      });

      // Removed invalidation for by-shipping-order-item queries

      // Invalidate all stats queries since we don't know which shipping order this spec belonged to
      queryClient.invalidateQueries({
        queryKey: [...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all, "stats"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete shipping package specification:", error);
    },
  });
};

/**
 * Delete Shipping Package Specifications by Shipping Order ID Mutation
 */
export const useDeleteShippingPackageSpecificationsByShippingOrderId = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number>({
    mutationFn: (shippingOrderId: number) =>
      shippingPackageSpecificationsService.deleteShippingPackageSpecificationsByShippingOrderId(
        shippingOrderId
      ),
    onSuccess: (deletedSpecs, shippingOrderId) => {
      // Invalidate shipping package specifications list
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.lists(),
      });

      // Invalidate the specific shipping order's package specifications
      queryClient.invalidateQueries({
        queryKey: [
          ...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all,
          "by-shipping-order",
          shippingOrderId,
        ],
      });

      // Invalidate stats for the shipping order
      queryClient.invalidateQueries({
        queryKey:
          SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.stats(shippingOrderId),
      });
    },
    onError: (error) => {
      console.error(
        "Failed to delete shipping package specifications by shipping order ID:",
        error
      );
    },
  });
};

/**
 * Bulk Create Shipping Package Specifications Mutation
 */
export const useBulkCreateShippingPackageSpecifications = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ShippingPackageSpecification[],
    Error,
    CreateShippingPackageSpecificationsRequest[]
  >({
    mutationFn: (specs: CreateShippingPackageSpecificationsRequest[]) =>
      shippingPackageSpecificationsService.bulkCreateShippingPackageSpecifications(
        specs
      ),
    onSuccess: (newSpecs, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.lists(),
      });

      // Invalidate by-shipping-order queries for affected shipping orders
      const affectedShippingOrders = [
        ...new Set(variables.map((spec) => spec.fkShippingOrderId)),
      ];
      affectedShippingOrders.forEach((shippingOrderId) => {
        queryClient.invalidateQueries({
          queryKey: [
            ...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all,
            "by-shipping-order",
            shippingOrderId,
          ],
        });

        // Invalidate stats for the shipping order
        queryClient.invalidateQueries({
          queryKey:
            SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.stats(shippingOrderId),
        });
      });

      // Removed invalidation for by-shipping-order-item queries

      // Add new specs to cache
      newSpecs.forEach((spec) => {
        queryClient.setQueryData(
          SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(
            spec.pk_shipping_package_spec_id
          ),
          spec
        );
      });
    },
    onError: (error) => {
      console.error(
        "Failed to bulk create shipping package specifications:",
        error
      );
    },
  });
};

/**
 * Bulk Update Shipping Package Specifications Mutation
 */
export const useBulkUpdateShippingPackageSpecifications = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ShippingPackageSpecification[],
    Error,
    { id: number; spec: UpdateShippingPackageSpecificationsRequest }[]
  >({
    mutationFn: (
      updates: {
        id: number;
        spec: UpdateShippingPackageSpecificationsRequest;
      }[]
    ) =>
      shippingPackageSpecificationsService.bulkUpdateShippingPackageSpecifications(
        updates
      ),
    onSuccess: (updatedSpecs, variables) => {
      // Update specs in cache
      updatedSpecs.forEach((spec) => {
        queryClient.setQueryData(
          SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(
            spec.pk_shipping_package_spec_id
          ),
          spec
        );
      });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.lists(),
      });

      // Invalidate affected shipping orders
      const affectedShippingOrders = [
        ...new Set(updatedSpecs.map((spec) => spec.fk_shipping_order_id)),
      ];
      affectedShippingOrders.forEach((shippingOrderId) => {
        queryClient.invalidateQueries({
          queryKey: [
            ...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all,
            "by-shipping-order",
            shippingOrderId,
          ],
        });

        // Invalidate stats for the shipping order
        queryClient.invalidateQueries({
          queryKey:
            SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.stats(shippingOrderId),
        });
      });

      // Removed invalidation for by-shipping-order-item queries
    },
    onError: (error) => {
      console.error(
        "Failed to bulk update shipping package specifications:",
        error
      );
    },
  });
};

/**
 * Get Shipping Package Specification Stats Hook
 */
export const useShippingPackageSpecificationStats = (
  shippingOrderId: number,
  enabled: boolean = true
) => {
  return useQuery<ShippingPackageSpecificationStats>({
    queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.stats(shippingOrderId),
    queryFn: () =>
      shippingPackageSpecificationsService.getShippingPackageSpecificationStats(
        shippingOrderId
      ),
    enabled: enabled && !!shippingOrderId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

/**
 * Prefetch Shipping Package Specification Hook
 */
export const usePrefetchShippingPackageSpecification = () => {
  const queryClient = useQueryClient();

  return React.useCallback(
    (id: number) => {
      queryClient.prefetchQuery({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(id),
        queryFn: () =>
          shippingPackageSpecificationsService.getShippingPackageSpecificationById(
            id
          ),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
};

/**
 * Prefetch Shipping Package Specifications by Shipping Order ID Hook
 */
export const usePrefetchShippingPackageSpecificationsByShippingOrderId = () => {
  const queryClient = useQueryClient();

  return React.useCallback(
    (
      shippingOrderId: number,
      params: { page?: number; limit?: number } = {}
    ) => {
      queryClient.prefetchQuery({
        queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.byShippingOrder(
          shippingOrderId,
          params
        ),
        queryFn: () =>
          shippingPackageSpecificationsService.getShippingPackageSpecificationsByShippingOrderId(
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
 * Infinite Query Hook for Shipping Package Specifications
 */
export const useInfiniteShippingPackageSpecifications = (
  params: Omit<ShippingPackageSpecificationsQueryParams, "page"> = {}
) => {
  return useInfiniteQuery<ShippingPackageSpecificationsResponse>({
    queryKey: [
      ...SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.all,
      "infinite",
      params,
    ],
    queryFn: ({ pageParam }) =>
      shippingPackageSpecificationsService.getShippingPackageSpecifications({
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
 * Optimistic Update Hook for Shipping Package Specifications
 */
export const useOptimisticShippingPackageSpecificationUpdate = () => {
  const queryClient = useQueryClient();

  const optimisticUpdate = (
    id: number,
    updates: Partial<ShippingPackageSpecification>
  ) => {
    queryClient.setQueryData(
      SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(id),
      (oldData: ShippingPackageSpecification) => ({
        ...oldData,
        ...updates,
      })
    );
  };

  const revertOptimisticUpdate = (id: number) => {
    queryClient.invalidateQueries({
      queryKey: SHIPPING_PACKAGE_SPECIFICATIONS_QUERY_KEYS.detail(id),
    });
  };

  return { optimisticUpdate, revertOptimisticUpdate };
};

/**
 * Shipping Package Specifications Summary Hook
 */
export const useShippingPackageSpecificationsSummary = (
  shippingOrderId?: number
) => {
  const { data: specs } = useShippingPackageSpecificationsByShippingOrderId(
    shippingOrderId!,
    { page: 1, limit: 1000 }, // Get all specs for summary
    !!shippingOrderId
  );

  return React.useMemo(() => {
    if (!specs?.items) return null;

    const totalPackages = specs.items.length;
    const totalWeight = specs.items.reduce((sum, spec) => sum + spec.weight, 0);
    const totalVolume = specs.items.reduce(
      (sum, spec) => sum + spec.length * spec.width * spec.height,
      0
    );

    return {
      totalPackages,
      totalWeight,
      totalVolume,
      averageWeight: totalPackages > 0 ? totalWeight / totalPackages : 0,
      averageVolume: totalPackages > 0 ? totalVolume / totalPackages : 0,
    };
  }, [specs]);
};
