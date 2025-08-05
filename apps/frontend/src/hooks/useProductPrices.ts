import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productPricesService } from "@/services/product-prices";
import type {
  CreateProductPriceDto,
  UpdateProductPriceDto,
  ProductPricesQueryParams,
} from "@/types/product-prices";

// Hook for fetching all product prices with pagination
export function useProductPrices(params?: ProductPricesQueryParams) {
  return useQuery({
    queryKey: ["productPrices", params],
    queryFn: () => productPricesService.getProductPrices(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for fetching a single product price
export function useProductPrice(id: number) {
  return useQuery({
    queryKey: ["productPrice", id],
    queryFn: () => productPricesService.getProductPriceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for fetching product prices by product ID
export function useProductPricesByProductId(
  productId: number,
  params?: ProductPricesQueryParams
) {
  return useQuery({
    queryKey: ["productPrices", "byProduct", productId, params],
    queryFn: () =>
      productPricesService.getProductPricesByProductId(productId, params),
    enabled: !!productId && productId > 0, // Only fetch if productId is valid
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for creating a new product price
export function useCreateProductPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productPriceData: CreateProductPriceDto) =>
      productPricesService.createProductPrice(productPriceData),
    onSuccess: (data) => {
      // Invalidate all product prices queries
      queryClient.invalidateQueries({ queryKey: ["productPrices"] });
      // Invalidate specific product's prices
      queryClient.invalidateQueries({
        queryKey: ["productPrices", "byProduct", data.fk_product_id],
      });
      // Invalidate products with prices to refresh the nested data
      queryClient.invalidateQueries({ queryKey: ["products", "withPrices"] });
      queryClient.invalidateQueries({ queryKey: ["product", "withPrices"] });
    },
  });
}

// Hook for updating a product price
export function useUpdateProductPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductPriceDto }) =>
      productPricesService.updateProductPrice(id, data),
    onSuccess: (updatedData, variables) => {
      // Invalidate all product prices queries
      queryClient.invalidateQueries({ queryKey: ["productPrices"] });
      // Invalidate specific product price
      queryClient.invalidateQueries({
        queryKey: ["productPrice", variables.id],
      });
      // Invalidate specific product's prices
      queryClient.invalidateQueries({
        queryKey: ["productPrices", "byProduct", updatedData.fk_product_id],
      });
      // Invalidate products with prices to refresh the nested data
      queryClient.invalidateQueries({ queryKey: ["products", "withPrices"] });
      queryClient.invalidateQueries({ queryKey: ["product", "withPrices"] });
    },
  });
}

// Hook for deleting a product price
export function useDeleteProductPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productPricesService.deleteProductPrice(id),
    onSuccess: () => {
      // Invalidate all product prices queries
      queryClient.invalidateQueries({ queryKey: ["productPrices"] });
      // Invalidate products with prices to refresh the nested data
      queryClient.invalidateQueries({ queryKey: ["products", "withPrices"] });
      queryClient.invalidateQueries({ queryKey: ["product", "withPrices"] });
    },
  });
}

// Hook for creating multiple product prices (bulk operation)
export function useCreateMultipleProductPrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productPricesData: CreateProductPriceDto[]) =>
      productPricesService.createMultipleProductPrices(productPricesData),
    onSuccess: (data) => {
      // Invalidate all product prices queries
      queryClient.invalidateQueries({ queryKey: ["productPrices"] });

      // Invalidate specific products' prices
      const productIds = [...new Set(data.map((price) => price.fk_product_id))];
      productIds.forEach((productId) => {
        queryClient.invalidateQueries({
          queryKey: ["productPrices", "byProduct", productId],
        });
      });

      // Invalidate products with prices to refresh the nested data
      queryClient.invalidateQueries({ queryKey: ["products", "withPrices"] });
      queryClient.invalidateQueries({ queryKey: ["product", "withPrices"] });
    },
  });
}

// Hook for deleting all product prices for a specific product
export function useDeleteProductPricesByProductId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      productPricesService.deleteProductPricesByProductId(productId),
    onSuccess: (_, productId) => {
      // Invalidate all product prices queries
      queryClient.invalidateQueries({ queryKey: ["productPrices"] });
      // Invalidate specific product's prices
      queryClient.invalidateQueries({
        queryKey: ["productPrices", "byProduct", productId],
      });
      // Invalidate products with prices to refresh the nested data
      queryClient.invalidateQueries({ queryKey: ["products", "withPrices"] });
      queryClient.invalidateQueries({ queryKey: ["product", "withPrices"] });
    },
  });
}

// Utility hook to get price for a specific quantity
export function useProductPriceForQuantity(
  productId: number,
  quantity: number
) {
  const { data: productPrices, ...queryResult } =
    useProductPricesByProductId(productId);

  const priceForQuantity =
    productPrices?.items?.find((price) => quantity <= price.max_qty)?.price ||
    null;

  return {
    ...queryResult,
    priceForQuantity,
    productPrices: productPrices?.items || [],
  };
}
