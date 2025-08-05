'use client';

import * as React from 'react';
import { Suspense } from 'react';
import PurchaseOrders from '@/components/pages/production/purchase-orders';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import PurchaseOrdersLoading from '@/app/production/purchase-orders/loading';
import type { PurchaseOrdersResponse, OverallKpiApiResponse } from '@/services/purchase-orders/types';

interface PurchaseOrdersClientProps {
    initialData: PurchaseOrdersResponse;
    initialKpiData: OverallKpiApiResponse;
    initialPage: number;
}

// Error fallback component - fix the prop interface to match ErrorBoundary expectations
const PurchaseOrdersErrorFallback = ({ error, retry }: { error?: Error; retry: () => void }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
            {error?.message || 'Failed to load purchase orders'}
        </p>
        <button 
            onClick={retry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            Try again
        </button>
    </div>
);

// Wrapper component for the main purchase orders content
const PurchaseOrdersContent = ({ initialData, initialKpiData, initialPage }: PurchaseOrdersClientProps) => {
    return (
        <PurchaseOrders 
            initialData={initialData}
            initialKpiData={initialKpiData}
            initialPage={initialPage}
        />
    );
};

// Client component wrapper with error boundary and suspense
const PurchaseOrdersClient = ({ initialData, initialKpiData, initialPage }: PurchaseOrdersClientProps) => {
    return (
        <ErrorBoundary
            fallback={PurchaseOrdersErrorFallback}
            onError={(error, errorInfo) => {
                // Log error to monitoring service in production
                console.error('Purchase Orders client error:', error, errorInfo);
            }}
        >
            <Suspense fallback={<PurchaseOrdersLoading />}>
                <PurchaseOrdersContent 
                    initialData={initialData}
                    initialKpiData={initialKpiData}
                    initialPage={initialPage}
                />
            </Suspense>
        </ErrorBoundary>
    );
};

export default PurchaseOrdersClient;
