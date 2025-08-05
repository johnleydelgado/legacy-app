"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BarChart2, Box, AlertTriangle, DollarSign, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductMetricCard } from "@/components/pages/production/product/product-metric-card";
import ProductTableClient from "@/components/pages/production/product/product-table";
// Remove the problematic import
// import { Pagination } from "@/components/ui/pagination";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/services/products/types";
import ProductsLoading from "./loading";

type UIProduct = {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: string;
  stock: number;
  vendor: string;
  // status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK"
};

// Custom pagination component
const CustomPagination = ({
  page,
  total,
  basePath,
}: {
  page: number;
  total: number;
  basePath: string;
}) => {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    router.push(`${basePath}?page=${newPage}`);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {total}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= total}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default function InventoryProductsPage() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") ?? "1";
  const page = Math.max(1, Number(pageParam));
  const [searchTerm, setSearchTerm] = React.useState("");
  const router = useRouter();

  // Reset page to 1 when search term changes
  React.useEffect(() => {
    if (searchTerm && page !== 1) {
      router.push("/production/products?page=1");
    }
  }, [searchTerm, page, router]);

  const { data, isLoading } = useProducts({
    page,
    limit: 10,
    search: searchTerm,
  });

  // Create a debounced search handler
  const handleSearch = React.useCallback((value: string) => {
    const timer = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ProductsLoading />;
  }

  if (!data) {
    return <div>No products found</div>;
  }

  // 1) map API → UI shape
  const products: UIProduct[] = data.items.map((p: Product) => {
    const stock = p.inventory ?? 0;
    // let status: UIProduct["status"]
    // if (stock === 0) status = "OUT OF STOCK"
    // else if (stock <= 10) status = "LOW STOCK"
    // else status = "IN STOCK"

    return {
      id: String(p.pk_product_id),
      name: p.product_name,
      category: p.product_category?.category_name ?? "—",
      sku: p.sku ?? "—",
      price:
        p.product_price != null ? `$${p.product_price.toFixed(2)}` : "$0.00",
      stock,
      vendor: p.vendor?.name ?? "—",
      // status,
    };
  });

  // 2) metrics
  const totalValue = data.items.reduce(
    (sum, p) => sum + (p.product_price ?? 0) * (p.inventory ?? 0),
    0
  );
  const totalProducts = products.length;
  // const inStockCount = products.filter((p) => p.status === "IN STOCK")
  //     .length
  // const lowStockCount = products.filter((p) => p.status === "LOW STOCK")
  //     .length
  // const outStockCount = products.filter(
  //     (p) => p.status === "OUT OF STOCK"
  // ).length

  const categoryStats = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const catBreakNumbers = Object.values(categoryStats).join("/");
  const catBreakLabels = Object.keys(categoryStats).join("/");

  return (
    <div className="space-y-8">
      {/* headline value */}
      <h2 className="text-xs font-semibold text-muted-foreground uppercase">
        Total Inventory Value
      </h2>
      <p className="text-4xl font-extrabold tracking-tight leading-none">
        ${totalValue.toLocaleString()}
      </p>

      {/* metric cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <ProductMetricCard
          title="Total Products"
          value={totalProducts}
          helper="Product count"
          icon={BarChart2}
          variant="blue"
        />
        <ProductMetricCard
          title="In Stock"
          value={products.filter((p) => p.stock > 10).length}
          helper="Available products"
          icon={Box}
          variant="green"
        />
        <ProductMetricCard
          title="Low Stock"
          value={products.filter((p) => p.stock > 0 && p.stock <= 10).length}
          helper="Need reordering"
          icon={AlertTriangle}
          variant="yellow"
        />
        <ProductMetricCard
          title="Out of Stock"
          value={products.filter((p) => p.stock === 0).length}
          helper="Unavailable products"
          icon={DollarSign}
          variant="red"
        />
        <ProductMetricCard
          title="Category Breakdown"
          value={catBreakNumbers}
          helper={catBreakLabels}
          icon={Shirt}
          variant="violet"
        />
      </div>

      {/* products table + pagination */}
      <ProductTableClient
        products={products}
        onSearch={setSearchTerm}
        searchValue={searchTerm}
      />
      <CustomPagination
        page={data.meta?.currentPage || page}
        total={Math.ceil((data.meta?.totalItems || 0) / 10)}
        basePath="/production/products"
      />
    </div>
  );
}
