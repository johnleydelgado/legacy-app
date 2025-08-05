import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { factoriesService } from "@/services/factories";
import {
  FactoriesQueryParams,
  FactoriesSearchParams,
  CreateFactoryDto,
  UpdateFactoryDto,
  Factory,
  FactoryDetail,
} from "@/services/factories/types";
import { toast } from "sonner";

// Query keys for caching
const FACTORIES_QUERY_KEYS = {
  all: ["factories"] as const,
  lists: () => [...FACTORIES_QUERY_KEYS.all, "list"] as const,
  list: (params: any) => [...FACTORIES_QUERY_KEYS.lists(), params] as const,
  details: () => [...FACTORIES_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...FACTORIES_QUERY_KEYS.details(), id] as const,
  search: () => [...FACTORIES_QUERY_KEYS.all, "search"] as const,
  searchList: (params: any) => [...FACTORIES_QUERY_KEYS.search(), params] as const,
  kpi: () => [...FACTORIES_QUERY_KEYS.all, "kpi"] as const,
  infinite: () => [...FACTORIES_QUERY_KEYS.all, "infinite"] as const,
  infiniteList: (params: any) => [...FACTORIES_QUERY_KEYS.infinite(), params] as const,
};

/**
 * Hook for fetching paginated factories list
 */
export const useFactories = (params?: FactoriesQueryParams) => {
  return useQuery({
    queryKey: FACTORIES_QUERY_KEYS.list(params),
    queryFn: () => factoriesService.getFactories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook for fetching a single factory by ID
 */
export const useFactory = (id: number | null) => {
  return useQuery({
    queryKey: FACTORIES_QUERY_KEYS.detail(id!),
    queryFn: () => factoriesService.getFactoryById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook for searching factories
 */
export const useFactoriesSearch = (params: FactoriesSearchParams) => {
  return useQuery({
    queryKey: FACTORIES_QUERY_KEYS.searchList(params),
    queryFn: () => factoriesService.searchFactories(params),
    enabled: !!params.q && params.q.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 2,
  });
};

/**
 * Hook for fetching factory KPI data
 */
export const useFactoryKpi = () => {
  return useQuery({
    queryKey: FACTORIES_QUERY_KEYS.kpi(),
    queryFn: () => factoriesService.getFactoryKpi(),
    staleTime: 10 * 60 * 1000, // 10 minutes for KPI data
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook for infinite loading of factories
 */
export const useInfiniteFactories = (params?: Omit<FactoriesQueryParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: FACTORIES_QUERY_KEYS.infiniteList(params),
    queryFn: ({ pageParam }) =>
      factoriesService.getFactories({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Hook for creating a new factory
 */
export const useCreateFactory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFactoryDto) => factoriesService.createFactory(data),
    onSuccess: (newFactory) => {
      // Invalidate and refetch factories list
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.kpi() });
      
      // Add the new factory to the cache
      queryClient.setQueryData(
        FACTORIES_QUERY_KEYS.detail(newFactory.pk_factories_id),
        newFactory
      );

      toast.success("Factory created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create factory");
    },
  });
};

/**
 * Hook for updating a factory
 */
export const useUpdateFactory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFactoryDto }) =>
      factoriesService.updateFactory(id, data),
    onSuccess: (updatedFactory, { id }) => {
      // Update the specific factory in cache
      queryClient.setQueryData(
        FACTORIES_QUERY_KEYS.detail(id),
        updatedFactory
      );

      // Invalidate factories list to reflect changes
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.kpi() });

      toast.success("Factory updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update factory");
    },
  });
};

/**
 * Hook for deleting a factory
 */
export const useDeleteFactory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => factoriesService.deleteFactory(id),
    onSuccess: (_, deletedId) => {
      // Remove the factory from cache
      queryClient.removeQueries({ queryKey: FACTORIES_QUERY_KEYS.detail(deletedId) });

      // Invalidate factories list
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.kpi() });

      toast.success("Factory deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete factory");
    },
  });
};

/**
 * Hook for bulk deleting factories
 */
export const useBulkDeleteFactories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => factoriesService.bulkDeleteFactories(ids),
    onSuccess: (_, deletedIds) => {
      // Remove deleted factories from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: FACTORIES_QUERY_KEYS.detail(id) });
      });

      // Invalidate factories list
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.kpi() });

      toast.success(`${deletedIds.length} factories deleted successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete factories");
    },
  });
};

/**
 * Hook for exporting factories data
 */
export const useExportFactories = () => {
  return useMutation({
    mutationFn: ({ 
      format = 'csv', 
      params 
    }: { 
      format?: 'csv' | 'xlsx' | 'json';
      params?: FactoriesQueryParams;
    }) => factoriesService.exportFactories(format, params),
    onSuccess: (blob, { format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factories-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export completed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export factories");
    },
  });
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticFactoryUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFactoryDto }) =>
      factoriesService.updateFactory(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: FACTORIES_QUERY_KEYS.detail(id) });

      // Snapshot previous value
      const previousFactory = queryClient.getQueryData<FactoryDetail>(
        FACTORIES_QUERY_KEYS.detail(id)
      );

      // Optimistically update to new value
      if (previousFactory) {
        queryClient.setQueryData<FactoryDetail>(
          FACTORIES_QUERY_KEYS.detail(id),
          { ...previousFactory, ...data }
        );
      }

      return { previousFactory, id };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousFactory) {
        queryClient.setQueryData(
          FACTORIES_QUERY_KEYS.detail(context.id),
          context.previousFactory
        );
      }
      toast.error(error.message || "Failed to update factory");
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: FACTORIES_QUERY_KEYS.detail(id) });
    },
  });
}; 