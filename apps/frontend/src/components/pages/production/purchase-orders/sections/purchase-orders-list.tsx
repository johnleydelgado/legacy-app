"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, DollarSign, Package } from "lucide-react";
import moment from "moment";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseOrdersResponse, PurchaseOrderPriority } from "@/services/purchase-orders/types";

export interface PurchaseOrdersListProps {
  purchaseOrdersPagination: PurchaseOrdersResponse | null;
  isLoading: boolean;
  isError: boolean;
  onPageChange?: (page: number) => void;
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
const PurchaseOrdersTableSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-14" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-28" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
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

// Priority text formatting helper
const formatPriorityText = (priority: string) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
};

const PurchaseOrdersList: React.FC<PurchaseOrdersListProps> = ({ 
  purchaseOrdersPagination,
  isLoading,
  isError,
  onPageChange
}) => {
  // Extract data
  const purchaseOrders = purchaseOrdersPagination?.items || [];
  const meta = purchaseOrdersPagination?.meta || {
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 10,
    totalPages: 0,
    currentPage: 1,
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const currentPage = meta.currentPage;
    const totalPages = meta.totalPages;

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
  if (isLoading && !purchaseOrdersPagination?.items) {
    return <PurchaseOrdersTableSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Table Section */}
      <Card className="w-full border-0 shadow-sm bg-white rounded-2xl">
        <CardHeader className="border-b border-gray-100 p-6">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-medium text-sm text-gray-600 px-3">PO#</TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Client</TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Vendor</TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Priority</TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Quantity</TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Location</TableHead>
                <TableHead className="px-3">
                  <div className="flex flex-col gap-y-0">
                    <p className="text-sm font-medium text-gray-600">Quote Approved /</p>
                    <p className="text-sm font-medium text-gray-600">PD Signed</p>
                  </div>
                </TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Shipping Date</TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Status</TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Owner</TableHead>
                <TableHead className="font-medium text-sm text-gray-600 px-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {/* Error state */}
              {isError && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-red-500">
                      Error loading purchase orders. Please try again.
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Empty state */}
              {!isLoading && !isError && purchaseOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-gray-900 text-xl font-semibold mb-2">
                        No purchase orders found
                      </div>
                      <div className="text-gray-600 text-sm max-w-md">
                        Create your first purchase order to get started managing your orders and tracking deliveries
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Data rows */}
              {!isLoading && !isError && purchaseOrders.length > 0 && 
                purchaseOrders.map((purchaseOrder) => (
                  <TableRow key={purchaseOrder.pk_purchase_order_id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-3 py-3">
                      <div className="font-medium text-sm text-gray-900">
                        {purchaseOrder.purchase_order_number || purchaseOrder.pk_purchase_order_id}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="text-sm text-gray-900 min-w-[100px] max-w-[150px] text-wrap">
                        {purchaseOrder.client_name}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="text-sm text-gray-900 min-w-[100px] max-w-[150px] text-wrap">
                        {purchaseOrder.vendor.name || '---'}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm text-gray-700">
                        {formatPriorityText(purchaseOrder.priority)}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        {purchaseOrder.total_quantity}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Badge 
                        className="text-xs font-medium text-white border-0 rounded-full px-2.5 py-0.5" 
                        style={{ backgroundColor: purchaseOrder.location_type.color }}
                      >
                        {purchaseOrder.location_type.name || '---'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm text-gray-700">
                        {moment(purchaseOrder.quote_approved_date).format("MMM DD, YYYY")}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm text-gray-700">
                        {moment(purchaseOrder.shipping_date).format("MMM DD, YYYY")}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Badge
                        className="text-xs font-medium text-white border-0 rounded-full px-2.5 py-0.5"
                        style={{ backgroundColor: purchaseOrder.status.color }}
                      >
                        {`${purchaseOrder.status.process} - ${purchaseOrder.status.status}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        {purchaseOrder.user_owner || '---'}
                      </div>
                    </TableCell>   
                    <TableCell className="px-3 py-3">
                      <Link
                        href={`/production/purchase-orders/${purchaseOrder.pk_purchase_order_id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium cursor-pointer inline-flex items-center gap-1"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && !isError && meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 px-6 pb-6">
          <div className="text-sm text-gray-600">
            Showing {purchaseOrders.length} of {meta.totalItems} purchase orders
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={`cursor-pointer transition-colors ${
                    meta.currentPage <= 1 
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
                    meta.currentPage >= meta.totalPages 
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
    </div>
  );
};

export default PurchaseOrdersList; 