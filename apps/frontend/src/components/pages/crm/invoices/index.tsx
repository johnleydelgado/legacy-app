"use client";

import * as React from "react";
import { Download, Plus, RefreshCw } from "lucide-react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import InvoicesTable from "./sections/invoices-table";
import { InvoiceAgingCard } from "./sections/invoice-aging-card";
import { useInvoices, useInvoiceKpi } from "@/hooks/useInvoices";
import {useRouter} from "next/navigation";
import {useDispatch} from "react-redux";
import {setActiveCustomerID} from "../../../../features/customers/customersSlice";
import {setActiveQuotesID} from "../../../../features/quotes/quotesSlice";
import {setActiveOrdersID, setActiveOrdersNumber} from "../../../../features/orders/ordersSlice";

const InvoicesListPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Use the hooks to fetch data
  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
    refresh: refreshInvoices,
    goToPage,
    setParams
  } = useInvoices();

  const {
    kpi,
    loading: kpiLoading,
    error: kpiError,
    refresh: refreshKpi
  } = useInvoiceKpi();

  const lastUpdated = new Date().toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Handle refresh of data
  const handleRefresh = () => {
    refreshInvoices();
    refreshKpi();
    toast("Data refreshed", {
      description: "The latest invoice data has been loaded.",
      position: "top-right",
    });
  };

  // Handle search from InvoicesTable
  const handleSearch = (query: string) => {
    if (!query) {
      refreshInvoices();
    }
  };

  const handleAddInvoice = () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(-1));

    // @ts-ignore
    dispatch(setActiveQuotesID(-1));

    // @ts-ignore
    dispatch(setActiveOrdersID(-1));

    // @ts-ignore
    dispatch(setActiveOrdersNumber(""));

    router.push('/crm/invoices/add');
  }

  // Show loading state for initial data fetch
  const isInitialLoading = (invoicesLoading && !invoices) || (kpiLoading && !kpi);

  if (isInitialLoading) {
    return (
        <div className="space-y-8">
          {/* Header Section Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Headline value Skeleton */}
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-5 w-48" />
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-5 w-64" />
            </div>
          </div>

          {/* Analytics Section Skeleton - Invoice Aging */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
            ))}
          </div>

          {/* Invoices Table Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-72" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Table header skeleton */}
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50">
                  {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>

                {/* Table rows skeleton */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-4 border-t">
                      {[...Array(5)].map((_, j) => (
                          <Skeleton key={j} className="h-5 w-full" />
                      ))}
                    </div>
                ))}
              </div>

              {/* Pagination skeleton */}
              <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Show error state
  if (invoicesError || kpiError) {
    return (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-destructive">
            {invoicesError?.message || kpiError?.message || "An error occurred"}
          </p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
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
        {/* Add Toaster component for notifications */}
        <Toaster richColors />

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
              All Invoices
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
                onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
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
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button 
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
              onClick={handleAddInvoice}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Headline value */}
        <div className="flex flex-col space-y-4 hidden">
          <p 
            className="pb-2 text-sm font-medium uppercase"
            style={{ color: '#6C757D' }}
          >
            Total Outstanding Value
          </p>
          <div className="flex flex-col space-y-2">
            <p 
              className="font-bold"
              style={{ 
                fontSize: '36px',
                color: '#000000'
              }}
            >
              {kpi && formatCurrency(kpi.totalOutstanding)}
            </p>
            <p className="text-sm mt-1" style={{ color: '#6C757D' }}>
              Across {kpi?.totalCount || 0} active invoices
            </p>
          </div>
        </div>

        {/* Analytics Section - Invoice Aging */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InvoiceAgingCard
              period="CURRENT (1-30 DAYS)"
              amount={kpi?.current.amount || 0}
              invoiceCount={kpi?.current.count || 0}
              variant="current"
          />
          <InvoiceAgingCard
              period="30-60 DAYS"
              amount={kpi?.thirtyToSixty.amount || 0}
              invoiceCount={kpi?.thirtyToSixty.count || 0}
              variant="thirty"
          />
          <InvoiceAgingCard
              period="61-90 DAYS"
              amount={kpi?.sixtyToNinety.amount || 0}
              invoiceCount={kpi?.sixtyToNinety.count || 0}
              variant="sixty"
          />
          <InvoiceAgingCard
              period="91+ DAYS"
              amount={kpi?.ninetyPlus.amount || 0}
              invoiceCount={kpi?.ninetyPlus.count || 0}
              variant="ninety"
          />
        </div>

        {/* Invoices List */}
        <InvoicesTable
            invoices={invoices?.items || []}
            pagination={invoices?.meta}
            loading={invoicesLoading}
            onPageChange={goToPage}
            onSearch={handleSearch}
            handleAddInvoice={handleAddInvoice}
        />
      </div>
  );
};

export default InvoicesListPage;
