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
} from "lucide-react";
import {
  QuotesQueryParams,
  QuoteSort,
  QuoteFilter,
  SortOrder,
  QuoteSortField,
} from "@/services/quotes/types";
import { useQuotes } from "@/hooks/useQuotes";
import QuotesList from "./sections/quotesList";
import { useQuotesDashboardSummary } from "../../../../hooks/useQuotes";

import moment from "moment";
import { MetricCard } from "./sections/MetricCard";
import { Button } from "../../../ui/button";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCustomerID } from "../../../../features/customers/customersSlice";
import { RootState } from "@/store";

const CRMQuotesPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { fullname } = useSelector((state: RootState) => state.users);

  // Enhanced params state with default sorting
  const [params, setParams] = React.useState<QuotesQueryParams>({ 
    page: 1,
    limit: 10,
    // Default sort by quote ID descending (newest first)
    sort: { 
      pk_quote_id: "DESC"
    }
  });

  // Fetch quotes data
  const {
    data: dataQuotes,
    isLoading: isLoadingQuotes,
    error: errorQuotes,
    refetch: refetchQuotes,
  } = useQuotes(params);

  const {
    data: dataDashboard,
    isLoading: isLoadingDashboard,
    isError: isErrorDashboard,
    error: errorDashboard,
    refetch: refetchDashboard,
    isFetching: isFetchingDashboard,
  } = useQuotesDashboardSummary();

  // Sort helper functions
  const handleSort = (field: QuoteSortField, order: SortOrder) => {
    setParams(prev => ({
      ...prev,
      sort: {
        [field]: order
      },
      page: 1 // Reset to first page when sorting
    }));
  };

  // Filter helper functions
  const handleFilter = (filterKey: keyof QuoteFilter, value: string) => {
    setParams(prev => ({
      ...prev,
      filter: {
        ...prev.filter,
        [filterKey]: value
      },
      page: 1 // Reset to first page when filtering
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setParams(prev => ({
      ...prev,
      filter: undefined,
      page: 1
    }));
  };

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Get current timestamp for last updated
  const lastUpdated = (dataDashboard?.lastUpdated || new Date()).toLocaleString(
    "en-US",
    {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }
  );

  const handleAddQuotesClick = () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(-1));
    router.push("/crm/quotes/add");
  };

  // Loading state
  if (isLoadingDashboard) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2">{}</div>
          <div className="h-10 bg-gray-200 rounded w-48 mb-8">{}</div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg">
                {}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isErrorDashboard) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading status</h3>
          <p className="text-red-600 mt-1">
            {errorDashboard instanceof Error
              ? errorDashboard.message
              : "Failed to load quotes status"}
          </p>
          <button
            onClick={() => refetchDashboard()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            All Quotes
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
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleAddQuotesClick}
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
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
          {/*<Link*/}
          {/*  href="/crm/quotes/add"*/}
          {/*  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"*/}
          {/*>*/}
          {/*  <Plus className="w-4 h-4 mr-2" />*/}
          {/*  New Quote*/}
          {/*</Link>*/}
        </div>
      </div>

      {/* Headline value */}
      <div className="hidden">
        <h2 
          className="text-xs font-semibold uppercase"
          style={{ color: '#6C757D' }}
        >
          Total Value
        </h2>
        <p
          className="font-extrabold tracking-tight leading-none"
          style={{ 
            fontSize: '36px',
            marginTop: "10px",
            color: '#000000'
          }}
        >
          {formatCurrency(dataDashboard?.totalValue || 0)}
        </p>
      </div>

      {/* Main Metric Cards */}
      {dataDashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
            <MetricCard
              icon={<BarChart3 className="w-6 h-6" />}
              title={dataDashboard?.summary.totalValue.label || "Total Value"}
              value={
                dataDashboard
                  ? formatCurrency(dataDashboard.summary.totalValue.amount)
                  : "$0"
              }
              description={dataDashboard?.summary.totalValue.description}
              change={5.2}
              loading={isLoadingDashboard}
            />

            <MetricCard
              icon={<Clock className="w-6 h-6" />}
              title={
                dataDashboard?.summary.awaitingApproval.label ||
                "Awaiting Approval"
              }
              value={dataDashboard?.summary.awaitingApproval.count || 0}
              description={dataDashboard?.summary.awaitingApproval.description}
              change={-2.1}
              loading={isLoadingDashboard}
            />

            <MetricCard
              icon={<User className="w-6 h-6" />}
              title="New This Month"
              value={dataDashboard?.summary.ownerBreakdown.count || 0}
              description="Recent quotes"
              change={12.5}
              loading={isLoadingDashboard}
            />

            <MetricCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Total Revenue"
              value={
                dataDashboard ? formatCurrency(dataDashboard.totalValue) : "$0"
              }
              description="All time"
              change={8.3}
              loading={isLoadingDashboard}
            />
          </div>
        </>
      )}

      {/* Quotes List */}
      <QuotesList
        params={params}
        setParams={setParams}
        data={dataQuotes}
        isLoading={isLoadingQuotes}
        error={errorQuotes}
        refetch={refetchQuotes}
        handleAddQuotesClick={handleAddQuotesClick}
        onSort={handleSort}
        onFilter={handleFilter}
        onClearFilters={clearFilters}
        userOwner={fullname}
      />
    </div>
  );
};

export default CRMQuotesPage;
