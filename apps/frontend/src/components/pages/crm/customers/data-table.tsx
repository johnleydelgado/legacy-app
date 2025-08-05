"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

// ─── Table schema ──────────────────────────────────────────────────────────────
export type Customer = {
  code: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  lastOrder: string;
  orders: number;
  spent: string;
  status: "Active" | "Inactive";
};

function getStatusPalette(status: string) {
  if (status === "Active") {
    return "bg-green-600";
  }
  return "bg-gray-600";
}

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "company",
    header: () => <span className="cursor-pointer">Company</span>,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.company}</div>
        <span className="text-muted-foreground text-xs">
          {row.original.code}
        </span>
      </div>
    ),
  },
  { accessorKey: "contact", header: "Contact" },
  {
    accessorKey: "email",
    header: "Contact Info",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{row.original.email}</span>
          </div>
        )}
        {row.original.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{row.original.phone}</span>
          </div>
        )}
        {!!row.original.phone && !row.original.email && (
          <div className="flex items-center gap-2 text-sm">
            <span>-</span>
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "lastOrder",
    header: () => <div className="text-right">Last&nbsp;Order</div>,
    cell: ({ cell }) => (
      <div className="text-right">{cell.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "orders",
    header: () => <div className="text-right">Orders</div>,
    cell: ({ cell }) => (
      <div className="text-right">{cell.getValue<number>()}</div>
    ),
  },
  {
    accessorKey: "spent",
    header: () => <div className="text-right">Total Spent</div>,
    cell: ({ cell }) => (
      <div className="text-right font-medium">{cell.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ cell }) => {
      const status = cell.getValue<"Active" | "Inactive">();
      return (
        <StatusBadge status={status} bgColorClass={getStatusPalette(status)} />
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => (
      <Link href={`/crm/customers/${row.original.code.replace("C", "")}`}>
        <Button variant="link">View</Button>
      </Link>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  data: Customer[];
}

export function DataTable({ data }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-card/60">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="px-6 py-3 text-left font-semibold"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() === "asc" && " ▲"}
                  {header.column.getIsSorted() === "desc" && " ▼"}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0 odd:bg-card/40">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
