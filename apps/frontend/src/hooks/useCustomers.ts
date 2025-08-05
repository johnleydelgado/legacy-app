import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllCustomersWithContacts, getCustomers } from "@/fetchers/customer";
import { CustomerWithContacts } from "@/types/customer";

import { customersService } from "@/services/customers";
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from "../services/customers/types";

// Query keys for caching
const CUSTOMERS_QUERY_KEYS = {
  all: ["customers"] as const,
  lists: () => [...CUSTOMERS_QUERY_KEYS.all, "list"] as const,
  list: (params: any) => [...CUSTOMERS_QUERY_KEYS.lists(), params] as const,
  withContacts: () => [...CUSTOMERS_QUERY_KEYS.all, "with-contacts"] as const,
  withContactsList: (params: any) =>
    [...CUSTOMERS_QUERY_KEYS.withContacts(), params] as const,
  optimized: () => [...CUSTOMERS_QUERY_KEYS.all, "optimized"] as const,
  details: () => [...CUSTOMERS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...CUSTOMERS_QUERY_KEYS.details(), id] as const,
  search: () => [...CUSTOMERS_QUERY_KEYS.all, "search"] as const,
  searchList: (params: any) =>
    [...CUSTOMERS_QUERY_KEYS.search(), params] as const,
  advancedSearch: () =>
    [...CUSTOMERS_QUERY_KEYS.all, "advanced-search"] as const,
  advancedSearchList: (params: any) =>
    [...CUSTOMERS_QUERY_KEYS.advancedSearch(), params] as const,
  stats: () => [...CUSTOMERS_QUERY_KEYS.all, "stats"] as const,
};

// Hook for fetching a single customer
export const useCustomer = (id: number | null) => {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.detail(id!),
    queryFn: () => customersService.getCustomerByIdWithDetails(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
};

export const useCustomerDetails = (id: number | null) => {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.detail(id!),
    queryFn: () => customersService.getCustomerByIdWithDetails(id!),
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: "always", // Always refetch when mounted
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook for customer mutations (create, update, delete)
export const useCustomerMutations = () => {
  const queryClient = useQueryClient();

  const createCustomer = useMutation({
    mutationFn: (customerData: CreateCustomerDto) =>
      customersService.createCustomer(customerData),
    onSuccess: (newCustomer) => {
      // Invalidate and refetch customers lists
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.withContacts(),
      });
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.optimized(),
      });
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.stats() });

      // Optionally set the new customer data in cache
      if (newCustomer) {
        queryClient.setQueryData(
          CUSTOMERS_QUERY_KEYS.detail(newCustomer.pk_customer_id),
          newCustomer
        );
      }
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCustomerDto;
    }) => {
      console.log("Mutation - Before Update:", { id, data });
      const result = await customersService.updateCustomer(id, data);
      console.log("Mutation - After Update:", result);
      return result;
    },
    onMutate: async (variables) => {
      console.log("Mutation - OnMutate:", variables);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.detail(variables.id),
      });

      // Snapshot the previous value
      const previousCustomer = queryClient.getQueryData(
        CUSTOMERS_QUERY_KEYS.detail(variables.id)
      );

      return { previousCustomer };
    },
    onError: (err, variables, context) => {
      console.error("Mutation - OnError:", { err, variables, context });
      // Rollback to the previous value
      if (context?.previousCustomer) {
        queryClient.setQueryData(
          CUSTOMERS_QUERY_KEYS.detail(variables.id),
          context.previousCustomer
        );
      }
    },
    onSuccess: (updatedCustomer, variables) => {
      console.log("Mutation - OnSuccess:", { updatedCustomer, variables });
      // Update the specific customer in cache
      if (updatedCustomer) {
        queryClient.setQueryData(
          CUSTOMERS_QUERY_KEYS.detail(variables.id),
          updatedCustomer
        );
      }

      // Invalidate lists to ensure they're fresh
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.withContacts(),
      });
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.optimized(),
      });
    },
    onSettled: (data, error, variables) => {
      console.log("Mutation - OnSettled:", { data, error, variables });
      // Always refetch after error or success to ensure we're up to date
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.detail(variables.id),
      });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: (id: number) => customersService.deleteCustomer(id),
    onSuccess: (_, deletedId) => {
      // Remove the customer from cache
      queryClient.removeQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.withContacts(),
      });
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.optimized(),
      });
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.stats() });

      // Invalidate quotes for this customer
      // queryClient.invalidateQueries({
      //   queryKey: CUSTOMERS_QUERY_KEYS.byCustomer(),
      // });
    },
  });

  const updateCustomerNotes = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      customersService.updateCustomerNotes(id, notes),
    onSuccess: (updatedCustomer, variables) => {
      // Update the specific customer in cache
      if (updatedCustomer) {
        queryClient.setQueryData(
          CUSTOMERS_QUERY_KEYS.detail(variables.id),
          updatedCustomer
        );
      }

      // Invalidate lists to ensure they're fresh
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.withContacts(),
      });
    },
  });

  return {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerNotes,
  };
};

// Hook to get customers with contacts with pagination
export const useCustomersWithContacts = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.withContactsList(params),
    queryFn: () => customersService.getCustomersWithContacts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

export const useCustomersWithContactsOptimized = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.withContactsList({ page: 1, limit: 0 }),
    queryFn: () => customersService.getAllCustomersWithContactsOptimized(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // Keep cached data for 30 minutes before garbage collection
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 3,
    retryDelay: 1000,
    placeholderData: () => {
      // Use data from a previous query as placeholder while loading
      return queryClient.getQueryData(
        CUSTOMERS_QUERY_KEYS.withContactsList({ page: 1, limit: 0 })
      );
    },
  });
};

// Hook for customer statistics/analytics
export const useCustomerStats = () => {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.stats(),
    queryFn: () => customersService.getCustomerStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
    retry: 3,
    retryDelay: 1000,
  });
};

// Hook to invalidate customers cache
export const useInvalidateCustomers = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: CUSTOMERS_QUERY_KEYS.all,
    });
  };
};

// Hook to prefetch customers
// export const usePrefetchCustomers = (page: number = 1, limit: number = 10) => {
//   const queryClient = useQueryClient();
//
//   return () => {
//     queryClient.prefetchQuery({
//       queryKey: CUSTOMERS_QUERY_KEYS.withContacts(page, limit),
//       queryFn: () => getCustomers(page, limit),
//       staleTime: 5 * 60 * 1000,
//     });
//   };
// };
