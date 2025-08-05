// hooks/use-activity-history.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityHistoryService } from "@/services/activity-history";
import {
    ActivityHistoryItem,
    ActivityHistoryResponse,
    CustomerActivityHistoryResponse,
    GetActivityHistoryParams,
    GetCustomerActivityHistoryParams,
    CreateActivityHistoryDto,
    UpdateActivityHistoryDto,
    GetDocumentActivityHistoryParams,
} from "@/services/activity-history/types";
import { toast } from "sonner";

// Query Keys
export const ACTIVITY_HISTORY_QUERY_KEYS = {
    all: ["activity-history"] as const,
    lists: () => [...ACTIVITY_HISTORY_QUERY_KEYS.all, "list"] as const,
    list: (params: GetActivityHistoryParams) =>
        [...ACTIVITY_HISTORY_QUERY_KEYS.lists(), params] as const,
    details: () => [...ACTIVITY_HISTORY_QUERY_KEYS.all, "detail"] as const,
    detail: (id: number) => [...ACTIVITY_HISTORY_QUERY_KEYS.details(), id] as const,
    customer: (params: GetCustomerActivityHistoryParams) =>
        [...ACTIVITY_HISTORY_QUERY_KEYS.all, "customer", params] as const,
    document: (params: GetDocumentActivityHistoryParams) =>
        [...ACTIVITY_HISTORY_QUERY_KEYS.all, "document", params] as const,
};

// Query Hooks
export function useActivityHistory(params: GetActivityHistoryParams = {}) {
    return useQuery({
        queryKey: ACTIVITY_HISTORY_QUERY_KEYS.list(params),
        queryFn: () => activityHistoryService.getActivityHistory(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useActivityHistoryById(id: number) {
    return useQuery({
        queryKey: ACTIVITY_HISTORY_QUERY_KEYS.detail(id),
        queryFn: () => activityHistoryService.getActivityHistoryById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useCustomerActivityHistory(params: GetCustomerActivityHistoryParams) {
    return useQuery({
        queryKey: ACTIVITY_HISTORY_QUERY_KEYS.customer(params),
        queryFn: () => activityHistoryService.getCustomerActivityHistory(params),
        enabled: !!params.customerId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useDocumentActivityHistory(params: GetDocumentActivityHistoryParams) {
    return useQuery({
        queryKey: ACTIVITY_HISTORY_QUERY_KEYS.document(params),
        queryFn: () => activityHistoryService.getDocumentActivityHistory(params),
        enabled: !!params.documentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Mutation Hooks
export function useCreateActivityHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateActivityHistoryDto) =>
            activityHistoryService.createActivityHistory(data),
        onSuccess: (newActivity) => {
            // Invalidate activity history lists
            queryClient.invalidateQueries({
                queryKey: ACTIVITY_HISTORY_QUERY_KEYS.lists(),
            });

            // Invalidate customer activity history
            queryClient.invalidateQueries({
                queryKey: [...ACTIVITY_HISTORY_QUERY_KEYS.all, "customer"],
            });

            // Set the new activity in cache
            queryClient.setQueryData(
                ACTIVITY_HISTORY_QUERY_KEYS.detail(newActivity.pk_activity_id),
                newActivity
            );

            console.log("Activity history created successfully");
            // toast.success("Activity history created successfully");
        },
        onError: (error: any) => {
            console.log(error?.message || "Failed to create activity history");
            // toast.error(error?.message || "Failed to create activity history");
        },
    });
}

export function useUpdateActivityHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateActivityHistoryDto }) =>
            activityHistoryService.updateActivityHistory(id, data),
        onSuccess: (updatedActivity, { id }) => {
            // Update the specific activity in cache
            queryClient.setQueryData(
                ACTIVITY_HISTORY_QUERY_KEYS.detail(id),
                updatedActivity
            );

            // Invalidate lists to reflect changes
            queryClient.invalidateQueries({
                queryKey: ACTIVITY_HISTORY_QUERY_KEYS.lists(),
            });

            // Invalidate customer activity history
            queryClient.invalidateQueries({
                queryKey: [...ACTIVITY_HISTORY_QUERY_KEYS.all, "customer"],
            });

            toast.success("Activity history updated successfully");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update activity history");
        },
    });
}

export function useDeleteActivityHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => activityHistoryService.deleteActivityHistory(id),
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({
                queryKey: ACTIVITY_HISTORY_QUERY_KEYS.detail(deletedId),
            });

            // Invalidate lists
            queryClient.invalidateQueries({
                queryKey: ACTIVITY_HISTORY_QUERY_KEYS.lists(),
            });

            // Invalidate customer activity history
            queryClient.invalidateQueries({
                queryKey: [...ACTIVITY_HISTORY_QUERY_KEYS.all, "customer"],
            });

            toast.success("Activity history deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete activity history");
        },
    });
}

export function useDeleteAllActivityHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => activityHistoryService.deleteAllActivityHistory(),
        onSuccess: () => {
            // Clear all activity history cache
            queryClient.removeQueries({
                queryKey: ACTIVITY_HISTORY_QUERY_KEYS.all,
            });

            toast.success("All activity history deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete all activity history");
        },
    });
}
