"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Plus, Search } from "lucide-react";
import moment from "moment";
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
import {
  ShippingOrdersQueryParams,
  ShippingOrdersResponse,
  ShippingOrdersSearchResponse,
  ShippingOrderTypes,
} from "@/services/shipping-orders/types";
import { Button } from "@/components/ui/button";

export interface ShippingListProps {
  params: ShippingOrdersQueryParams;
  setParams: React.Dispatch<React.SetStateAction<ShippingOrdersQueryParams>>;
  data: ShippingOrdersResponse | ShippingOrdersSearchResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  handleAddShippingClick: () => void;
}

const ShippingList: React.FC<ShippingListProps> = ({
  params,
  setParams,
  data,
  isLoading,
  error,
  refetch,
  handleAddShippingClick,
}) => {
  const [searchQuery, setSearchQuery] = React.useState(params.search || "");
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    handleSearch("");
  };

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

  // Check if data is search response
  const isSearchResponse = (
    data: any
  ): data is ShippingOrdersSearchResponse => {
    return data && "searchTerm" in data;
  };

  // Handle error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">
              Error loading shipping orders
            </h3>
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
        </CardContent>
      </Card>
    );
  }

  // Get data from response
  const shippingOrders = data?.items || [];
  const meta = data?.meta || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  };
  const searchData = isSearchResponse(data) ? data : null;

  // Generate pagination items
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

  return (
    <Card
      className="bg-white border border-gray-200 overflow-hidden"
      style={{
        borderRadius: "14px",
        boxShadow:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <CardHeader
        className="border-b border-gray-200"
        style={{ padding: "24px" }}
      >
        <CardTitle>
          <div className="mb-6 hidden">
            <h1
              className="font-bold"
              style={{
                fontSize: "24px",
                color: "#000000",
                lineHeight: "1",
                margin: "0",
              }}
            >
              All Shipments
            </h1>
            {searchData && (
              <div className="mt-2 text-sm" style={{ color: "#374151" }}>
                <p>
                  {meta.totalItems} results found for "{searchData.searchTerm}"
                </p>
                <p className="text-xs" style={{ color: "#6C757D" }}>
                  Searching in: {searchData.searchFields.join(", ")} | Match
                  type: {searchData.matchType}
                </p>
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription className="flex flex-row items-center gap-2">
          <div className="relative w-full grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              style={{
                paddingLeft: "40px",
                height: "36px",
                borderRadius: "10px",
                fontSize: "14px",
              }}
              type="text"
              placeholder="Search shipments..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-10 border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
              onFocus={(e) => {
                e.target.style.borderColor = "#67A3F0";
                e.target.style.boxShadow = "0 0 0 2px rgba(103, 163, 240, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
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
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled
            >
              <Download className="w-4 h-4 mr-2" />
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
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div className="overflow-x-auto relative">
            <table
              className="min-w-full"
              style={{ borderCollapse: "collapse", fontSize: "14px" }}
            >
              <thead>
                <tr>
                  <th
                    className="text-left border-b border-gray-200"
                    style={{
                      padding: "12px",
                      paddingLeft: "24px",
                      fontWeight: "500",
                      color: "#6C757D",
                      backgroundColor: "#F5F5F5",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Shipping Order Number
                  </th>
                  <th
                    className="text-left border-b border-gray-200"
                    style={{
                      padding: "12px",
                      fontWeight: "500",
                      color: "#6C757D",
                      backgroundColor: "#F5F5F5",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Customer
                  </th>
                  <th
                    className="text-left border-b border-gray-200"
                    style={{
                      padding: "12px",
                      fontWeight: "500",
                      color: "#6C757D",
                      backgroundColor: "#F5F5F5",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Order Date
                  </th>
                  <th
                    className="text-left border-b border-gray-200"
                    style={{
                      padding: "12px",
                      fontWeight: "500",
                      color: "#6C757D",
                      backgroundColor: "#F5F5F5",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Expected Ship Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    className="text-left border-b border-gray-200"
                    style={{
                      padding: "12px",
                      fontWeight: "500",
                      color: "#6C757D",
                      backgroundColor: "#F5F5F5",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white" style={{ minHeight: "400px" }}>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20">
                      <div className="flex flex-col justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="mt-4 text-gray-600">
                          Loading shipments...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : shippingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20">
                      <div className="text-center">
                        <Search className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No shipments found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {params.search
                            ? `No shipments match your search for "${params.search}"`
                            : "No shipments available"}
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
                  shippingOrders.map((shipment: ShippingOrderTypes) => (
                    <tr
                      key={shipment.pk_shipping_order_id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className="whitespace-nowrap"
                        style={{
                          padding: "12px",
                          paddingLeft: "24px",
                        }}
                      >
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#000000" }}
                        >
                          {shipment.shipping_order_number}
                        </div>
                      </td>
                      <td
                        className="whitespace-nowrap"
                        style={{ padding: "12px" }}
                      >
                        <div className="text-sm" style={{ color: "#374151" }}>
                          {shipment.customer?.name ||
                            `Customer ${shipment.customer?.id || "Unknown"}`}
                        </div>
                      </td>
                      <td
                        className="whitespace-nowrap"
                        style={{ padding: "12px" }}
                      >
                        <div className="text-sm" style={{ color: "#374151" }}>
                          {formatDate(shipment.order_date)}
                        </div>
                      </td>
                      <td
                        className="whitespace-nowrap"
                        style={{ padding: "12px" }}
                      >
                        <div className="text-sm" style={{ color: "#374151" }}>
                          {formatDate(shipment.expected_ship_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full`}
                          style={{ backgroundColor: shipment.status.color }}
                        >
                          {`${shipment.status.process} - ${shipment.status.status}`}
                        </span>
                      </td>
                      <td
                        className="whitespace-nowrap"
                        style={{ padding: "12px" }}
                      >
                        <Link
                          href={`/crm/shipping/${shipment.pk_shipping_order_id}`}
                          className="text-sm font-medium transition-colors hover:underline"
                          style={{ color: "#67A3F0" }}
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
        <>
          {/* Shipments summary */}
          {!isLoading && shippingOrders.length > 0 && (
            <div
              className="w-full flex flex-row justify-end border-t border-gray-200 text-xs p-4"
              style={{ color: "#6C757D" }}
            >
              showing {shippingOrders.length} of {meta.totalItems || 0}{" "}
              shipments
            </div>
          )}

          {/* Pagination */}
          {!isLoading && meta.totalPages > 1 && (
            <div className="flex justify-center mt-4 mb-4 w-full">
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
        </>
      </CardFooter>
    </Card>
  );
};

export default ShippingList;
