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
import OrdersList from "./sections/ordersList";
import moment from "moment";
import { ProcessSummaryCard } from "./sections/process-summary-card";
import { MetricCard } from "./sections/metric-card";
import { Button } from "../../../ui/button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setActiveCustomerID } from "../../../../features/customers/customersSlice";
import {setActiveQuotesID, setActiveQuotesNumber} from "../../../../features/quotes/quotesSlice";
import { useDashboardData } from "@/hooks/useOrders";
import OwnerBreakdownCard from "./sections/owner-breakdown-card";
import MonthlyTrendsAnalytics from "./sections/monthly-trends-analytics";

interface DashboardError {
  message: string;
}

const OrdersListPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    dashboardAnalytics,
    processSummary,
    statusDistribution,
    performanceMetrics,
    ownerBreakdown,
    monthlyTrends,
    isLoading,
    isError,
    error,
  } = useDashboardData();

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const lastUpdated = new Date().toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2">{}</div>
          <div className="h-10 bg-gray-200 rounded w-48 mb-8">{}</div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg">{}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
          <p className="text-red-600 mt-1">
            {error instanceof Error
              ? error.message
              : "Failed to load dashboard data"}
          </p>
          <button
            onClick={() => {
              dashboardAnalytics.refetch();
              processSummary.refetch();
              statusDistribution.refetch();
              performanceMetrics.refetch();
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleAddOrderClick = () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(-1));

    // @ts-ignore
    dispatch(setActiveQuotesID(-1));

    // @ts-ignore
    dispatch(setActiveQuotesNumber(""));
    router.push("/crm/orders/add");
  };

  return (
    <div 
      className="space-y-6"
      style={{ 
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between hidden">
        <div className="flex items-center gap-4">
          <h1 
            className="font-semibold"
            style={{ 
              fontSize: '24px', 
              color: '#000000',
              lineHeight: '1',
              margin: '0'
            }}
          >
            All Orders
          </h1>
          <div className="flex items-center gap-1 text-sm" style={{ color: '#6C757D' }}>
            <span>●</span>
            <span>
              Last updated: {moment(lastUpdated).format("MMMM Do YYYY")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="cursor-pointer border-gray-200 hover:bg-gray-50"
            style={{
              height: '36px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button
            onClick={handleAddOrderClick}
            className="cursor-pointer text-white"
            style={{
              backgroundColor: '#67A3F0',
              height: '36px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #67A3F0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(103, 163, 240, 0.81)';
              e.currentTarget.style.borderColor = 'rgba(103, 163, 240, 0.81)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#67A3F0';
              e.currentTarget.style.borderColor = '#67A3F0';
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Order
          </Button>
        </div>
      </div>

      {/* Headline value */}
      <div className="hidden">
        <h2 
          className="text-xs font-semibold uppercase"
          style={{ color: '#6C757D' }}
        >
          {dashboardAnalytics.data?.totalValue?.label || "Total Value"}
        </h2>
        <p
          className="font-extrabold tracking-tight leading-none"
          style={{ 
            fontSize: '36px',
            marginTop: "10px",
            color: '#000000'
          }}
        >
          {formatCurrency(dashboardAnalytics.data?.totalValue?.value || 0)}
        </p>
      </div>

      {/* Main Metric Cards */}
      {dashboardAnalytics.data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <MetricCard
              icon={<BarChart3 className="w-5 h-5" />}
              title={
                dashboardAnalytics.data?.totalRevenue?.label || "Total Value"
              }
              value={formatCurrency(
                dashboardAnalytics.data?.totalRevenue?.value || 0
              )}
              description={`${
                dashboardAnalytics.data?.totalRevenue?.percentage || 0
              }%`}
              change={5.2}
              loading={isLoading}
            />

            <MetricCard
              icon={<Clock className="w-5 h-5" />}
              title={
                dashboardAnalytics.data?.pendingOrders?.label ||
                "Pending Orders"
              }
              value={dashboardAnalytics.data?.pendingOrders?.value || 0}
              description={`${
                dashboardAnalytics.data?.pendingOrders?.percentage || 0
              }%`}
              change={-2.1}
              loading={isLoading}
            />

            <MetricCard
              icon={<User className="w-5 h-5" />}
              title={
                dashboardAnalytics.data?.newThisMonth?.label || "New This Month"
              }
              value={dashboardAnalytics.data?.newThisMonth?.value || 0}
              description="Recent orders"
              change={12.5}
              loading={isLoading}
            />
          </div>

          {/* Analytics Section - Single Row Layout */}
          {/*<div className="grid grid-cols-3 gap-4 h-[400px]">*/}
            {/* Process Summary */}
            {/*<ProcessSummaryCard*/}
            {/*  processSummary={processSummary.data || []}*/}
            {/*  loading={processSummary.isLoading}*/}
            {/*/>*/}

            {/* Top Customers */}
            {/*<OwnerBreakdownCard*/}
            {/*  data={ownerBreakdown.data || []}*/}
            {/*  loading={ownerBreakdown.isLoading}*/}
            {/*/>*/}

            {/* Monthly Trends */}
            {/*<MonthlyTrendsAnalytics*/}
            {/*  data={monthlyTrends.data || []}*/}
            {/*  loading={monthlyTrends.isLoading}*/}
            {/*/>*/}
          {/*</div>*/}
        </>
      )}

      {/* Orders List */}
      <OrdersList handleAddOrderClick={handleAddOrderClick} />
    </div>
  );
};

export default OrdersListPage;
