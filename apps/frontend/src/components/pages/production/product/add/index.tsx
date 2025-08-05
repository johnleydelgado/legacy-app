'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTrims } from "@/hooks/useTrims";
import { usePackaging } from "@/hooks/usePackaging";
import { useProductCategories } from "@/hooks/useProducts";
import { useCreateProduct } from "@/hooks/useProducts";
import { useCreateMultipleProductPrices } from "@/hooks/useProductPrices";
import { headerTitle } from "@/constants/HeaderTitle";
import ProductsLoading from "@/app/production/products/loading";
import { ProductFormUI } from "@/components/forms/product/product-form";
import { emptyProduct } from "@/lib/initialData";
import { ProductForm } from "@/components/forms/product/types";
import { CreateProductDto } from "@/services/products/types";
import { mapProductFormToCreatePayload } from "@/lib/mappers/product/mappers";
import { toast } from "sonner";


const AddProduct = () => {
    const router = useRouter();
    const { add, list } = headerTitle.production.products;

    const { data: trimsData, isLoading: isLoadingTrims } = useTrims();
    const { data: packagingData, isLoading: isLoadingPackaging } = usePackaging();
    const { data: categoriesData, isLoading: isLoadingCategories } = useProductCategories(1);
    
    const createProduct = useCreateProduct();
    const createMultipleProductPrices = useCreateMultipleProductPrices();

    if (isLoadingTrims || isLoadingPackaging || isLoadingCategories) {
        return <ProductsLoading />;
    }
    
    return (
        <ProductFormUI
            mode="create"
            initial={emptyProduct()}
            categories={categoriesData?.items ?? []}
            trims={trimsData?.items ?? []}
            packaging={packagingData?.items ?? []}
            onSubmit={async (data: ProductForm) => {
                try {
                    // Extract price matrix before creating product
                    const priceMatrix = data.priceMatrix?.filter(
                        (item) => !item.isDeleted && item.max_qty > 0 && item.price > 0
                    ) || [];

                    // Create the product first
                    const createData: CreateProductDto = mapProductFormToCreatePayload(data, 1);
                    const newProduct = await createProduct.mutateAsync(createData);

                    // Create product prices if any exist
                    if (priceMatrix.length > 0) {
                        if (!newProduct.pk_product_id) {
                            toast.error(
                                "Product created but failed to get product ID for pricing"
                            );
                            return;
                        }

                        const priceData = priceMatrix.map((item) => ({
                            max_qty: item.max_qty,
                            price: item.price,
                            fk_product_id: newProduct.pk_product_id,
                        }));

                        try {
                            await createMultipleProductPrices.mutateAsync(priceData);
                            toast.success(
                                `Product created successfully with ${priceMatrix.length} price tier(s)`
                            );
                        } catch (priceError) {
                            console.error("Failed to create product prices:", priceError);
                            toast.error(
                                `Product created but failed to create ${priceMatrix.length} price tier(s). You can add them manually later.`
                            );
                            // Don't throw here - the product was created successfully
                        }
                    } else {
                        toast.success("Product created successfully");
                    }

                    router.push(list.href);
                } catch (err) {
                    console.error("Failed to create product:", err);
                    toast.error("Failed to create product");
                    throw err;
                }
            }}
        />
    );
}

export default AddProduct;
