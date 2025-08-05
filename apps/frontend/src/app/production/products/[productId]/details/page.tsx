"use client";

import { ProductFormUI } from "@/components/forms/product/product-form";
import { emptyProduct } from "@/lib/initialData";
import { headerTitle } from "@/constants/HeaderTitle";
import {
  useProduct,
  useProductWithPrices,
  useUpdateProduct,
  useProductCategories,
} from "@/hooks/useProducts";
import { useTrims } from "@/hooks/useTrims";
import { usePackaging } from "@/hooks/usePackaging";
import {
  mapProductToForm,
  mapProductFormToCreatePayload,
} from "@/lib/mappers/product/mappers";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import type {
  CreateProductDto,
  UpdateProductDto,
} from "@/services/products/types";
import ProductsLoading from "../../loading";
import type { ProductForm } from "@/components/forms/product/types";

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { details, list } = headerTitle.production.products;
  const productId = Number(params.productId);

  const { data: product, isLoading: isLoadingProduct } = useProduct(productId);
  const { data: trimsData, isLoading: isLoadingTrims } = useTrims();
  const { data: packagingData, isLoading: isLoadingPackaging } = usePackaging();
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useProductCategories(1);
  const updateProduct = useUpdateProduct();

  const initial = mapProductToForm(product || null);

  if (
    isLoadingProduct ||
    isLoadingTrims ||
    isLoadingPackaging ||
    isLoadingCategories
  ) {
    return <ProductsLoading />;
  }

  return (
    <ProductFormUI
      mode="details"
      initial={initial}
      categories={categoriesData?.items ?? []}
      trims={trimsData?.items ?? []}
      packaging={packagingData?.items ?? []}
      productId={productId}
      onSubmit={async (data: ProductForm) => {
        try {
          const createData = mapProductFormToCreatePayload(data, 1);

          const { organizationID, status, ...rest } = createData;

          // Improved status mapping logic
          let mappedStatus: "Active" | "Inactive";
          if (status === "ACTIVE") {
            mappedStatus = "Active";
          } else if (status === "DISCONTINUED") {
            mappedStatus = "Inactive";
          } else {
            // Fallback for any unexpected values
            mappedStatus = "Active";
          }

          const updateData: UpdateProductDto = {
            ...rest,
            status: mappedStatus,
          };

          await updateProduct.mutateAsync({ id: productId, data: updateData });
          toast.success("Product updated successfully");
          router.refresh();
        } catch (err) {
          console.error("Failed to update product:", err);
          toast.error("Failed to update product");
          throw err;
        }
      }}
    />
  );
}
