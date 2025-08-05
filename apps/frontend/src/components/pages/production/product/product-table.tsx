"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Funnel, Download, Plus, X } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import debounce from "lodash/debounce";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { headerTitle } from "@/constants/HeaderTitle";

interface UIProduct {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: string;
  stock: number;
  vendor: string;
}

interface Props {
  products: UIProduct[];
  onSearch: (value: string) => void;
  searchValue: string;
}

/* ─── table columns (client-side) ───────────────────────── */
const columns: ColumnDef<UIProduct>[] = [
  {
    accessorKey: "id",
    header: () => <div>ID</div>,
    cell: ({ cell }) => (
      <div className="font-medium">P-{cell.getValue<string>()}</div>
    ),
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "sku", header: "SKU" },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ cell }) => (
      <div className="text-right font-medium">{cell.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-right">Stock</div>,
    cell: ({ cell }) => (
      <div className="text-right">{cell.getValue<number>()}</div>
    ),
  },
  { accessorKey: "vendor", header: "Vendor" },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <div className="flex justify-end gap-2">
          <Link href={`/production/products/${id}/details`}>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
        </div>
      );
    },
  },
];

/* ─── component ─────────────────────────────────────────── */
export default function ProductTableClient({
  products,
  onSearch,
  searchValue,
}: Props) {
  const { add } = headerTitle.production.products;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  /* keep local input in sync when the parent resets searchValue */
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  /* debounce the parent onSearch so it fires 1 s after typing stops */
  const debouncedOnSearch = useMemo(
    () => debounce(onSearch, 300), // 1000 ms = 1 s
    [onSearch]
  );

  /* cancel any pending debounce timers on unmount */
  useEffect(() => () => debouncedOnSearch.cancel(), [debouncedOnSearch]);

  const handleChange = (value: string) => {
    setLocalSearchValue(value); // update the field immediately
    debouncedOnSearch(value); // trigger parent search after debounce
  };

  /* react-table setup */
  const table = useReactTable({
    data: products,
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products…"
            value={localSearchValue}
            onChange={(e) => handleChange(e.target.value)}
            className="h-9 w-full rounded-md border bg-transparent pl-9 pr-12 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => handleChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-4 w-4 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-all hover:scale-125"
            aria-label="Clear search"
          >
            <X className="h-2 w-2" />
          </button>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 rounded-xl"
            aria-label="Filters"
          >
            <Funnel className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 rounded-xl"
            aria-label="Export"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Link href={add.href} className="hidden sm:inline-flex">
            <Button
              size="sm"
              className="gap-1 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{add.title}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── table card ─────────────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader className="border-b pt-6 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              {localSearchValue ? "Search Results" : "All Products"}
            </CardTitle>
          </div>
          {localSearchValue && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing results for "{localSearchValue}"
            </p>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* ── mobile cards ── */}
          <div className="md:hidden space-y-2 p-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border p-4 text-sm space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.id}</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{p.category}</span>
                  <span>{p.price}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Stock: {p.stock}</span>
                  <span>{p.vendor}</span>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Link href={`/production/products/${p.id}/details`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── full table ≥ md ── */}
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
