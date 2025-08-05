// hooks/useShippingPackageSpecItems.ts
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shippingPackageSpecItemsService } from "@/services/shipping-package-spec-items";
import {
  ShippingPackageSpecItem,
  ShippingPackageSpecItemsResponse,
  ShippingPackageSpecItemsQueryParams,
  CreateShippingPackageSpecItemRequest,
  UpdateShippingPackageSpecItemRequest,
  PackageItemSummary,
  ItemPackageSummary,
} from "@/services/shipping-package-spec-items/types";

// Query Keys
export const SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS = {
  all: ["shipping-package-spec-items"] as const,
  lists: () => [...SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all, "list"] as const,
  list: (params: ShippingPackageSpecItemsQueryParams) =>
    [...SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.lists(), params] as const,
  details: () =>
    [...SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) =>
    [...SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.details(), id] as const,
  byPackageSpec: (
    packageSpecId: number,
    params?: { page?: number; limit?: number }
  ) =>
    [
      ...SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      "by-package-spec",
      packageSpecId,
      params,
    ] as const,
  byShippingOrderItem: (
    shippingOrderItemId: number,
    params?: { page?: number; limit?: number }
  ) =>
    [
      ...SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      "by-shipping-order-item",
      shippingOrderItemId,
      params,
    ] as const,
  packageSummary: (packageSpecId: number) =>
    [
      ...SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      "package-summary",
      packageSpecId,
    ] as const,
  itemSummary: (shippingOrderItemId: number) =>
    [
      ...SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      "item-summary",
      shippingOrderItemId,
    ] as const,
};

// Hooks
export const useShippingPackageSpecItems = (
  params: ShippingPackageSpecItemsQueryParams = {},
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.list(params),
    queryFn: () =>
      shippingPackageSpecItemsService.getShippingPackageSpecItems(params),
    enabled: options?.enabled ?? true,
  });
};

export const useShippingPackageSpecItem = (
  id: number,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.detail(id),
    queryFn: () =>
      shippingPackageSpecItemsService.getShippingPackageSpecItem(id),
    enabled: options?.enabled ?? true,
  });
};

export const useShippingPackageSpecItemsByPackageSpec = (
  packageSpecId: number,
  params: { page?: number; limit?: number } = {},
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.byPackageSpec(
      packageSpecId,
      params
    ),
    queryFn: () =>
      shippingPackageSpecItemsService.getShippingPackageSpecItemsByPackageSpecId(
        packageSpecId,
        params
      ),
    enabled: options?.enabled ?? true,
  });
};

export const useShippingPackageSpecItemsByShippingOrderItem = (
  shippingOrderItemId: number,
  params: { page?: number; limit?: number } = {},
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.byShippingOrderItem(
      shippingOrderItemId,
      params
    ),
    queryFn: () =>
      shippingPackageSpecItemsService.getShippingPackageSpecItemsByShippingOrderItemId(
        shippingOrderItemId,
        params
      ),
    enabled: options?.enabled ?? true,
  });
};

export const usePackageItemSummary = (
  packageSpecId: number,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey:
      SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.packageSummary(packageSpecId),
    queryFn: () =>
      shippingPackageSpecItemsService.getPackageItemSummary(packageSpecId),
    enabled: options?.enabled ?? true,
  });
};

export const useItemPackageSummary = (
  shippingOrderItemId: number,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey:
      SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.itemSummary(shippingOrderItemId),
    queryFn: () =>
      shippingPackageSpecItemsService.getItemPackageSummary(
        shippingOrderItemId
      ),
    enabled: options?.enabled ?? true,
  });
};

// Mutations
export const useCreateShippingPackageSpecItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShippingPackageSpecItemRequest) =>
      shippingPackageSpecItemsService.createShippingPackageSpecItem(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      });
    },
  });
};

export const useUpdateShippingPackageSpecItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateShippingPackageSpecItemRequest;
    }) =>
      shippingPackageSpecItemsService.updateShippingPackageSpecItem(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      });
    },
  });
};

export const useDeleteShippingPackageSpecItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      shippingPackageSpecItemsService.deleteShippingPackageSpecItem(id),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      });
    },
  });
};

export const useDeleteShippingPackageSpecItemsByPackageSpec = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageSpecId: number) =>
      shippingPackageSpecItemsService.deleteShippingPackageSpecItemsByPackageSpecId(
        packageSpecId
      ),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      });
    },
  });
};

export const useDeleteShippingPackageSpecItemsByShippingOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shippingOrderItemId: number) =>
      shippingPackageSpecItemsService.deleteShippingPackageSpecItemsByShippingOrderItemId(
        shippingOrderItemId
      ),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: SHIPPING_PACKAGE_SPEC_ITEMS_QUERY_KEYS.all,
      });
    },
  });
};
