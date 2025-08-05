// components/OrdersTable.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { useOrdersByCustomer } from "@/hooks/useOrders";
import { OrdersQueryParams } from "@/services/orders/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Plus} from "lucide-react";
import {Badge} from "../../../../ui/badge";

interface OrdersTableProps {
  customerId: number;
  onAddOrderClick: () => void;
  initialParams?: Omit<OrdersQueryParams, 'page' | 'limit'>;
  enabled?: boolean;
}

/**
 * Renders a paginated table of orders for a specific customer using shadcn/ui Table.
 * Fetches orders data using the useOrdersByCustomer hook with pagination limit of 10.
 */
export function OrdersTable(
    {
      customerId,
      onAddOrderClick,
      initialParams = {},
      enabled = true
    }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Fix: Use type assertion to include limit property
  const params = {
    ...initialParams,
    page: currentPage,
    limit,
  } as OrdersQueryParams & { limit: number };

  const {
    data: ordersResponse,
    isLoading,
    error,
    isError,
      refetch: ordersRefetch,
  } = useOrdersByCustomer(customerId, params, enabled);

  ordersRefetch().then();

  const orders = ordersResponse?.items || [];
  const pagination = ordersResponse?.meta;
  const totalPages = pagination ? Math.ceil(pagination.totalItems / limit) : 1;

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading orders...</div>
        </div>
    );
  }

  if (isError) {
    return (
        <div className="flex items-center justify-center py-8">
          <div className="text-destructive">
            Error loading orders: {error?.message || "Something went wrong"}
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-4">
        <div className="flex justify-between items-center p-2">
          <h3 className="text-lg font-medium">Orders</h3>
          <Button size="sm" className="gap-2 cursor-pointer" onClick={onAddOrderClick}>
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-muted-foreground">No orders found for this page</div>
                    </TableCell>
                  </TableRow>
              ) : (
                  orders.map((order) => (
                      <TableRow key={order.pk_order_id}>
                        <TableCell className="font-medium">
                          {order.order_number || order.pk_order_id}
                        </TableCell>
                        <TableCell>
                          {new Date(order.order_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {order.currency || "USD"} {order.total_amount || "0.00"}
                        </TableCell>
                        <TableCell>
                          <Badge style={{ backgroundColor: order.status.color }}>
                            {`${order.status.process} - ${order.status.status}`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                              // href={`/crm/customers/${customerId}/orders/${order.pk_order_id}`}
                              href={`/crm/orders/${order.pk_order_id}`}
                              className="text-primary hover:underline"
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

        {/* Pagination Controls */}
        {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalItems)} of {pagination.totalItems} orders
              </div>

              <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
        )}

        {/* Orders count summary */}
        {pagination && (
            <div className="text-xs text-muted-foreground text-center">
              Total: {pagination.totalItems} orders
            </div>
        )}
      </div>
  );
}
