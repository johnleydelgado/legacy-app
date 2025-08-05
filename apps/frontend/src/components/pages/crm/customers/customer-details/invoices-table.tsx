"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {useInvoices} from "../../../../../hooks/useInvoices";
import { GetCustomerInvoicesParams } from "@/services/invoices/types"

interface InvoicesTableProps {
  customerId: number;
  onAddInvoiceClick: () => void;
  initialParams?: Omit<GetCustomerInvoicesParams, 'page' | 'limit'>;
  enabled?: boolean;
}

/**
 * Renders a paginated table of invoices for a specific customer using shadcn/ui Table.
 * Fetches invoices data using the useInvoicesByCustomer hook with pagination limit of 10.
 */
export function InvoicesTable(
    {
      customerId,
      onAddInvoiceClick,
      initialParams = { customerId },
      enabled = true
    }: InvoicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const params = {
    ...initialParams,
    page: currentPage,
    limit,
  };

  // Use the hooks to fetch data
  const {
    invoices: dataInvoices,
    loading: invoicesLoading,
    error: invoicesError,
    refresh: refreshInvoices,
    goToPage,
    setParams
  } = useInvoices();

  // Ensure we have the latest data whenever the component renders
  // useEffect(() => {
  //   refreshInvoices();
  // }, [refreshInvoices]);

  const invoices = dataInvoices?.items || [];
  const pagination = dataInvoices?.meta;
  const totalPages = pagination ? Math.ceil(pagination.totalItems / limit) : 1;

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  if (invoicesLoading) {
    return (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading invoices...</div>
        </div>
    );
  }

  if (invoicesError) {
    return (
        <div className="flex items-center justify-center py-8">
          <div className="text-destructive">
            Error loading invoices: {invoicesError?.message || "Something went wrong"}
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-4">
        <div className="flex justify-between items-center p-2">
          <h3 className="text-lg font-medium">Invoices</h3>
          <Button size="sm" className="gap-2 cursor-pointer" onClick={onAddInvoiceClick}>
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">No invoices found for this customer</div>
                    </TableCell>
                  </TableRow>
              ) : (
                  invoices.map((invoice) => (
                      <TableRow key={invoice.pk_invoice_id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number || invoice.pk_invoice_id}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.invoice_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {invoice.currency || "USD"} {invoice.total_amount?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-xs"
                            style={{ backgroundColor: invoice.status.color }}
                          >
                            {`${invoice.status.process} - ${invoice.status.status}`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                              href={`/crm/invoices/${invoice.pk_invoice_id}`}
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
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalItems)} of {pagination.totalItems} invoices
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

        {/* Invoices count summary */}
        {pagination && (
            <div className="text-xs text-muted-foreground text-center">
              Total: {pagination.totalItems} invoices
            </div>
        )}
      </div>
  );
}
