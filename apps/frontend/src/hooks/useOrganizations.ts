import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationsService } from "@/services/organizations";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationsQueryParams,
  OrganizationSearchParams,
  BulkOrganizationOperation,
} from "@/services/organizations/types";

// Query keys for caching
const ORGANIZATIONS_QUERY_KEYS = {
  all: ["organizations"] as const,
  lists: () => [...ORGANIZATIONS_QUERY_KEYS.all, "list"] as const,
  list: (params: any) => [...ORGANIZATIONS_QUERY_KEYS.lists(), params] as const,
  details: () => [...ORGANIZATIONS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...ORGANIZATIONS_QUERY_KEYS.details(), id] as const,
  search: () => [...ORGANIZATIONS_QUERY_KEYS.all, "search"] as const,
  searchList: (params: any) =>
    [...ORGANIZATIONS_QUERY_KEYS.search(), params] as const,
  stats: () => [...ORGANIZATIONS_QUERY_KEYS.all, "stats"] as const,
  allOrganizations: () => [...ORGANIZATIONS_QUERY_KEYS.all, "all-organizations"] as const,
} as const;

// Hook for fetching paginated organizations
export const useOrganizations = (params?: OrganizationsQueryParams) => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEYS.list(params),
    queryFn: () => organizationsService.getOrganizations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for fetching a single organization
export const useOrganization = (id: number | null) => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEYS.detail(id!),
    queryFn: () => organizationsService.getOrganizationById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for fetching organization details with fresh data
export const useOrganizationDetails = (id: number | null) => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEYS.detail(id!),
    queryFn: () => organizationsService.getOrganizationById(id!),
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: "always", // Always refetch when mounted
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for organization search
export const useOrganizationSearch = (params: OrganizationSearchParams) => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEYS.searchList(params),
    queryFn: () => organizationsService.search(params),
    enabled: !!params.q && params.q.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 2,
    retryDelay: 500,
  });
};

// Hook for organization statistics
export const useOrganizationStats = () => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEYS.stats(),
    queryFn: () => organizationsService.getOrganizationStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for getting all organizations (without pagination)
export const useAllOrganizations = () => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEYS.allOrganizations(),
    queryFn: () => organizationsService.getAllOrganizations(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for organization mutations (create, update, delete)
export const useOrganizationMutations = () => {
  const queryClient = useQueryClient();

  const createOrganization = useMutation({
    mutationFn: (organizationData: CreateOrganizationDto) =>
      organizationsService.createOrganization(organizationData),
    onSuccess: (newOrganization) => {
      // Invalidate and refetch organization lists
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.allOrganizations() });

      // Optionally set the new organization data in cache
      if (newOrganization) {
        queryClient.setQueryData(
          ORGANIZATIONS_QUERY_KEYS.detail(newOrganization.pk_organization_id),
          newOrganization
        );
      }
    },
  });

  const updateOrganization = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateOrganizationDto;
    }) => {
      console.log("Mutation - Before Update:", { id, data });
      const result = await organizationsService.updateOrganization(id, data);
      console.log("Mutation - After Update:", result);
      return result;
    },
    onMutate: async (variables) => {
      console.log("Mutation - OnMutate:", variables);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ORGANIZATIONS_QUERY_KEYS.detail(variables.id),
      });

      // Snapshot the previous value
      const previousOrganization = queryClient.getQueryData(
        ORGANIZATIONS_QUERY_KEYS.detail(variables.id)
      );

      return { previousOrganization };
    },
    onError: (err, variables, context) => {
      console.error("Mutation - OnError:", { err, variables, context });
      // Rollback to the previous value
      if (context?.previousOrganization) {
        queryClient.setQueryData(
          ORGANIZATIONS_QUERY_KEYS.detail(variables.id),
          context.previousOrganization
        );
      }
    },
    onSuccess: (updatedOrganization, variables) => {
      console.log("Mutation - OnSuccess:", { updatedOrganization, variables });
      // Update the specific organization in cache
      if (updatedOrganization) {
        queryClient.setQueryData(
          ORGANIZATIONS_QUERY_KEYS.detail(variables.id),
          updatedOrganization
        );
      }

      // Invalidate lists to ensure they're fresh
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.allOrganizations() });
    },
    onSettled: (data, error, variables) => {
      console.log("Mutation - OnSettled:", { data, error, variables });
      // Always refetch after error or success to ensure we're up to date
      queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_QUERY_KEYS.detail(variables.id),
      });
    },
  });

  const deleteOrganization = useMutation({
    mutationFn: (id: number) => organizationsService.deleteOrganization(id),
    onSuccess: (_, deletedId) => {
      // Remove the organization from cache
      queryClient.removeQueries({
        queryKey: ORGANIZATIONS_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.allOrganizations() });
    },
  });

  const updateOrganizationNotes = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      organizationsService.updateOrganizationNotes(id, notes),
    onSuccess: (updatedOrganization, variables) => {
      // Update the specific organization in cache
      if (updatedOrganization) {
        queryClient.setQueryData(
          ORGANIZATIONS_QUERY_KEYS.detail(variables.id),
          updatedOrganization
        );
      }

      // Invalidate lists to ensure they're fresh
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.allOrganizations() });
    },
  });

  const bulkOperation = useMutation({
    mutationFn: (operation: BulkOrganizationOperation) =>
      organizationsService.bulkOperation(operation),
    onSuccess: () => {
      // Invalidate all organization-related queries
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.all });
    },
  });

  const addOrganizationTags = useMutation({
    mutationFn: ({ id, tags }: { id: number; tags: string }) =>
      organizationsService.addOrganizationTags(id, tags),
    onSuccess: (updatedOrganization, variables) => {
      if (updatedOrganization) {
        queryClient.setQueryData(
          ORGANIZATIONS_QUERY_KEYS.detail(variables.id),
          updatedOrganization
        );
      }
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.lists() });
    },
  });

  const removeOrganizationTags = useMutation({
    mutationFn: ({ id, tags }: { id: number; tags: string }) =>
      organizationsService.removeOrganizationTags(id, tags),
    onSuccess: (updatedOrganization, variables) => {
      if (updatedOrganization) {
        queryClient.setQueryData(
          ORGANIZATIONS_QUERY_KEYS.detail(variables.id),
          updatedOrganization
        );
      }
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEYS.lists() });
    },
  });

  return {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    updateOrganizationNotes,
    bulkOperation,
    addOrganizationTags,
    removeOrganizationTags,
  };
};

// Hook to invalidate organizations cache
export const useInvalidateOrganizations = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: ORGANIZATIONS_QUERY_KEYS.all,
    });
  };
};

// Hook for organizations by industry
export const useOrganizationsByIndustry = (
  industry: string,
  params?: Omit<OrganizationsQueryParams, "industry">
) => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEYS.list({ ...params, industry }),
    queryFn: () => organizationsService.getOrganizationsByIndustry(industry, params),
    enabled: !!industry,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for organizations by country
export const useOrganizationsByCountry = (
  country: string,
  params?: Omit<OrganizationsQueryParams, "country">
) => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEYS.list({ ...params, country }),
    queryFn: () => organizationsService.getOrganizationsByCountry(country, params),
    enabled: !!country,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
}; 