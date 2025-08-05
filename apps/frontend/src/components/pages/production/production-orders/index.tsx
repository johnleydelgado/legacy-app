"use client";

import * as React from "react";
import {
  AlertCircle,
  DollarSign,
  User,
  Download,
  Plus,
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import ProductionOrdersList from "./sections/productionOrdersList";
import moment from "moment";
import { ProcessSummaryCard } from "./sections/process-summary-card";
import { MetricCard } from "./sections/metric-card";
import { Button } from "../../../ui/button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  useProductionOrders,
  useSearchProductionOrders,
} from "@/hooks/useProductionOrders";
import type {
  ProductionOrdersResponse,
  SearchProductionOrdersResponse,
  ProductionOrderSearchResult,
  ProductionOrder,
} from "@/services/production-orders/types";

interface DashboardError {
  message: string;
}

// Helper function to transform search results to match the expected format
const transformSearchResultToProductionOrder = (
  searchResult: any
): ProductionOrder => {
  if (!searchResult) {
    throw new Error("Search result is undefined or null");
  }

  // Handle case where customer and factory data might be missing
  // This can happen if the joins don't find matching records
  const customerData = searchResult.customer || {
    id: searchResult.fk_customer_id || 0,
    name: searchResult.customer_name || "Unknown Customer",
  };

  const factoryData = searchResult.factory || {
    id: searchResult.fk_factory_id || 0,
    name: searchResult.factory_name || "Unknown Factory",
  };

  return {
    pk_production_order_id: searchResult.pk_production_order_id,
    customer: {
      id: customerData.id || 0,
      name: customerData.name || "Unknown Customer",
      contacts: {} as any, // Will not be used in list view
    },
    factory: {
      id: factoryData.id || 0,
      name: factoryData.name || "Unknown Factory",
      contacts: {} as any, // Will not be used in list view
    },
    po_number: searchResult.po_number,
    order_date: searchResult.order_date,
    expected_delivery_date: searchResult.expected_delivery_date,
    actual_delivery_date: searchResult.actual_delivery_date || null,
    shipping_method: searchResult.shipping_method,
    status: searchResult.status,
    total_quantity: searchResult.total_quantity,
    total_amount: searchResult.total_amount,
    user_owner: searchResult.user_owner || "Unknown",
    created_at: searchResult.created_at,
    updated_at: searchResult.updated_at,
  };
};

// Helper function to transform search response to match expected format
const transformSearchResponseToProductionOrdersResponse = (
  searchResponse: any
): ProductionOrdersResponse => {
  if (!searchResponse || !searchResponse.data) {
    return {
      items: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1,
      },
    };
  }

  return {
    items: searchResponse.data.map(transformSearchResultToProductionOrder),
    meta: searchResponse.meta,
  };
};

const ProductionOrdersListPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // State for production orders query parameters
  const [params, setParams] = React.useState<{ page: number; search?: string }>(
    {
      page: 1,
    }
  );

  const [searchQuery, setSearchQuery] = React.useState(params.search || "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to page 1 when searching
      if (searchQuery.trim()) {
        setParams((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Determine if we should use search or regular fetch
  const isSearching = debouncedSearchQuery.trim().length > 0;

  // Use the regular Production Orders hook
  const {
    data: productionOrdersData,
    isLoading: isLoadingProductionOrders,
    error: errorProductionOrders,
    refetch: refetchProductionOrders,
  } = useProductionOrders(
    {
      page: params.page,
      itemsPerPage: 10,
    },
    {
      initialData: params.page === 1 && !isSearching ? undefined : undefined,
    }
  );

  // Use the search Production Orders hook
  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useSearchProductionOrders(
    {
      q: debouncedSearchQuery,
      page: params.page,
      limit: 10,
    },
    isSearching
  );

  // Mock loading and error states for dashboard (until we have dashboard API)
  const [isLoadingDashboard, setIsLoadingDashboard] = React.useState(false);
  const [errorDashboard, setErrorDashboard] =
    React.useState<DashboardError | null>(null);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleAddProductionOrderClick = () => {
    router.push("/production/production-orders/add");
  };

  // Transform search results to match expected format
  const transformedSearchResults =
    React.useMemo((): ProductionOrdersResponse | null => {
      if (!searchResults) return null;
      return transformSearchResponseToProductionOrdersResponse(searchResults);
    }, [searchResults]);

  // Use search results if searching, otherwise use regular data
  const currentData = isSearching
    ? transformedSearchResults
    : productionOrdersData;
  const currentIsLoading = isSearching
    ? isLoadingSearch
    : isLoadingProductionOrders;
  const currentIsError = isSearching ? searchError : errorProductionOrders;

  const isLoading = currentIsLoading || isLoadingDashboard;

  // Extract data from current data (search or regular)
  const totalProductionOrders = currentData?.meta?.totalItems ?? 0;

  // Calculate metrics from current data
  const pendingProductionOrders =
    currentData?.items?.filter((order) => order.status === "PENDING").length ??
    0;

  const completedProductionOrders =
    currentData?.items?.filter((order) => order.status === "DELIVERED")
      .length ?? 0;

  const lastUpdated = moment().format("MMMM Do YYYY");

  return (
    <div
      className="space-y-6"
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1
            className="font-semibold"
            style={{
              fontSize: "24px",
              color: "#000000",
              lineHeight: "1",
              margin: "0",
            }}
          >
            All Production Orders
          </h1>
          <div
            className="flex items-center gap-1 text-sm"
            style={{ color: "#6C757D" }}
          >
            <span>●</span>
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="cursor-pointer border-gray-200 hover:bg-gray-50"
            style={{
              height: "36px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button
            onClick={handleAddProductionOrderClick}
            className="cursor-pointer text-white"
            style={{
              backgroundColor: "#67A3F0",
              height: "36px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #67A3F0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(103, 163, 240, 0.81)";
              e.currentTarget.style.borderColor = "rgba(103, 163, 240, 0.81)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#67A3F0";
              e.currentTarget.style.borderColor = "#67A3F0";
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Production Order
          </Button>
        </div>
      </div>

      {/* Headline value */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase">
          Total Production Orders
        </h2>
        <p
          className="font-extrabold tracking-tight leading-none"
          style={{
            fontSize: "36px",
            marginTop: "10px",
            color: "#000000",
          }}
        >
          {totalProductionOrders}
        </p>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Total Orders"
          value={totalProductionOrders}
          description={
            isSearching ? "Search results" : "Total number of production orders"
          }
          change={5.2}
          loading={isLoading}
        />

        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          title="Pending Orders"
          value={pendingProductionOrders}
          description={
            isSearching ? "Pending in search results" : "Awaiting production"
          }
          change={-2.1}
          loading={isLoading}
        />

        <MetricCard
          icon={<User className="w-6 h-6" />}
          title="Completed Orders"
          value={completedProductionOrders}
          description={
            isSearching
              ? "Completed in search results"
              : "Successfully completed"
          }
          change={12.5}
          loading={isLoading}
        />
      </div>

      {/* Production Orders List */}
      <ProductionOrdersList
        params={params}
        setParams={setParams}
        data={
          currentData
            ? {
                data: currentData.items.map((item) => ({
                  id: item.pk_production_order_id,
                  po_number: item.po_number,
                  company_name: item.customer.name,
                  quantity: item.total_quantity,
                  factory: item.factory.name,
                  date_quote_approved: item.order_date,
                  date_order_sent: item.order_date,
                  order_exit_date: item.expected_delivery_date,
                  transit_method: item.shipping_method,
                })),
                meta: {
                  totalItems: currentData.meta.totalItems,
                  currentPage: currentData.meta.currentPage,
                  totalPages: currentData.meta.totalPages,
                },
              }
            : undefined
        }
        isLoading={currentIsLoading}
        error={currentIsError}
        refetch={refetchProductionOrders}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery("")}
      />
    </div>
  );
};

export default ProductionOrdersListPage;
