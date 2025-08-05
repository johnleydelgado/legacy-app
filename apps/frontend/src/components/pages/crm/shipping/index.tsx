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
import ShippingList from "./sections/shippingList";
import moment from "moment";
import { ProcessSummaryCard } from "./sections/process-summary-card";
import { MetricCard } from "./sections/metric-card";
import { Button } from "../../../ui/button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setActiveCustomerID } from "../../../../features/customers/customersSlice";
import {
  setActiveQuotesID,
  setActiveQuotesNumber,
} from "../../../../features/quotes/quotesSlice";
import OwnerBreakdownCard from "./sections/owner-breakdown-card";
import MonthlyTrendsAnalytics from "./sections/monthly-trends-analytics";
import {
  useShippingOrdersDashboardSummary,
  useShippingOrders,
} from "../../../../hooks/useShippingOrders";
import { ShippingOrdersQueryParams } from "../../../../services/shipping-orders/types";

interface DashboardError {
  message: string;
}

const ShippingListPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // State for shipping orders query parameters
  const [params, setParams] = React.useState<ShippingOrdersQueryParams>({
    page: 1,
  });

  // Get dashboard data from hook
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isError: isErrorDashboard,
    error: errorDashboard,
  } = useShippingOrdersDashboardSummary();

  // Get shipping orders data from hook
  const {
    data: shippingOrdersData,
    isLoading: isLoadingShippingOrders,
    error: errorShippingOrders,
    refetch: refetchShippingOrders,
  } = useShippingOrders(params);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleAddShippingClick = () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(-1));

    // @ts-ignore
    dispatch(setActiveQuotesID(-1));

    // @ts-ignore
    dispatch(setActiveQuotesNumber(""));
    router.push("/crm/shipping/add");
  };

  // Show loading state
  if (isLoadingDashboard) {
    return (
      <div className="space-y-8">
        {/* <div className="flex items-center justify-between hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              All Shipments
            </h1>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>●</span>
              <span>Loading...</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleAddShippingClick}
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Button>
          </div>
        </div> */}

        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>

        <ShippingList
          handleAddShippingClick={handleAddShippingClick}
          params={params}
          setParams={setParams}
          data={shippingOrdersData}
          isLoading={isLoadingShippingOrders}
          error={errorShippingOrders}
          refetch={refetchShippingOrders}
        />
      </div>
    );
  }

  // Show error state
  if (isErrorDashboard) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              All Shipments
            </h1>
            <div className="flex items-center gap-1 text-sm text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span>Error loading data</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleAddShippingClick}
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Failed to load dashboard data
              </h3>
              <p className="text-sm text-red-600 mt-1">
                {errorDashboard?.message ||
                  "An error occurred while loading the dashboard data"}
              </p>
            </div>
          </div>
        </div>

        <ShippingList
          handleAddShippingClick={handleAddShippingClick}
          params={params}
          setParams={setParams}
          data={shippingOrdersData}
          isLoading={isLoadingShippingOrders}
          error={errorShippingOrders}
          refetch={refetchShippingOrders}
        />
      </div>
    );
  }

  // Extract data from dashboard response
  const totalShipments = dashboardData?.summary?.totalShipments?.count || 0;
  const totalShippingOrders =
    dashboardData?.totalShippingOrders?.meta?.totalItems || 0;
  const pendingShipments = dashboardData?.summary?.pendingShipments?.count || 0;
  const lastUpdated = dashboardData?.lastUpdated
    ? moment(dashboardData.lastUpdated).format("MMMM Do YYYY")
    : moment().format("MMMM Do YYYY");

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
      <div className="flex items-center justify-between hidden">
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
            All Shipments
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
            onClick={handleAddShippingClick}
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
            New Shipment
          </Button>
        </div>
      </div>

      {/* Headline value */}
      <div className="hidden">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase">
          Total Shipments
        </h2>
        <p
          className="font-extrabold tracking-tight leading-none"
          style={{
            fontSize: "36px",
            marginTop: "10px",
            color: "#000000",
          }}
        >
          {totalShipments}
        </p>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Total Shipments"
          value={totalShipments}
          description="Total number of shipments"
          change={5.2}
          loading={false}
        />

        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          title="Pending Shipments"
          value={pendingShipments}
          description="Awaiting shipment"
          change={-2.1}
          loading={false}
        />

        <MetricCard
          icon={<User className="w-6 h-6" />}
          title="Total Shipments"
          value={totalShippingOrders}
          description="All shipments"
          change={12.5}
          loading={false}
        />
      </div>

      {/* Shipments List */}
      <ShippingList
        params={params}
        setParams={setParams}
        data={shippingOrdersData}
        isLoading={isLoadingShippingOrders}
        error={errorShippingOrders}
        refetch={refetchShippingOrders}
        handleAddShippingClick={handleAddShippingClick}
      />
    </div>
  );
};

export default ShippingListPage;
