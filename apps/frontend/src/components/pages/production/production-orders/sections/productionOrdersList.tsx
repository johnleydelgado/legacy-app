"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Package } from "lucide-react";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "../../../../ui/button";
import { Input } from "../../../../ui/input";
import { Badge } from "../../../../ui/badge";
import { Skeleton } from "../../../../ui/skeleton";

interface ProductionOrder {
  id: number;
  po_number: string;
  company_name: string;
  quantity: number;
  factory: string;
  date_quote_approved: string;
  date_order_sent: string;
  order_exit_date: string;
  transit_method: string;
}

interface ProductionOrdersData {
  data: ProductionOrder[];
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface ProductionOrdersListProps {
  params: { page: number; search?: string };
  setParams: React.Dispatch<
    React.SetStateAction<{ page: number; search?: string }>
  >;
  data: ProductionOrdersData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onClearSearch?: () => void;
}

// Skeleton component for the table rows
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </TableCell>
    <TableCell>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-20 rounded-full" />
    </TableCell>
    <TableCell>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-8" />
    </TableCell>
  </TableRow>
);

// Loading skeleton for the table
const ProductionOrdersTableSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-14" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-28" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center p-4 border-t">
        <Skeleton className="h-4 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProductionOrdersList: React.FC<ProductionOrdersListProps> = ({
  params,
  setParams,
  data,
  isLoading,
  error,
  refetch,
  searchQuery = "",
  onSearchChange,
  onClearSearch,
}) => {
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch();
    }
  };

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY");
  };

  const getTransitMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "air freight":
        return "bg-blue-100 text-blue-800";
      case "sea freight":
        return "bg-green-100 text-green-800";
      case "ground shipping":
        return "bg-yellow-100 text-yellow-800";
      case "express air":
        return "bg-red-100 text-red-800";
      case "standard shipping":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!data?.meta) return [];

    const items = [];
    const currentPage = data.meta.currentPage;
    const totalPages = data.meta.totalPages;

    // Show at most 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    // Add ellipsis at the beginning if needed
    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink
            className="cursor-pointer"
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add page numbers
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

    // Add ellipsis at the end if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key="last">
          <PaginationLink
            className="cursor-pointer"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Show skeleton loading when initially loading
  if (isLoading && !data?.data) {
    return <ProductionOrdersTableSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Failed to load production orders: {error.message}
          </p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Search Section */}
      <div className="flex flex-row items-center gap-3 mb-6">
        <div className="flex flex-row items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl grow bg-white shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent"
            placeholder="Search production orders..."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="text-xs px-2 py-1 h-auto text-gray-500 hover:text-gray-700"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <Card className="w-full border-0 shadow-sm bg-white rounded-2xl">
        <CardHeader className="border-b border-gray-100 p-6">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Production Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-medium text-sm text-gray-600 px-3">
                  PO#
                </TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">
                  Company Name
                </TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">
                  Quantity
                </TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">
                  Factory
                </TableHead>
                <TableHead className="px-3">
                  <div className="flex flex-col gap-y-0">
                    <p className="text-sm font-medium text-gray-600">
                      Quote Approved /
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      PD Signed
                    </p>
                  </div>
                </TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">
                  Order Sent
                </TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">
                  Order Exit Date
                </TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">
                  Transit Method
                </TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Empty state */}
              {!isLoading &&
                !error &&
                (!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400 mb-4" />
                        <div className="text-gray-900 text-xl font-semibold mb-2">
                          No production orders found
                        </div>
                        <div className="text-gray-600 text-sm max-w-md">
                          Create your first production order to get started
                          managing your production process
                        </div>
                        {searchQuery && (
                          <Button
                            onClick={handleClearSearch}
                            variant="outline"
                            className="mt-4"
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              {/* Data rows */}
              {!isLoading &&
                !error &&
                data?.data &&
                data.data.length > 0 &&
                data.data.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-3 py-3">
                      <div className="font-medium text-sm text-gray-900">
                        <Link
                          href={`/production/production-orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {order.po_number}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="text-sm text-gray-900 min-w-[100px] max-w-[150px] text-wrap">
                        {order.company_name}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        {order.quantity.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="text-sm text-gray-700">
                        {order.factory}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm text-gray-700">
                        {formatDate(order.date_quote_approved)}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm text-gray-700">
                        {formatDate(order.date_order_sent)}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm text-gray-700">
                        {formatDate(order.order_exit_date)}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Badge
                        className={`text-xs font-medium border-0 rounded-full px-2.5 py-0.5 ${getTransitMethodColor(
                          order.transit_method
                        )}`}
                      >
                        {order.transit_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Link
                        href={`/production/production-orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium cursor-pointer inline-flex items-center gap-1"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && !error && data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 px-6 pb-6">
          <div className="text-sm text-gray-600">
            Showing {data.data.length} of {data.meta.totalItems} production
            orders
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={`cursor-pointer transition-colors ${
                    data.meta.currentPage <= 1
                      ? "opacity-50 pointer-events-none"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    data.meta.currentPage > 1 &&
                    handlePageChange(data.meta.currentPage - 1)
                  }
                />
              </PaginationItem>

              {generatePaginationItems()}

              <PaginationItem>
                <PaginationNext
                  className={`cursor-pointer transition-colors ${
                    data.meta.currentPage >= data.meta.totalPages
                      ? "opacity-50 pointer-events-none"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    data.meta.currentPage < data.meta.totalPages &&
                    handlePageChange(data.meta.currentPage + 1)
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ProductionOrdersList;
