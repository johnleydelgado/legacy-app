import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { locationTypesService } from "@/services/location-types";
import {
  CreateLocationTypeDto,
  UpdateLocationTypeDto,
  LocationTypesQueryParams,
  BulkLocationTypeOperation,
} from "@/services/location-types/types";

// Query keys for caching
const LOCATION_TYPES_QUERY_KEYS = {
  all: ["location-types"] as const,
  lists: () => [...LOCATION_TYPES_QUERY_KEYS.all, "list"] as const,
  list: (params: any) => [...LOCATION_TYPES_QUERY_KEYS.lists(), params] as const,
  allItems: () => [...LOCATION_TYPES_QUERY_KEYS.all, "all-items"] as const,
  details: () => [...LOCATION_TYPES_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...LOCATION_TYPES_QUERY_KEYS.details(), id] as const,
  search: () => [...LOCATION_TYPES_QUERY_KEYS.all, "search"] as const,
  searchList: (params: any) => [...LOCATION_TYPES_QUERY_KEYS.search(), params] as const,
  stats: () => [...LOCATION_TYPES_QUERY_KEYS.all, "stats"] as const,
};

/**
 * Hook for fetching paginated location types
 */
export const useLocationTypes = (params?: LocationTypesQueryParams) => {
  return useQuery({
    queryKey: LOCATION_TYPES_QUERY_KEYS.list(params),
    queryFn: () => locationTypesService.getLocationTypes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook for fetching all location types without pagination
 */
export const useAllLocationTypes = () => {
  return useQuery({
    queryKey: LOCATION_TYPES_QUERY_KEYS.allItems(),
    queryFn: () => locationTypesService.getAllLocationTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook for fetching a single location type
 */
export const useLocationType = (id: number | null) => {
  return useQuery({
    queryKey: LOCATION_TYPES_QUERY_KEYS.detail(id!),
    queryFn: () => locationTypesService.getLocationTypeById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook for searching location types
 */
export const useSearchLocationTypes = (
  searchTerm: string,
  params?: LocationTypesQueryParams
) => {
  return useQuery({
    queryKey: LOCATION_TYPES_QUERY_KEYS.searchList({ searchTerm, ...params }),
    queryFn: () => locationTypesService.searchLocationTypes(searchTerm, params),
    enabled: !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook for location type statistics
 */
export const useLocationTypeStats = () => {
  return useQuery({
    queryKey: LOCATION_TYPES_QUERY_KEYS.stats(),
    queryFn: () => locationTypesService.getLocationTypeStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook for location type mutations (create, update, delete)
 */
export const useLocationTypeMutations = () => {
  const queryClient = useQueryClient();

  const createLocationType = useMutation({
    mutationFn: (locationTypeData: CreateLocationTypeDto) =>
      locationTypesService.createLocationType(locationTypeData),
    onSuccess: (newLocationType) => {
      // Invalidate and refetch location types lists
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.allItems() });
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.stats() });

      // Set the new location type data in cache
      if (newLocationType) {
        queryClient.setQueryData(
          LOCATION_TYPES_QUERY_KEYS.detail(newLocationType.pk_location_type_id),
          newLocationType
        );
      }
    },
  });

  const updateLocationType = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateLocationTypeDto;
    }) => {
      return await locationTypesService.updateLocationType(id, data);
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: LOCATION_TYPES_QUERY_KEYS.detail(variables.id),
      });

      // Snapshot the previous value
      const previousLocationType = queryClient.getQueryData(
        LOCATION_TYPES_QUERY_KEYS.detail(variables.id)
      );

      return { previousLocationType };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value
      if (context?.previousLocationType) {
        queryClient.setQueryData(
          LOCATION_TYPES_QUERY_KEYS.detail(variables.id),
          context.previousLocationType
        );
      }
    },
    onSuccess: (updatedLocationType, variables) => {
      // Update the specific location type in cache
      if (updatedLocationType) {
        queryClient.setQueryData(
          LOCATION_TYPES_QUERY_KEYS.detail(variables.id),
          updatedLocationType
        );
      }

      // Invalidate lists to ensure they're fresh
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.allItems() });
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we're up to date
      queryClient.invalidateQueries({
        queryKey: LOCATION_TYPES_QUERY_KEYS.detail(variables.id),
      });
    },
  });

  const deleteLocationType = useMutation({
    mutationFn: (id: number) => locationTypesService.deleteLocationType(id),
    onSuccess: (_, deletedId) => {
      // Remove the location type from cache
      queryClient.removeQueries({
        queryKey: LOCATION_TYPES_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.allItems() });
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.stats() });
    },
  });

  const bulkOperation = useMutation({
    mutationFn: (operation: BulkLocationTypeOperation) =>
      locationTypesService.bulkOperation(operation),
    onSuccess: () => {
      // Invalidate all location type queries after bulk operation
      queryClient.invalidateQueries({ queryKey: LOCATION_TYPES_QUERY_KEYS.all });
    },
  });

  return {
    createLocationType,
    updateLocationType,
    deleteLocationType,
    bulkOperation,
  };
};

/**
 * Hook to invalidate location types cache
 */
export const useInvalidateLocationTypes = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: LOCATION_TYPES_QUERY_KEYS.all,
    });
  };
};

/**
 * Hook to prefetch location types
 */
export const usePrefetchLocationTypes = () => {
  const queryClient = useQueryClient();

  return (params?: LocationTypesQueryParams) => {
    queryClient.prefetchQuery({
      queryKey: LOCATION_TYPES_QUERY_KEYS.list(params),
      queryFn: () => locationTypesService.getLocationTypes(params),
      staleTime: 5 * 60 * 1000,
    });
  };
}; 