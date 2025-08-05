"use client";

import { Suspense } from "react";
import LoadingScreen from "@/components/pages/quotes/approval/LoadingScreen";
import QuoteApprovalContent from "@/components/pages/quotes/approval/QuoteApprovalContent";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const ApproveContent = () => {
  return <QuoteApprovalContent />;
};

const Approve = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to monitoring service in production
        console.error("Quote approval error:", error, errorInfo);
      }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <ApproveContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Approve;
