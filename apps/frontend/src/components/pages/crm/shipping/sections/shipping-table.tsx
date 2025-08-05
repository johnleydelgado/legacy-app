"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Funnel, Download, Plus } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

interface UIOrder {
  id: string;
  customer: string;
  orderDate: string;
  deliveryDate: string;
  total: string;
  owner: string;
  status: "COMPLETED" | "PROCESSING" | "ON_HOLD" | "CANCELLED";
}

const mockOrders: UIOrder[] = [
  {
    id: "ORD-001",
    customer: "Acme Corp",
    orderDate: "2024-03-15",
    deliveryDate: "2024-03-20",
    total: "$1,299.99",
    owner: "John Smith",
    status: "PROCESSING",
  },
  {
    id: "ORD-002",
    customer: "TechStart Inc",
    orderDate: "2024-03-14",
    deliveryDate: "2024-03-19",
    total: "$2,499.99",
    owner: "Sarah Johnson",
    status: "COMPLETED",
  },
  {
    id: "ORD-003",
    customer: "Global Solutions",
    orderDate: "2024-03-13",
    deliveryDate: "2024-03-18",
    total: "$899.99",
    owner: "Mike Brown",
    status: "ON_HOLD",
  },
  {
    id: "ORD-004",
    customer: "InnovateTech",
    orderDate: "2024-03-12",
    deliveryDate: "2024-03-17",
    total: "$3,299.99",
    owner: "Lisa Davis",
    status: "CANCELLED",
  },
];

const columns: ColumnDef<UIOrder>[] = [
  {
    accessorKey: "id",
    header: "Order Number",
    cell: ({ cell }) => (
      <div className="font-medium">{cell.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
  },
  {
    accessorKey: "deliveryDate",
    header: "Delivery Date",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ cell }) => (
      <div className="text-right font-medium">{cell.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ cell }) => {
      const v = cell.getValue<
        "COMPLETED" | "PROCESSING" | "ON_HOLD" | "CANCELLED"
      >();
      return <StatusBadge status={v} />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link href={`/crm/orders/${id}`}>
          <Button variant="link" size="sm">
            View
          </Button>
        </Link>
      );
    },
  },
];

export default function OrdersTableClient() {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: mockOrders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {/* ─── toolbar ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders…"
            className="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      {/* ─── table ────────────────────────────────────────── */}
      <div className="rounded-md border">
        <div className="w-full">
          {/* Search bar */}
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-sm font-medium text-gray-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-12 w-12 text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900">
                        No orders found
                      </h3>
                      <p className="text-sm text-gray-500">
                        No orders available
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
