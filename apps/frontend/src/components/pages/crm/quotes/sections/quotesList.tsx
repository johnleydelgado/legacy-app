// components/pages/cmr/quotes/sections/QuotesList.tsx
import * as React from "react";
import Link from "next/link";

import { useDeleteQuote } from "@/hooks/useQuotes";

import {
  QuoteTypes,
  QuotesQueryParams,
  QuotesResponse,
  QuotesSearchResponse,
  QuoteSort,
  QuoteFilter,
  SortOrder,
  QuoteSortField,
} from "@/services/quotes/types";
import { StatusItem } from "@/services/status/types";
import { useStatuses } from "@/hooks/useStatus";
import { Download, Plus, Search, ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import moment from "moment";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SortableHeader } from "@/components/custom/table/header/sortable-header";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface ComponentsProps {
  params: QuotesQueryParams;
  setParams: React.Dispatch<React.SetStateAction<QuotesQueryParams>>;
  data: QuotesResponse | QuotesSearchResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  handleAddQuotesClick: () => void;
  onSort: (field: QuoteSortField, order: SortOrder) => void;
  onFilter: (key: keyof QuoteFilter, value: string) => void;
  onClearFilters: () => void;
  userOwner?: string;
}

const QuotesList: React.FC<ComponentsProps> = ({
  params,
  setParams,
  data,
  isLoading,
  error,
  refetch,  
  handleAddQuotesClick,
  onSort,
  onFilter,
  onClearFilters,
  userOwner = "",
}) => {
  const deleteQuoteMutation = useDeleteQuote();

  // Fetch statuses for the filter dropdown
  const { 
    data: statusData, 
    isLoading: isStatusLoading,
    error: statusError 
  } = useStatuses({ 
    platform: 'quotes', // Filter for quote-related statuses
    limit: 100 // Get all quote statuses
  });

  const [searchQuery, setSearchQuery] = React.useState(params.search || "");
  const [showFilters, setShowFilters] = React.useState(false);

  const [highlightOwner, setHighlightOwner] = React.useState(false);

  // Extract unique statuses for the dropdown
  const availableStatuses = React.useMemo(() => {
    if (!statusData?.items) return [];
    
    // Group by process and status, removing duplicates
    const uniqueStatuses = statusData.items.reduce((acc, item) => {
      const key = `${item.process}-${item.status}`;
      if (!acc.find(existing => `${existing.process}-${existing.status}` === key)) {
        acc.push(item);
      }
      return acc;
    }, [] as StatusItem[]);
    
    return uniqueStatuses.sort((a, b) => a.status.localeCompare(b.status));
  }, [statusData]); 

  // Debounce search to avoid too many API calls
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync local search state with params
  React.useEffect(() => {
    setSearchQuery(params.search || "");
  }, [params.search]);

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status: string) => {
    setParams((prev) => ({ ...prev, status: status || undefined, page: 1 }));
  };

  const handleSearch = (search: string) => {
    setParams((prev) => ({ ...prev, search: search || undefined, page: 1 }));
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
      handleSearch(value);
    }, 500);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    handleSearch("");
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      try {
        await deleteQuoteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete quote:", error);
      }
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
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
    const dateString = moment(dateStringParams);
    return dateString.format("MMMM D, YYYY");
  };

  const getCustomerName = (quote: QuoteTypes) => {
    return (
      quote.customer?.name || `Customer ${quote.customer?.id || "Unknown"}`
    );
  };

  const getOwnerName = (quote: QuoteTypes) => {
    return quote.user_owner || "Undefined User";
  };

  const calculateTotalAmount = (quote: QuoteTypes) => {
    return quote.total_amount || quote.subtotal + quote.tax_total;
  };

  // Check if data is search response
  const isSearchResponse = (data: any): data is QuotesSearchResponse => {
    return data && "searchTerm" in data;
  };

  // Don't return early for loading - show the table structure with loading state

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-lg mx-auto mt-20">
          <h3 className="text-red-800 font-medium">Error loading quotes</h3>
          <p className="text-red-600 mt-1">
            {error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { items: quotes, meta } = data;
  const searchData = isSearchResponse(data) ? data : null;

  // Generate pagination items similar to CRMCustomersList
  const generatePaginationItems = () => {
    const { currentPage, totalPages } = meta;

    const items = [] as React.ReactNode[];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          className="text-xs text-gray-500 cursor-pointer"
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem
          key="ellipsis1"
          className="text-xs text-gray-500 cursor-pointer"
        >
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            className="text-xs text-gray-500 cursor-pointer"
            isActive={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem
          key="ellipsis2"
          className="text-xs text-gray-500 cursor-pointer"
        >
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if it exists
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            className="text-xs text-gray-500 cursor-pointer"
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Update the sort handling to match the generic interface
  const handleSort = (field: QuoteSortField) => {
    const currentOrder = params.sort?.[field];
    const newOrder: SortOrder = currentOrder === 'ASC' ? 'DESC' : 'ASC';
    onSort(field, newOrder);
  };

  return (
    <div 
      className="text-gray-900"
      style={{
        backgroundColor: '#FFFFFF',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <div className="p-6 flex flex-col" style={{ rowGap: "15px" }}>
        {/* Header */}
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 
              className="font-bold"
              style={{ 
                fontSize: '24px',
                color: '#000000',
                lineHeight: '1',
                margin: '0'
              }}
            >
              All Quotes
            </h1>
            {/* Show search results indicator */}
            {searchData && (
              <div className="mt-2 text-sm" style={{ color: '#374151' }}>
                <p>
                  {meta.totalItems} results found for "{searchData.searchTerm}"
                </p>
                <p className="text-xs" style={{ color: '#6C757D' }}>
                  Searching in: {searchData.searchFields.join(", ")} | Match type:{" "}
                  {searchData.matchType}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-row gap-x-2 items-center justify-end flex-wrap">
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-1 flex flex-row gap-x-2 items-center px-4">
                {/* Status Filter */}
                <div className="flex flex-row gap-x-2 items-end">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                  <Select 
                    onValueChange={(value) => value === 'all' ? onClearFilters() : onFilter('status', value)}
                    value={params.filter?.status || 'all'}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={isStatusLoading ? "Loading statuses..." : "All Statuses"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {isStatusLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : statusError ? (
                        <SelectItem value="error" disabled>Error loading statuses</SelectItem>
                      ) : (
                        availableStatuses.map((status) => (
                          <SelectItem 
                            key={status.id} 
                            value={status.status.toLowerCase()}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: status.color }}
                              />
                              {status.process} - {status.status}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Separator orientation="vertical" style={{ height: '30px' }} className="w-px mx-4 bg-gray-200" />            

                <div className="flex flex-row gap-x-2 items-end">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner:</label>
                  <Button 
                    variant="outline" 
                    className={`cursor-pointer border-gray-200 hover:bg-gray-50 ${highlightOwner ? 'bg-blue-100 text-blue-800' : ''}`} 
                    style={{ height: '36px', borderRadius: '10px', fontSize: '14px', fontWeight: '500' }}
                    onClick={() => {
                      setHighlightOwner(!highlightOwner);
                      if (highlightOwner) {
                        onClearFilters();
                      } else {
                        onFilter('user_owner', userOwner);
                      }
                    }}>
                    {userOwner}
                  </Button>
                </div>

                <Separator orientation="vertical" style={{ height: '30px' }} className="w-px mx-4 bg-gray-200" />      

                {/* Active Filters Display */}
                {(params.sort || params.filter) && (
                  <div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium text-gray-700">Active:</span>
                      {params.sort && Object.entries(params.sort).map(([field, order]) => (
                        <span key={field} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Sort: {field} {order}
                        </span>
                      ))}
                      {params.filter && Object.entries(params.filter).map(([key, value]) => {
                        // Find the matching status for better display
                        const matchingStatus = availableStatuses.find(s => s.status.toLowerCase() === value);
                        return (
                          <span key={key} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            {matchingStatus && (
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: matchingStatus.color }} />
                            )}
                            {key}: {matchingStatus ? `${matchingStatus.process} - ${matchingStatus.status}` : value}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setShowFilters(!showFilters);
                if (showFilters) onClearFilters();
              }}
              className="h-9 cursor-pointer"
              disabled={isStatusLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {isStatusLoading && (
                <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
              )}
              {params.filter && Object.keys(params.filter).length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {Object.keys(params.filter).length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="w-full flex flex-row gap-3 items-center">
          <div className="relative w-full grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              style={{ 
                paddingLeft: "40px",
                height: '36px',
                fontSize: '14px'
              }}
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
              onFocus={(e) => {
                e.target.style.borderColor = '#67A3F0';
                e.target.style.boxShadow = '0 0 0 2px rgba(103, 163, 240, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            {/* Clear search button */}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
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

          <div className="flex items-center gap-3">
            <Button
                variant="outline"
                onClick={() => {
                  setShowFilters(!showFilters);
                  if (showFilters) onClearFilters();
                }}
                className="h-9 cursor-pointer rounded-xl"
                disabled={isStatusLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {isStatusLoading && (
                  <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
                )}
                {params.filter && Object.keys(params.filter).length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {Object.keys(params.filter).length}
                  </span>
                )}
            </Button>
            <Button 
              variant="outline"
              className="cursor-pointer border-gray-200 hover:bg-gray-50 rounded-xl"
              style={{ height: '36px', fontSize: '14px', fontWeight: '500' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleAddQuotesClick}
              className="cursor-pointer text-white rounded-xl"
              style={{
                backgroundColor: '#67A3F0',
                height: '36px',
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
          </div>
        </div>       

        {/* Filters Panel */}
        {showFilters && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          {params.filter?.status || "All"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onFilter('status', '')}>
                          All
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {isStatusLoading ? (
                          <DropdownMenuItem disabled>
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
                              Loading statuses...
                            </div>
                          </DropdownMenuItem>
                        ) : statusError ? (
                          <DropdownMenuItem disabled>
                            Error loading statuses
                          </DropdownMenuItem>
                        ) : (
                          availableStatuses.map((status) => (
                            <DropdownMenuItem 
                              key={status.id} 
                              onClick={() => onFilter('status', status.status.toLowerCase())}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: status.color }}
                                />
                                {status.process} - {status.status}
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Owner:</label>
                    <Button
                      variant="outline"
                      className={`cursor-pointer border-gray-200 hover:bg-gray-50 ${highlightOwner ? 'bg-blue-100 text-blue-800' : ''}`}
                      onClick={() => {
                        setHighlightOwner(!highlightOwner);
                        if (highlightOwner) {
                          onFilter('user_owner', '');
                        } else {
                          onFilter('user_owner', userOwner);
                        }
                      }}
                    >
                      {userOwner}
                    </Button>
                  </div>

                  {(showFilters) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClearFilters();
                        setHighlightOwner(false);
                      }}
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Active Filters */}
                {/* {showFilters && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {params.filter?.status && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                        Status: {(() => {
                          const matchingStatus = availableStatuses.find(s => s.status.toLowerCase() === params.filter?.status);
                          return matchingStatus ? `${matchingStatus.process} - ${matchingStatus.status}` : params.filter.status;
                        })()}
                        <button onClick={onClearFilters}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {params.filter?.user_owner && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                        Owner: {params.filter.user_owner}
                        <button onClick={onClearFilters}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )} */}
              </div>
            )}    

        {/* Quotes Table */}
        <div 
          className="bg-white border border-gray-200 overflow-hidden"
          style={{
            borderRadius: '14px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{ borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <SortableHeader
                    field="pk_quote_id"
                    label="ID"
                    currentSort={params.sort}
                    onSort={handleSort}
                    className="text-left cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{
                      padding: '12px',
                      fontWeight: '500',
                      color: '#6C757D',
                      // backgroundColor: '#F5F5F5',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  />
                  <SortableHeader
                    field="customer_name"
                    label="Customer"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="quote_due_date"
                    label="Quote Due Date"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="subtotal"
                    label="Outstanding"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="total_amount"
                    label="Total"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="user_owner"
                    label="Owner"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="status"
                    label="Status"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <th 
                    className="text-left"
                    style={{
                      padding: '12px',
                      fontWeight: '500',
                      color: '#6C757D',
                      // backgroundColor: '#F5F5F5',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="bg-white"
                style={{ minHeight: "400px" }}
              >
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20">
                      <div className="flex flex-col justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="mt-4 text-gray-600">
                          Loading quotes...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20">
                      <div className="text-center">
                        <Search className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No quotes found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {params.search
                            ? `No quotes match your search for "${params.search}"`
                            : "No quotes available"}
                        </p>
                        {params.search && (
                          <button
                            onClick={handleClearSearch}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote: QuoteTypes) => (
                    <tr
                      key={quote.pk_quote_id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td 
                        className="whitespace-nowrap"
                        style={{ 
                          padding: '12px',
                          paddingLeft: '24px'
                        }}
                      >
                        <div className="text-sm font-medium" style={{ color: '#000000' }}>
                          {quote.quote_number || `Q${quote.pk_quote_id}`}
                        </div>
                      </td>
                      <td 
                        className="whitespace-nowrap"
                        style={{ padding: '12px' }}
                      >
                        <div className="text-sm" style={{ color: '#374151' }}>
                          {getCustomerName(quote)}
                        </div>
                      </td>
                      <td 
                        className="whitespace-nowrap"
                        style={{ padding: '12px' }}
                      >
                        <div className="text-sm" style={{ color: '#374151' }}>
                          {formatDate(quote.quote_date)}
                        </div>
                      </td>
                      <td 
                        className="whitespace-nowrap"
                        style={{ padding: '12px' }}
                      >
                        <div className="text-sm font-medium" style={{ color: '#000000' }}>
                          {formatCurrency(quote.subtotal, quote.currency)}
                        </div>
                      </td>
                      <td 
                        className="whitespace-nowrap"
                        style={{ padding: '12px' }}
                      >
                        <div className="text-sm font-medium" style={{ color: '#000000' }}>
                          {formatCurrency(
                            calculateTotalAmount(quote),
                            quote.currency
                          )}
                        </div>
                      </td>
                      <td 
                        className="whitespace-nowrap"
                        style={{ padding: '12px' }}
                      >
                        <div className="text-sm" style={{ color: '#374151' }}>
                          {getOwnerName(quote)}
                        </div>
                      </td>
                      <td 
                        className="whitespace-nowrap"
                        style={{ padding: '12px' }}
                      >
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full`}
                          style={{ backgroundColor: quote.status.color }}
                        >
                          {`${quote.status.process} - ${quote.status.status}`}
                        </span>
                      </td>
                      <td 
                        className="whitespace-nowrap"
                        style={{ padding: '12px' }}
                      >
                        <Link
                          href={`/crm/quotes/${quote.pk_quote_id}`}
                          className="text-sm font-medium transition-colors hover:underline"
                          style={{ color: '#67A3F0' }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quotes summary */}
        {!isLoading && quotes.length > 0 && (
          <div className="w-full flex flex-row justify-end border-t border-solid text-xs text-gray-500 p-4">
            showing {quotes.length} of {meta.totalItems || 0} quotes
          </div>
        )}

        {/* Pagination */}
        {!isLoading && meta.totalPages > 1 && (
          <div className="flex justify-center mt-4 mb-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={`text-xs text-gray-500 p-4 ${
                      meta.currentPage <= 1
                        ? "opacity-50 pointer-events-none"
                        : "cursor-pointer"
                    }`}
                    onClick={() =>
                      meta.currentPage > 1 &&
                      handlePageChange(meta.currentPage - 1)
                    }
                  />
                </PaginationItem>
                {generatePaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    className={`text-xs text-gray-500 p-4 ${
                      meta.currentPage >= meta.totalPages
                        ? "opacity-50 pointer-events-none"
                        : "cursor-pointer"
                    }`}
                    onClick={() =>
                      meta.currentPage < meta.totalPages &&
                      handlePageChange(meta.currentPage + 1)
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotesList;
