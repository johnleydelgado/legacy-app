"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCustomer } from "@/hooks/useCustomers";
import { useQuoteItemsByQuoteId } from "@/hooks/useQuoteItems";
import { useImageGalleryByItemEndpoint } from "@/hooks/useImageGallery";

// Custom hooks
import { useQuoteApprovalLogic } from "@/hooks/useQuoteApprovalLogic";
import { useOrderCreation } from "@/hooks/useOrderCreation";
import { useQuoteComputedData } from "@/hooks/useQuoteComputedData";
import { useQuoteApprovalData } from "@/hooks/useQuoteApprovalData";

// Components
import LoadingScreen from "@/components/pages/quotes/approval/LoadingScreen";
import ErrorScreen from "@/components/pages/quotes/approval/ErrorScreen";
import StatusCard from "@/components/pages/quotes/approval/StatusCard";
import QuoteHeader from "@/components/pages/quotes/approval/QuoteHeader";
import AddressesSection from "@/components/pages/quotes/approval/AddressesSection";
import ShippingInfo from "@/components/pages/quotes/approval/ShippingInfo";
import QuoteItemsTable from "@/components/pages/quotes/approval/QuoteItemsTable";
import CustomerAcknowledgements from "@/components/pages/quotes/approval/CustomerAcknowledgements";
import ArtworkProofs from "@/components/pages/quotes/approval/ArtworkProofs";
import ActionSection from "@/components/pages/quotes/approval/ActionSection";
import RejectionDialog from "@/components/pages/quotes/approval/RejectionDialog";
import FloatingZoomButton from "@/components/pages/quotes/approval/FloatingZoomButton";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const QuoteApprovalContent = () => {
  // URL parameters
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const recipientEmail = searchParams.get("email") || "";

  // Local state for UI
  const [acknowledged, setAcknowledged] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);

  // Get all quote approval related data with optimized dependencies
  const {
    quoteApproval: baseQuoteApproval,
    customer,
    quoteItemsData,
    imageGalleryData,
    customerId,
    quoteId,
    isLoading,
    hasError,
    approvalError,
    customerError,
    quoteItemsError,
    isValidToken,
  } = useQuoteApprovalData({ token });

  // Get computed data with memoization
  const {
    primaryContact,
    billingAddress,
    shippingAddress,
    itemsTotal,
    taxRate,
    taxDue,
    total,
    deposit,
    artworkProofs,
    acknowledgements,
  } = useQuoteComputedData({
    customer,
    quoteItemsData,
  });

  // Order creation logic
  const { createOrderFromQuote } = useOrderCreation({
    customerId: customerId || undefined,
    quoteId: quoteId || undefined,
    quoteItemsData,
    itemsTotal,
    taxDue,
    taxRate,
  });

  // Quote approval logic (uses the base approval data)
  const {
    quoteApproval,
    isApprovalLoading: logicIsApprovalLoading,
    approvalError: logicApprovalError,
    isProcessingApproval,
    isProcessingRejection,
    isApprovedState,
    isRejectedState,
    handleApprove,
    handleReject,
  } = useQuoteApprovalLogic({
    token,
    recipientEmail,
    customer,
    quoteItemsData,
    total,
    createOrderFromQuote,
    payload: baseQuoteApproval?.payload,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (hasError) {
    return <ErrorScreen />;
  }

  if (!isValidToken) {
    return <ErrorScreen />;
  }

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Status Card */}
      <StatusCard isApproved={isApprovedState} isRejected={isRejectedState} />

      {/* Main Content */}
      <div className="mx-auto max-w-6xl bg-white border rounded-xl shadow-sm overflow-hidden">
        {/* Quote Header */}
        <QuoteHeader
          quoteId={quoteId || undefined}
          issueDate="20 / 07 / 2024"
          approvalNumber="BBN2351D458"
        />

        {/* Body */}
        <div className="px-8 py-10 space-y-10 print:space-y-6">
          {/* Addresses */}
          <AddressesSection
            customer={customer}
            primaryContact={primaryContact}
            billingAddress={billingAddress}
            shippingAddress={shippingAddress}
          />

          {/* Shipping Information */}
          <ShippingInfo />

          {/* Items Table */}
          <QuoteItemsTable
            items={quoteItemsData?.items || []}
            itemsTotal={itemsTotal}
            taxRate={taxRate}
            deposit={deposit}
            total={total}
            showEstimationNote={!isApprovedState && !isRejectedState}
          />

          {/* Customer Acknowledgements */}
          {!isApprovedState && !isRejectedState && (
            <CustomerAcknowledgements acknowledgements={acknowledgements} />
          )}

          {/* Artwork Proofs */}
          <ArtworkProofs artworkProofs={artworkProofs} />

          {/* Thank you message */}
          <p className="text-center text-sm text-muted-foreground pt-6">
            Thank you very much for doing business with us.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {!isApprovedState && !isRejectedState && (
        <ActionSection
          acknowledged={acknowledged}
          setAcknowledged={setAcknowledged}
          isApproving={isProcessingApproval}
          isRejecting={isProcessingRejection}
          handleApprove={handleApprove}
          onDecline={() => setDeclineOpen(true)}
        />
      )}

      {/* Floating Zoom Button */}
      <FloatingZoomButton />

      {/* Decline Modal */}
      {!isApprovedState && !isRejectedState && (
        <RejectionDialog
          open={declineOpen}
          onOpenChange={setDeclineOpen}
          onConfirm={(reason) => {
            setDeclineOpen(false);
            handleReject(reason);
          }}
        />
      )}
    </div>
  );
};

export default QuoteApprovalContent;
