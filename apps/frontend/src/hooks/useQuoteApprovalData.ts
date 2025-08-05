import { useQuoteApprovalByToken } from "@/hooks/useQuoteApproval";
import { useCustomer } from "@/hooks/useCustomers";
import { useQuoteItemsByQuoteId } from "@/hooks/useQuoteItems";
import { useImageGalleryByItemEndpoint } from "@/hooks/useImageGallery";

interface UseQuoteApprovalDataProps {
  token: string;
}

export const useQuoteApprovalData = ({ token }: UseQuoteApprovalDataProps) => {
  // First, get quote approval data
  const {
    data: quoteApproval,
    isLoading: isApprovalLoading,
    error: approvalError,
  } = useQuoteApprovalByToken(token, !!token);

  // Extract IDs from quote approval data for dependent queries
  const customerId = quoteApproval?.customerId
    ? Number(quoteApproval.customerId)
    : null;
  const quoteId = quoteApproval?.quoteId ? Number(quoteApproval.quoteId) : null;

  // Get customer data only after we have the quote approval
  const {
    data: customer,
    isLoading: isCustomerLoading,
    error: customerError,
  } = useCustomer(customerId);

  // Get quote items data only after we have the quote approval
  const {
    data: quoteItemsData,
    isLoading: isQuoteItemsLoading,
    error: quoteItemsError,
  } = useQuoteItemsByQuoteId(quoteId || 0, {}, !!quoteId);

  // Get image gallery for first item (optional)
  const { data: imageGalleryData } = useImageGalleryByItemEndpoint(
    quoteItemsData?.items[0]?.pk_quote_item_id || null,
    "QUOTES"
  );

  // Combined loading state
  const isLoading =
    isApprovalLoading || isCustomerLoading || isQuoteItemsLoading;

  // Combined error state
  const hasError = !!(approvalError || customerError || quoteItemsError);

  // Check if quote approval data exists (token is valid)
  const isValidToken = !isApprovalLoading && !!quoteApproval;

  return {
    // Raw data
    quoteApproval,
    customer,
    quoteItemsData,
    imageGalleryData,

    // Extracted IDs
    customerId,
    quoteId,

    // Loading states
    isLoading,
    isApprovalLoading,
    isCustomerLoading,
    isQuoteItemsLoading,

    // Error states
    hasError,
    approvalError,
    customerError,
    quoteItemsError,

    // Validation
    isValidToken,
  };
};
