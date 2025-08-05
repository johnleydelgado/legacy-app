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

interface UIQuote {
  id: string;
  customer: string;
  dueDate: string;
  outstanding: string;
  total: string;
  owner: string;
  status: "PENDING APPROVAL" | "APPROVED";
}

interface Props {
  quotes: UIQuote[];
}

const columns: ColumnDef<UIQuote>[] = [
  {
    accessorKey: "id",
    header: () => <div>ID</div>,
    cell: ({ cell }) => (
      <div className="font-medium">{cell.getValue<string>()}</div>
    ),
  },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "dueDate", header: "Quote Due Date" },
  {
    accessorKey: "outstanding",
    header: () => <div className="text-right">Outstanding</div>,
    cell: ({ cell }) => (
      <div className="text-right font-medium">{cell.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ cell }) => (
      <div className="text-right font-medium">{cell.getValue<string>()}</div>
    ),
  },
  { accessorKey: "owner", header: "Owner" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ cell }) => {
      const v = cell.getValue<"PENDING APPROVAL" | "APPROVED">();
      return <StatusBadge status={v} />;
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link href={`/crm/quotes/${id}`}>
          <Button variant="link" size="sm">
            View
          </Button>
        </Link>
      );
    },
  },
];

export default function QuotesTableClient({ quotes }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // @ts-ignore
  const table = useReactTable({
    data: quotes,
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
            placeholder="Search quotes…"
            className="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            aria-label="Filters"
          >
            <Funnel className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            aria-label="Export"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Link href="/crm/quotes/new" className="hidden sm:inline-flex">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Quote</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── table card ─────────────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader className="border-b pt-6 pb-3">
          <CardTitle className="text-base sm:text-lg">All Quotes</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* mobile cards */}
          <div className="md:hidden space-y-2 p-4">
            {quotes.map((q) => {
              return (
                <div
                  key={q.id}
                  className="rounded-lg border p-4 text-sm space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{q.customer}</div>
                      <div className="text-xs text-muted-foreground">
                        {q.id}
                      </div>
                    </div>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Due: {q.dueDate}</span>
                    <span>{q.total}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Outstanding: {q.outstanding}</span>
                    <span>{q.owner}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* full table ≥ md */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-card/60">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="px-6 py-3 text-left font-semibold cursor-pointer select-none"
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
                  <tr
                    key={row.id}
                    className="border-b last:border-0 odd:bg-card/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
