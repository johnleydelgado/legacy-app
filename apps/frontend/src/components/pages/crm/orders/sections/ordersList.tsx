'use client';

import * as React from "react";
import Link from "next/link";
import { Download, Plus, Search, Filter, X } from "lucide-react";
import moment from "moment";
import { useOrders, useSearchOrders } from "@/hooks/useOrders";
import { useStatuses } from "@/hooks/useStatus";
import { StatusItem } from "@/services/status/types";
import { SortDirection, OrderSortDto, OrderFilterDto } from "@/services/orders/types";
import { SortableHeader } from "@/components/custom/table/header/sortable-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export interface OrdersListProps {
  initialParams?: {
    page?: number;
    status?: string;
    search?: string;
  };
  handleAddOrderClick: () => void;
}

type OrderSortField = keyof OrderSortDto;

const OrdersList: React.FC<OrdersListProps> = ({ initialParams = {}, handleAddOrderClick }) => {
  // Local state for managing query parameters
  const [params, setParams] = React.useState<{
    page: number;
    search?: string;
    sort?: OrderSortDto;
    filter?: OrderFilterDto;
  }>({
    page: 1,
    search: initialParams.search,
    sort: {},
    filter: {},
    ...initialParams,
  });

  const [searchQuery, setSearchQuery] = React.useState(params.search || "");
  const [showFilters, setShowFilters] = React.useState(false);

  const [highlightOwner, setHighlightOwner] = React.useState(false);

  const { fullname } = useSelector((state: RootState) => state.users);

  // Fetch statuses for the filter dropdown
  const { 
    data: statusData, 
    isLoading: isStatusLoading,
    error: statusError 
  } = useStatuses({ 
    platform: 'orders', // Filter for order-related statuses
    limit: 100 // Get all order statuses
  });

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

  // Determine if we have a search query
  const hasSearch = Boolean(params.search);

  // Orders query (when no search)
  const ordersQuery = useOrders({
    page: params.page,
    sort: params.sort,
    filter: params.filter,
  });

  // Search query (when searching)
  const searchOrdersQuery = useSearchOrders(
    {
      q: params.search || "",
      page: params.page,
      sort: params.sort,
      filter: params.filter,
    },
    hasSearch // Only enabled when we have a search query
  );

  // Determine which query to use
  const activeQuery = hasSearch ? searchOrdersQuery : ordersQuery;
  const { data, isLoading, error, refetch, isFetching } = activeQuery;

  // Sync local search state with params
  React.useEffect(() => {
    setSearchQuery(params.search || "");
  }, [params.search]);

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (search: string) => {
    setParams((prev) => ({
      ...prev,
      search: search || undefined,
      page: 1,
    }));
  };

  const handleSort = (field: OrderSortField) => {
    setParams((prev) => {
      const currentSort = prev.sort?.[field];
      const newDirection = 
        currentSort === SortDirection.ASC 
          ? SortDirection.DESC 
          : currentSort === SortDirection.DESC 
            ? undefined 
            : SortDirection.ASC;

      const newSort = { ...prev.sort };
      
      if (newDirection) {
        // Clear other sort fields and set new one
        Object.keys(newSort).forEach(key => delete newSort[key as keyof OrderSortDto]);
        newSort[field] = newDirection;
      } else {
        delete newSort[field];
      }

      return {
        ...prev,
        sort: Object.keys(newSort).length > 0 ? newSort : {},
        page: 1,
      };
    });
  };

  const handleFilter = (field: keyof OrderFilterDto, value: string) => {
    setParams((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        [field]: value || undefined,
      },
      page: 1,
    }));
  };

  const clearFilter = (field: keyof OrderFilterDto) => {
    setParams((prev) => {
      const newFilter = { ...prev.filter };
      delete newFilter[field];
      return {
        ...prev,
        filter: newFilter,
        page: 1,
      };
    });
  };

  const clearAllFilters = () => {
    setParams((prev) => ({
      ...prev,
      filter: {},
      sort: {},
      page: 1,
    }));
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

  // Get unique values for owner filter (you might want to fetch these from an API too)
  const userOwnerOptions = ["John Doe", "Jane Smith", "Pca Dev", "Admin"];

  const hasActiveFilters = Object.keys(params.filter || {}).some(key => params.filter?.[key as keyof OrderFilterDto]);
  const hasActiveSort = Object.keys(params.sort || {}).length > 0;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-lg mx-auto mt-20">
          <h3 className="text-red-800 font-medium">Error loading orders</h3>
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

  const { items: orders, meta } = data;

  // Generate pagination items similar to CRMCustomersList
  const generatePaginationItems = () => {
    const { currentPage, totalPages } = meta;

    const items = [] as React.ReactNode[];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          className={`cursor-pointer transition-colors ${
            currentPage === 1 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "hover:bg-gray-50"
          }`}
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
            className={`cursor-pointer transition-colors ${
              i === currentPage 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "hover:bg-gray-50"
            }`}
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
            className={`cursor-pointer transition-colors ${
              currentPage === totalPages 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "hover:bg-gray-50"
            }`}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Card 
      className="bg-white border-0 shadow-sm overflow-hidden rounded-2xl"
    >
      <CardHeader 
        className="border-b border-gray-100 p-6"
      >
        <CardTitle>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              All Orders
            </h1>
            {params.search && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  {meta.totalItems} results found for "{params.search}"
                </p>
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          <div className="flex flex-col gap-4">
            {/* Search and Action Buttons */}
            <div className="flex flex-row items-center gap-3">
              <div className="flex flex-row items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl grow bg-white shadow-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="flex-1 border-none focus:ring-0 outline-none bg-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 cursor-pointer h-10 px-4 border-gray-200 hover:bg-gray-50 rounded-xl ${
                  hasActiveFilters || hasActiveSort ? 'bg-blue-50 border-blue-200' : ''
                }`}
                disabled={isStatusLoading}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {isStatusLoading && (
                  <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
                )}
                {(hasActiveFilters || hasActiveSort) && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                    {Object.keys({...params.filter, ...params.sort}).length}
                  </span>
                )}
              </Button>

              <Button 
                variant="outline"
                className="flex items-center space-x-2 cursor-pointer h-10 px-4 border-gray-200 hover:bg-gray-50 rounded-xl"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              <Button
                onClick={handleAddOrderClick}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 cursor-pointer h-10 px-4 rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Order</span>
              </Button>
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
                        <DropdownMenuItem onClick={() => handleFilter('status', '')}>
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
                              onClick={() => handleFilter('status', status.status.toLowerCase())}
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
                          handleFilter('user_owner', '');
                        } else {
                          handleFilter('user_owner', fullname);
                        }
                      }}
                    >
                      {fullname}
                    </Button>
                  </div>

                  {(hasActiveFilters || hasActiveSort) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {params.filter?.status && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                        Status: {(() => {
                          const matchingStatus = availableStatuses.find(s => s.status.toLowerCase() === params.filter?.status);
                          return matchingStatus ? `${matchingStatus.process} - ${matchingStatus.status}` : params.filter.status;
                        })()}
                        <button onClick={() => clearFilter('status')}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {params.filter?.user_owner && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                        Owner: {params.filter.user_owner}
                        <button onClick={() => clearFilter('user_owner')}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div className="overflow-x-auto relative">
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500">
                    {}
                  </div>
                  <span className="mt-4 text-gray-600">Loading orders...</span>
                </div>
              </div>
            )}
            <table className="min-w-full text-sm">
              <thead>
                <tr className="hover:bg-gray-50">
                  <SortableHeader
                    field="pk_order_id"
                    label="ID"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="customer_name"
                    label="Customer"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="order_date"
                    label="Order Date"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="delivery_date"
                    label="Delivery Date"
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
                    field="status"
                    label="Status"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="user_owner"
                    label="Owner"
                    currentSort={params.sort}
                    onSort={handleSort}
                  />
                  <th className="text-left font-medium text-gray-600 px-3 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="bg-white"
                style={{ minHeight: "400px" }}
              >
                {orders?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16">
                      <div className="text-center">
                        <Search className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-xl font-semibold text-gray-900">
                          No orders found
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 max-w-md mx-auto">
                          {params.search
                            ? `No orders match your search for "${params.search}"`
                            : "Create your first order to get started managing your orders and tracking deliveries"}
                        </p>
                        {params.search && (
                          <button
                            onClick={handleClearSearch}
                            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders?.map((order: any) => (
                    <tr
                      key={order.pk_order_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number || order.pk_order_id}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-900">
                          {`${order.customer_data.name} - ${order.contact.first_name} ${order.contact.last_name}`}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-700">
                          {formatDate(order.order_date)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-700">
                          {formatDate(order.delivery_date)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount, order.currency)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-flex px-2.5 py-0.5 text-xs font-medium text-white rounded-full"
                          style={{ backgroundColor: order.status.color }}
                        >
                          {`${order.status.process} - ${order.status.status}`}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-700">
                          {order.user_owner || "Unassigned"}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/crm/orders/${order.pk_order_id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium cursor-pointer inline-flex items-center gap-1"
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
      </CardContent>
      <CardFooter className="flex flex-col w-full p-0">
        {!isLoading && (
          <>
            {/* Orders summary */}
            {orders.length > 0 && (
              <div className="w-full flex flex-row justify-end border-t border-gray-100 text-sm p-6 text-gray-600">
                Showing {orders.length} of {meta.totalItems || 0} orders
              </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center mt-4 mb-6 w-full">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        className={`cursor-pointer transition-colors ${
                          meta.currentPage <= 1 || isFetching
                            ? "opacity-50 pointer-events-none"
                            : "hover:bg-gray-50"
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
                        className={`cursor-pointer transition-colors ${
                          meta.currentPage >= meta.totalPages || isFetching
                            ? "opacity-50 pointer-events-none"
                            : "hover:bg-gray-50"
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
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrdersList;
