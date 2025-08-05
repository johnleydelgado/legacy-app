import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerFilesService } from "@/services/customer-files";
import type {
  CreateCustomerFileDto,
  UpdateCustomerFileDto,
  CustomerFilesQueryParams,
  GetCustomerFilesParams,
} from "@/services/customer-files/types";

// Hook for fetching all customer files with pagination
export function useCustomerFiles(params?: CustomerFilesQueryParams) {
  return useQuery({
    queryKey: ["customerFiles", params],
    queryFn: () => customerFilesService.getCustomerFiles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for fetching all customer files with pagination - V2
export function useCustomerFilesV2(params?: GetCustomerFilesParams) {
  return useQuery({
    queryKey: ["customerFiles", "v2", params],
    queryFn: () => customerFilesService.getCustomerFilesV2(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for fetching a single customer file
export function useCustomerFile(id: number) {
  return useQuery({
    queryKey: ["customerFile", id],
    queryFn: () => customerFilesService.getCustomerFileById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for fetching customer files by customer ID
export function useCustomerFilesByCustomerId(
  customerId: number,
  params?: CustomerFilesQueryParams
) {
  return useQuery({
    queryKey: ["customerFiles", "byCustomerId", customerId, params],
    queryFn: () =>
      customerFilesService.getCustomerFilesByCustomerId(customerId, params),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for fetching customer files by MIME type
export function useCustomerFilesByMimeType(
  mimeType: string,
  params?: CustomerFilesQueryParams
) {
  return useQuery({
    queryKey: ["customerFiles", "byMimeType", mimeType, params],
    queryFn: () =>
      customerFilesService.getCustomerFilesByMimeType(mimeType, params),
    enabled: !!mimeType,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for searching customer files
export function useSearchCustomerFiles(
  query: string,
  params?: Omit<GetCustomerFilesParams, "search">
) {
  return useQuery({
    queryKey: ["customerFiles", "search", query, params],
    queryFn: () => customerFilesService.searchCustomerFilesV2(query, params),
    enabled: !!query && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating a new customer file
export function useCreateCustomerFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerFileData: CreateCustomerFileDto) =>
      customerFilesService.createCustomerFile(customerFileData),
    onSuccess: (newCustomerFile) => {
      // Invalidate all customer files queries
      queryClient.invalidateQueries({ queryKey: ["customerFiles"] });

      // Invalidate specific customer's files
      queryClient.invalidateQueries({
        queryKey: [
          "customerFiles",
          "byCustomerId",
          newCustomerFile.fk_customer_id,
        ],
      });
    },
  });
}

// Hook for updating a customer file
export function useUpdateCustomerFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerFileDto }) =>
      customerFilesService.updateCustomerFile(id, data),
    onSuccess: (updatedCustomerFile, variables) => {
      // Invalidate all customer files queries
      queryClient.invalidateQueries({ queryKey: ["customerFiles"] });

      // Invalidate specific customer file
      queryClient.invalidateQueries({
        queryKey: ["customerFile", variables.id],
      });

      // Invalidate specific customer's files
      queryClient.invalidateQueries({
        queryKey: [
          "customerFiles",
          "byCustomerId",
          updatedCustomerFile.fk_customer_id,
        ],
      });
    },
  });
}

// Hook for deleting a customer file (hard delete)
export function useDeleteCustomerFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // First get the customer file to get the file URL
      const customerFile = await customerFilesService.getCustomerFileById(id);

      if (customerFile && customerFile.public_url) {
        try {
          // Delete file from S3 using the frontend API
          await fetch("/api/customer-files", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify([customerFile.public_url]),
          });
        } catch (error) {
          console.error("Failed to delete file from S3:", error);
          // Continue with database deletion even if S3 deletion fails
        }
      }

      // Delete the customer file from the database
      return await customerFilesService.deleteCustomerFile(id);
    },
    onSuccess: (_, deletedId) => {
      // Invalidate all customer files queries
      queryClient.invalidateQueries({ queryKey: ["customerFiles"] });

      // Remove the specific customer file from cache
      queryClient.removeQueries({ queryKey: ["customerFile", deletedId] });
    },
  });
}

// Hook for soft deleting a customer file
export function useSoftDeleteCustomerFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerFilesService.softDeleteCustomerFile(id),
    onSuccess: (softDeletedCustomerFile, deletedId) => {
      // Invalidate all customer files queries
      queryClient.invalidateQueries({ queryKey: ["customerFiles"] });

      // Invalidate specific customer file
      queryClient.invalidateQueries({
        queryKey: ["customerFile", deletedId],
      });

      // Invalidate specific customer's files
      queryClient.invalidateQueries({
        queryKey: [
          "customerFiles",
          "byCustomerId",
          softDeletedCustomerFile.fk_customer_id,
        ],
      });
    },
  });
}

// Hook for permanently deleting a soft-deleted customer file
export function usePermanentDeleteCustomerFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // First get the customer file to get the file URL
      const customerFile = await customerFilesService.getCustomerFileById(id);

      if (customerFile && customerFile.public_url) {
        try {
          // Delete file from S3 using the frontend API
          await fetch("/api/customer-files", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify([customerFile.public_url]),
          });
        } catch (error) {
          console.error("Failed to delete file from S3:", error);
          // Continue with database deletion even if S3 deletion fails
        }
      }

      // Permanently delete from database
      return await customerFilesService.permanentDeleteCustomerFile(id);
    },
    onSuccess: (_, deletedId) => {
      // Invalidate all customer files queries
      queryClient.invalidateQueries({ queryKey: ["customerFiles"] });

      // Remove the specific customer file from cache
      queryClient.removeQueries({ queryKey: ["customerFile", deletedId] });
    },
  });
}

// Hook for service health check
export function usePingCustomerFiles() {
  return useQuery({
    queryKey: ["customerFiles", "ping"],
    queryFn: () => customerFilesService.ping(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Hook for getting customer files with enhanced features
export function useCustomerFilesWithFilters(
  filters: GetCustomerFilesParams = {}
) {
  const queryKey = ["customerFiles", "withFilters", filters];

  return useQuery({
    queryKey,
    queryFn: () => {
      // Always use getCustomerFilesV2 as it handles all filters properly
      return customerFilesService.getCustomerFilesV2(filters);
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for bulk operations
export function useBulkCustomerFileOperations() {
  const queryClient = useQueryClient();

  const bulkDelete = useMutation({
    mutationFn: async (ids: number[]) => {
      // First, get all customer files to extract their URLs
      const customerFiles = await Promise.all(
        ids.map((id) => customerFilesService.getCustomerFileById(id))
      );

      // Extract URLs for S3 deletion
      const urls = customerFiles
        .filter((file) => file && file.public_url)
        .map((file) => file.public_url);

      // Delete files from S3 if there are any URLs
      if (urls.length > 0) {
        try {
          await fetch("/api/customer-files", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(urls),
          });
        } catch (error) {
          console.error("Failed to delete some files from S3:", error);
          // Continue with database deletion even if S3 deletion fails
        }
      }

      // Delete from database
      const deletePromises = ids.map((id) =>
        customerFilesService.deleteCustomerFile(id)
      );
      return Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerFiles"] });
    },
  });

  const bulkSoftDelete = useMutation({
    mutationFn: async (ids: number[]) => {
      // For soft delete, we only mark database records as deleted
      // but keep files in S3 for potential recovery
      const softDeletePromises = ids.map((id) =>
        customerFilesService.softDeleteCustomerFile(id)
      );
      return Promise.all(softDeletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerFiles"] });
    },
  });

  return {
    bulkDelete,
    bulkSoftDelete,
  };
}
