import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/products";
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductsQueryParams,
} from "@/services/products/types";

// Hook for fetching all products with pagination
export function useProducts(params?: ProductsQueryParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

// NEW: Hook for fetching all products with prices
export function useProductsWithPrices(params?: ProductsQueryParams) {
  return useQuery({
    queryKey: ["products", "withPrices", params],
    queryFn: () => productService.getProductsWithPrices(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for fetching a single product
export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// NEW: Hook for fetching a single product with prices
export function useProductWithPrices(id: number) {
  return useQuery({
    queryKey: ["product", "withPrices", id],
    queryFn: () => productService.getProductByIdWithPrices(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for fetching product categories
export function useProductCategories(page: number = 1) {
  return useQuery({
    queryKey: ["productCategories", page],
    queryFn: () => productService.getProductCategories(page),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating a new product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: CreateProductDto) =>
      productService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "withPrices"] });
    },
  });
}

// Hook for updating a product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
      productService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "withPrices"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["product", "withPrices", variables.id],
      });
    },
  });
}

// Hook for deleting a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // First get the product to get its image URLs
      const product = await productService.getProductById(id);

      if (product) {
        // Collect all image URLs to delete
        const imageUrls = [
          product.image_url,
          ...(product.image_urls || []),
        ].filter(Boolean);

        if (imageUrls.length > 0) {
          try {
            // Delete images from S3
            await fetch("/api/image-upload", {
              method: "DELETE",
              body: JSON.stringify(imageUrls),
            });
          } catch (error) {
            console.error("Failed to delete S3 images:", error);
            // Continue with product deletion even if S3 deletion fails
          }
        }
      }

      // Delete the product from the database
      return await productService.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "withPrices"] });
    },
  });
}

// Hook for fetching products by category
export function useProductsByCategory(
  categoryId: number,
  params?: ProductsQueryParams
) {
  return useQuery({
    queryKey: ["products", "category", categoryId, params],
    queryFn: () => productService.getProductsByCategory(categoryId, params),
    staleTime: 5 * 60 * 1000,
  });
}

// NEW: Hook for fetching products by category with prices
export function useProductsByCategoryWithPrices(
  categoryId: number,
  params?: ProductsQueryParams
) {
  return useQuery({
    queryKey: ["products", "category", "withPrices", categoryId, params],
    queryFn: () =>
      productService.getProductsByCategoryWithPrices(categoryId, params),
    staleTime: 5 * 60 * 1000,
  });
}
