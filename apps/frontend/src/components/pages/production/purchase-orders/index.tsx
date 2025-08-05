'use client';

import * as React from 'react';
import PurchaseOrdersList from './sections/purchase-orders-list';
import ListHeaders from './sections/list-headers';
import { usePurchaseOrders, usePurchaseOrderOverallKpi, useSearchPurchaseOrders } from '@/hooks/usePurchaseOrders';
import { ChartNoAxesColumnIncreasing, CircleAlert, Download, Factory, Filter, Package, Plus, Search, Store, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MetricCard from './sections/metric-card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/helpers/price-formatter';
import type { PurchaseOrdersResponse, OverallKpiApiResponse, PurchaseOrder, PurchaseOrderSearchResult, SearchPurchaseOrdersResponse } from '@/services/purchase-orders/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setActiveCustomerID } from '@/features/customers/customersSlice';
import { setActiveOrdersID, setActiveOrdersNumber } from '@/features/orders/ordersSlice';

interface PurchaseOrdersProps {
    initialData?: PurchaseOrdersResponse;
    initialKpiData?: OverallKpiApiResponse;
    initialPage?: number;
}

// Helper function to transform search results to match the expected format
const transformSearchResultToPurchaseOrder = (searchResult: PurchaseOrderSearchResult): PurchaseOrder => {
    return {
        pk_purchase_order_id: searchResult.pk_purchase_order_id,
        customer: {
            id: searchResult.customer.id,
            name: searchResult.customer.name,
            contacts: {} as any, // Will not be used in list view
        },
        vendor: {
            id: searchResult.vendor.id,
            name: searchResult.vendor.name,
            contacts: {} as any, // Will not be used in list view
        },
        factory: {
            id: searchResult.factory.id,
            name: searchResult.factory.name,
            contacts: {} as any, // Will not be used in list view
        },
        location_type: {
            id: searchResult.location_type.id,
            name: searchResult.location_type.name,
            color: '#6B7280', // Default color for search results
        },
        purchase_order_number: searchResult.purchase_order_number,
        status: {
            id: searchResult.status,
            platform: 'Unknown',
            process: 'Status',
            status: `${searchResult.status}`,
            color: '#6B7280', // Default color for search results
        },
        priority: searchResult.priority,
        client_name: searchResult.client_name,
        quote_approved_date: null, // Not available in search results
        pd_signed_date: null, // Not available in search results
        shipping_date: null, // Not available in search results
        total_quantity: 0, // Not available in search results
        user_owner: 'Unknown', // Not available in search results
        created_at: searchResult.created_at,
        updated_at: searchResult.updated_at,
    };
};

// Helper function to transform search response to match expected format
const transformSearchResponseToPurchaseOrdersResponse = (searchResponse: SearchPurchaseOrdersResponse): PurchaseOrdersResponse => {
    return {
        items: searchResponse.data.map(transformSearchResultToPurchaseOrder),
        meta: searchResponse.meta,
    };
};

const PurchaseOrders = ({ initialData, initialKpiData, initialPage = 1 }: PurchaseOrdersProps) => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [currentPage, setCurrentPage] = React.useState(initialPage);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');

    // Debounce search query
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            // Reset to page 1 when searching
            if (searchQuery.trim()) {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Determine if we should use search or regular fetch
    const isSearching = debouncedSearchQuery.trim().length > 0;

    // Fetch regular purchase orders list (use initialData for first render)
    const { data: dataPurchaseOrders, isLoading: isLoadingOrders, isError } = usePurchaseOrders(
        {
            page: currentPage,
            itemsPerPage: 10,
        },
        {
            initialData: currentPage === initialPage && !isSearching ? initialData : undefined,
        }
    );

    // Fetch search results
    const { 
        data: searchResults, 
        isLoading: isLoadingSearch, 
        isError: isSearchError 
    } = useSearchPurchaseOrders(
        {
            q: debouncedSearchQuery,
            page: currentPage,
            limit: 10,
        },
        isSearching
    );
    
    // Fetch KPI data (use initialKpiData for first render)
    const { data: kpiData, isLoading: isLoadingKpi } = usePurchaseOrderOverallKpi(
        {},
        {
            initialData: initialKpiData,
        }
    );

    // Transform search results to match expected format
    const transformedSearchResults = React.useMemo((): PurchaseOrdersResponse | null => {
        if (!searchResults) return null;
        return transformSearchResponseToPurchaseOrdersResponse(searchResults);
    }, [searchResults]);

    // Use search results if searching, otherwise use regular data
    const currentData = isSearching ? transformedSearchResults : dataPurchaseOrders;
    const currentIsLoading = isSearching ? isLoadingSearch : isLoadingOrders;
    const currentIsError = isSearching ? isSearchError : isError;

    const isLoading = currentIsLoading || isLoadingKpi;

    const handleExport = () => {
        console.log('Exporting purchase orders');
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Calculate metrics from current data (search or regular) and KPI data
    const totalAmount = React.useMemo(() => {
        if (!currentData?.items) return 0;
        return currentData.items.reduce((sum, order) => {
            return sum + (order.total_quantity * 100); // Placeholder calculation
        }, 0);
    }, [currentData]);

    // Get metrics from KPI data (only show global KPIs, not filtered by search)
    const overallKpi = kpiData?.data;
    const totalOrders = overallKpi?.totalOrders ?? 0;
    const totalQuantity = overallKpi?.totalQuantity ?? 0;
    const activeOrders = overallKpi?.activeOrders ?? 0;

    // Calculate unique vendors and customers from current page data
    const uniqueVendors = React.useMemo(() => {
        if (!currentData?.items) return 0;
        const vendorIds = new Set(currentData.items.map(order => order.vendor.id));
        return vendorIds.size;
    }, [currentData]);

    const uniqueCustomers = React.useMemo(() => {
        if (!currentData?.items) return 0;
        const customerIds = new Set(currentData.items.map(order => order.customer.id));
        return customerIds.size;
    }, [currentData]);


    const handleNewPurchaseOrder = () => {
        // @ts-ignore
        dispatch(setActiveCustomerID(-1));

        // @ts-ignore
        dispatch(setActiveOrdersID(-1));
        
        // @ts-ignore
        dispatch(setActiveOrdersNumber(""));

        router.push("/production/purchase-orders/add");
    }
    
    return (
        <div className="space-y-4">
            <ListHeaders handleExport={handleExport} />

            <div className="bg-white p-4 rounded-md hidden">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {isSearching ? 'SEARCH RESULTS' : 'TOTAL QUANTITY'}
                </div>
                {isLoading ? (
                    <Skeleton className="h-12 w-64" />
                ) : (
                    <div className="text-4xl font-bold text-gray-900">
                        {isSearching 
                            ? `${currentData?.meta.totalItems || 0} results`
                            : totalQuantity.toLocaleString()
                        }
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <MetricCard
                    title="Total Orders"
                    value={isSearching ? (currentData?.meta.totalItems || 0) : totalOrders}
                    description={isSearching ? "Search results" : "Total purchase orders"}
                    icon={<ChartNoAxesColumnIncreasing className="w-5 h-5" />}
                    isLoading={isLoading}
                />

                <MetricCard
                    title="Active Orders"
                    value={activeOrders}
                    description="Currently active orders"
                    icon={<CircleAlert className="w-5 h-5" />}
                    isLoading={isLoading}
                />

                <MetricCard
                    title="Unique Customers"
                    value={uniqueCustomers}
                    description={isSearching ? "Customers in search results" : "Customers in current view"}
                    icon={<Users className="w-5 h-5" />}  
                    isLoading={isLoading}
                />

                <MetricCard
                    title="Unique Vendors"
                    value={uniqueVendors}
                    description={isSearching ? "Vendors in search results" : "Vendors in current view"}
                    icon={<Store className="w-5 h-5" />}
                    isLoading={isLoading}
                />
            </div>

            <div className="flex flex-row items-center gap-3 mb-6">
                <div className="flex flex-row items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl grow bg-white shadow-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input 
                        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent"
                        placeholder="Search purchase orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setDebouncedSearchQuery('');
                                setCurrentPage(1);
                            }}
                            className="text-xs px-2 py-1 h-auto text-gray-500 hover:text-gray-700"
                        >
                            Clear
                        </Button>
                    )}
                </div>

                <Button
                    variant="outline"
                    onClick={handleExport}
                    className="flex items-center space-x-2 cursor-pointer h-10 px-4 border-gray-200 hover:bg-gray-50 rounded-xl"
                >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                </Button>
                <Button 
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 cursor-pointer h-10 px-4 rounded-xl shadow-sm"
                    onClick={handleNewPurchaseOrder}
                >
                    <Plus className="h-4 w-4" />
                    <span>New Purchase Order</span>
                </Button>  
            </div>    
            
            {isSearching && debouncedSearchQuery && (
                <div className="text-sm text-gray-600">
                    {currentIsLoading 
                        ? `Searching for "${debouncedSearchQuery}"...`
                        : `Search results for "${debouncedSearchQuery}"`
                    }
                </div>
            )}

            <PurchaseOrdersList 
                purchaseOrdersPagination={currentData || null}
                isLoading={currentIsLoading}
                isError={currentIsError}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default PurchaseOrders;
