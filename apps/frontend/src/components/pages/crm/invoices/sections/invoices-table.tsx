"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Plus, RefreshCw, Search, Loader2 } from "lucide-react";
import moment from "moment";
import { useSearchInvoices } from "@/hooks/useInvoices";
import { Invoice as InvoiceType, PaginationMeta } from "@/services/invoices/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Badge} from "../../../../ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "../../../../ui/card";

export interface InvoicesTableProps {
  invoices?: InvoiceType[];
  pagination?: PaginationMeta;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  handleAddInvoice?: () => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = (
    {
      invoices = [],
      pagination,
      loading = false,
      onPageChange,
      onSearch,
      handleAddInvoice,
    }) => {
  // Local state for managing search
  const [searchQuery, setSearchQuery] = React.useState("");

  // Search functionality
  const {
    invoices: searchResults,
    loading: searchLoading,
    search,
    goToPage
  } = useSearchInvoices();

  // Determine if we're in search mode
  const isSearchMode = searchQuery.trim().length > 0;

  // Data to display (either passed invoices or search results)
  const displayInvoices = isSearchMode ? searchResults?.items || [] : invoices;
  const displayPagination = isSearchMode ? searchResults?.meta : pagination;
  const isLoading = loading || searchLoading;

  // Debounce search to avoid too many API calls
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = "USD") => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  };

  const formatDate = (dateStringParams: string) => {
    if (!dateStringParams) return "--";
    const dateString = moment(dateStringParams);
    return dateString.format("MMMM D, YYYY");
  };

  const handlePageChange = (newPage: number) => {
    if (isSearchMode) {
      goToPage(newPage);
    } else if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // Handle search input change with debouncing
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout to trigger search after 500ms of no typing
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        search(value);
        if (onSearch) onSearch(value);
      }
    }, 500);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    if (onSearch) onSearch("");
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Calculate total outstanding amount (total - payments)
  const calculateOutstanding = (invoice: InvoiceType) => {
    // This is a simplified calculation; adjust according to your actual data structure
    return invoice.total_amount;
  };

  return (
      <div 
        className="space-y-6"
        style={{
          backgroundColor: '#FFFFFF',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}
      >
        {/* Search Bar */}
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center space-x-2 grow">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9CA3AF' }} />
              <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="pl-10 pr-10 border-gray-300"
                  style={{
                    height: '36px',
                    borderRadius: '10px',
                    fontSize: '14px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#67A3F0';
                    e.target.style.boxShadow = '0 0 0 2px rgba(103, 163, 240, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
              />
              {searchQuery && (
                  <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
            <Button
                variant="outline"
                className="cursor-pointer border-gray-200 hover:bg-gray-50 hidden"
                style={{
                  height: '36px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                // onClick={handleRefresh}
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

        {/* Search Results Count */}
        {isSearchMode && searchResults && (
            <div className="text-sm" style={{ color: '#6C757D' }}>
              <p>
                {searchResults.meta?.totalItems || 0} results found for "{searchQuery}"
              </p>
            </div>
        )}

        {/* Invoices Table */}
        <Card 
          className="bg-white border border-gray-200 overflow-hidden"
          style={{
            borderRadius: '14px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
          }}
        >
          <CardHeader 
            className="border-b border-gray-200"
            style={{ padding: '24px' }}
          >
            <CardTitle 
              style={{ 
                fontSize: '24px',
                fontWeight: '600',
                lineHeight: '1',
                margin: '0',
                color: '#000000'
              }}
            >
              Invoice List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        paddingLeft: '24px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Invoice ID
                    </TableHead>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Customer
                    </TableHead>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Invoice Date
                    </TableHead>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Due Date
                    </TableHead>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Outstanding
                    </TableHead>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Total
                    </TableHead>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Owner
                    </TableHead>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Status
                    </TableHead>
                    <TableHead 
                      className="text-left border-b border-gray-200"
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6C757D',
                        backgroundColor: '#F5F5F5',
                        fontSize: '12px'
                      }}
                    >
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading invoices...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : displayInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Search className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">No invoices found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {isSearchMode
                                  ? `No invoices match your search for "${searchQuery}"`
                                  : "No invoices available"}
                            </p>
                            {isSearchMode && (
                                <Button
                                    variant="link"
                                    onClick={handleClearSearch}
                                    className="mt-2"
                                >
                                  Clear search
                                </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : (
                      displayInvoices.map((invoice) => (
                          <TableRow 
                            key={invoice.pk_invoice_id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <TableCell
                              className="font-medium text-xs text-center"
                              style={{
                                padding: '12px',
                                paddingLeft: '24px',
                                color: '#000000'
                              }}
                            >
                              {invoice.invoice_number}
                            </TableCell>
                            <TableCell
                              className="text-xs"
                              style={{
                                padding: '12px',
                                color: '#374151'
                              }}
                            >
                              {`${invoice.contact.first_name} ${invoice.contact.last_name} - ${invoice.customer_data?.name || ""}`}
                            </TableCell>
                            <TableCell
                              className="text-xs"
                              style={{
                                padding: '12px',
                                color: '#374151'
                              }}
                            >
                              {formatDate(invoice.invoice_date)}
                            </TableCell>
                            <TableCell
                              className="text-xs"
                              style={{
                                padding: '12px',
                                color: '#374151'
                              }}
                            >
                              {formatDate(invoice.due_date)}
                            </TableCell>
                            <TableCell
                              className="font-medium text-xs"
                              style={{
                                padding: '12px',
                                color: '#000000'
                              }}
                            >
                              {formatCurrency(calculateOutstanding(invoice), invoice.currency)}
                            </TableCell>
                            <TableCell
                              className="font-medium text-xs"
                              style={{
                                padding: '12px',
                                color: '#000000'
                              }}
                            >
                              {formatCurrency(invoice.total_amount, invoice.currency)}
                            </TableCell>
                            <TableCell
                              className="text-xs"
                              style={{
                                padding: '12px',
                                color: '#374151'
                              }}
                            >
                              {`${invoice.customer_data?.owner_name || "Unassigned"}`}
                            </TableCell>
                            <TableCell style={{ padding: '12px' }}>
                              <Badge
                                  className="text-xs"
                                  style={{ backgroundColor: invoice.status.color }}>
                                {`${invoice.status.process} - ${invoice.status.status}`}
                              </Badge>
                            </TableCell>
                            <TableCell style={{ padding: '12px' }}>
                              <Link
                                  href={`/crm/invoices/${invoice.pk_invoice_id}`}
                                  className="text-xs font-medium transition-colors hover:underline"
                                  style={{ color: '#67A3F0' }}
                              >
                                View
                              </Link>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {displayPagination && (
                <div className="flex items-center justify-between border-t border-gray-200 p-4">
                  <div className="text-sm" style={{ color: '#6C757D' }}>
                    Showing {((displayPagination.currentPage - 1) * displayPagination.itemsPerPage) + 1} to{" "}
                    {Math.min(
                        displayPagination.currentPage * displayPagination.itemsPerPage,
                        displayPagination.totalItems
                    )}{" "}
                    of {displayPagination.totalItems} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 hover:bg-gray-50"
                        style={{
                          height: '32px',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        onClick={() => handlePageChange(displayPagination.currentPage - 1)}
                        disabled={displayPagination.currentPage === 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm px-2" style={{ color: '#6C757D' }}>
              Page {displayPagination.currentPage} of {displayPagination.totalPages}
            </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 hover:bg-gray-50"
                        style={{
                          height: '32px',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        onClick={() => handlePageChange(displayPagination.currentPage + 1)}
                        disabled={displayPagination.currentPage === displayPagination.totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default InvoicesTable;
