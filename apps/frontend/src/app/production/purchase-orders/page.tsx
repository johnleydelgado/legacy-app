import * as React from 'react';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { purchaseOrdersService } from '@/services/purchase-orders';
import PurchaseOrdersClient from '@/components/client-fallback/purchase-orders/purchase-orders-client';
import type { PurchaseOrdersResponse, OverallKpiApiResponse } from '@/services/purchase-orders/types';

// Server-side data fetching
async function getPurchaseOrdersData(page: number = 1): Promise<{
    purchaseOrders: PurchaseOrdersResponse;
    kpiData: OverallKpiApiResponse;
}> {
    try {
        // Fetch data in parallel on the server
        const [purchaseOrders, kpiData] = await Promise.all([
            purchaseOrdersService.getAllPurchaseOrders({ page, itemsPerPage: 10 }),
            purchaseOrdersService.getOverallKpi()
        ]);

        return { purchaseOrders, kpiData };
    } catch (error) {
        console.error('Failed to fetch purchase orders data:', error);
        throw error;
    }
}

interface PurchaseOrdersPageProps {
    searchParams: Promise<{ page?: string }>;
}

const PurchaseOrdersPage = async ({ searchParams }: PurchaseOrdersPageProps) => {
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);

    try {
        const { purchaseOrders, kpiData } = await getPurchaseOrdersData(page);

        return (
            <Suspense fallback={<div>Loading purchase orders...</div>}>
                <PurchaseOrdersClient 
                    initialData={purchaseOrders}
                    initialKpiData={kpiData}
                    initialPage={page}
                />
            </Suspense>
        );
    } catch (error) {
        console.error('Purchase orders page error:', error);
        notFound();
    }
};

export default PurchaseOrdersPage;
