import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quoteApprovalService } from "@/services/quotes-approval";
import {
  QuoteApprovalQueryParams,
  CreateQuoteApprovalDto,
  UpdateQuoteApprovalDto,
} from "@/services/quotes-approval/types";

// Query Keys
export const QUOTE_APPROVAL_KEYS = {
  all: ["quote-approvals"] as const,
  lists: () => [...QUOTE_APPROVAL_KEYS.all, "list"] as const,
  list: (params: QuoteApprovalQueryParams) =>
    [...QUOTE_APPROVAL_KEYS.lists(), params] as const,
  details: () => [...QUOTE_APPROVAL_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUOTE_APPROVAL_KEYS.details(), id] as const,
  byToken: (tokenHash: string) =>
    [...QUOTE_APPROVAL_KEYS.all, "by-token", tokenHash] as const,
};

// Get Quote Approvals Hook
export const useQuoteApprovals = (params: QuoteApprovalQueryParams = {}) => {
  return useQuery({
    queryKey: QUOTE_APPROVAL_KEYS.list(params),
    queryFn: () => quoteApprovalService.getQuoteApprovals(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

// Get Quote Approval by ID Hook
export const useQuoteApproval = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUOTE_APPROVAL_KEYS.detail(id),
    queryFn: () => quoteApprovalService.getQuoteApprovalByQuoteId(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

// Get Quote Approval by Token Hook
export const useQuoteApprovalByToken = (
  tokenHash: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QUOTE_APPROVAL_KEYS.byToken(tokenHash),
    queryFn: () => quoteApprovalService.getQuoteApprovalByToken(tokenHash),
    enabled: enabled && !!tokenHash,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

// Create Quote Approval Hook
export const useCreateQuoteApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuoteApprovalDto) =>
      quoteApprovalService.createQuoteApproval(data),
    onSuccess: (_, data) => {
      // Invalidate the list queries
      queryClient.invalidateQueries({ queryKey: QUOTE_APPROVAL_KEYS.lists() });
      // Invalidate the specific quote approval query
      queryClient.invalidateQueries({
        queryKey: QUOTE_APPROVAL_KEYS.detail(data.quoteId),
      });
    },
  });
};

// Update Quote Approval Hook
export const useUpdateQuoteApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuoteApprovalDto }) =>
      quoteApprovalService.updateQuoteApproval(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: QUOTE_APPROVAL_KEYS.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: QUOTE_APPROVAL_KEYS.lists() });
    },
  });
};

// Delete Quote Approval Hook
export const useDeleteQuoteApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => quoteApprovalService.deleteQuoteApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTE_APPROVAL_KEYS.lists() });
    },
  });
};
