import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Product,
    ProductsResponse,
    GetProductsParams,
    CreateProductDto,
    UpdateProductDto,
} from '@/services/products/types';
import { productService } from '@/services/products';
import {GetProductsCategoryParams, ProductsCategoryResponse} from "../services/products/types";

// Define a more specific type for products by category params
type ProductsByCategoryParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: "Active" | "Inactive";
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
};

// Hook for fetching all products with pagination
export const useProducts = (params: GetProductsParams = {}) => {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await productService.getProductsV2(params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [
        params.page,
        params.limit,
        params.search,
        params.category,
        params.status,
        params.sortBy,
        params.sortOrder,
    ]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const refetch = useCallback(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

// Hook for fetching all products with pagination
export const useProductsCategories = (params: GetProductsCategoryParams = {}) => {
    const [data, setData] = useState<ProductsCategoryResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await productService.getProductsCategoryV2(params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products category');
        } finally {
            setLoading(false);
        }
    }, [
        params.page,
        params.limit,
        params.search,
        params.sortBy,
        params.sortOrder,
    ]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const refetch = useCallback(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

// Hook for fetching a single product by ID
export const useProduct = (id: number | null) => {
    const [data, setData] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await productService.getProductById(id);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch product');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const refetch = useCallback(() => {
        fetchProduct();
    }, [fetchProduct]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

// Hook for products by category - Fixed parameter type
export const useProductsByCategory = (categoryId: number | null, params: ProductsByCategoryParams = {}) => {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProductsByCategory = useCallback(async () => {
        if (!categoryId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await productService.getProductsByCategory(categoryId, params);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products by category');
        } finally {
            setLoading(false);
        }
    }, [categoryId, params.page, params.limit, params.search, params.status, params.sortBy, params.sortOrder]);

    useEffect(() => {
        fetchProductsByCategory();
    }, [fetchProductsByCategory]);

    const refetch = useCallback(() => {
        fetchProductsByCategory();
    }, [fetchProductsByCategory]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

// Hook for product mutations (create, update, delete)
export const useProductMutations = () => {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProduct = useMutation({
        mutationFn: (data: CreateProductDto) => productService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const updateProduct = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
            productService.updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const deleteProduct = useMutation({
        mutationFn: (id: number) => productService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const createProductAsync = useCallback(async (data: CreateProductDto): Promise<Product | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await productService.createProduct(data);
            queryClient.invalidateQueries({ queryKey: ['products'] });
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product');
            return null;
        } finally {
            setLoading(false);
        }
    }, [queryClient]);

    const updateProductAsync = useCallback(async (id: number, data: UpdateProductDto): Promise<Product | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await productService.updateProduct(id, data);
            queryClient.invalidateQueries({ queryKey: ['products'] });
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product');
            return null;
        } finally {
            setLoading(false);
        }
    }, [queryClient]);

    const deleteProductAsync = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await productService.deleteProduct(id);
            queryClient.invalidateQueries({ queryKey: ['products'] });
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product');
            return false;
        } finally {
            setLoading(false);
        }
    }, [queryClient]);

    return {
        // React Query mutations
        createProduct,
        updateProduct,
        deleteProduct,
        // Async functions with loading states
        createProductAsync,
        updateProductAsync,
        deleteProductAsync,
        loading,
        error,
    };
};

// Hook for searching products with debouncing
export const useProductSearch = (initialQuery: string = '', debounceMs: number = 300) => {
    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [query, debounceMs]);

    const searchProducts = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await productService.searchProductsV2(searchQuery);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        searchProducts(debouncedQuery);
    }, [debouncedQuery, searchProducts]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setData(null);
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        data,
        loading,
        error,
        clearSearch,
    };
};

// Hook for product cache management
export const useProductCache = () => {
    const [cache, setCache] = useState<Map<number, Product>>(new Map());

    const addToCache = useCallback((product: Product) => {
        setCache(prev => new Map(prev).set(product.pk_product_id, product));
    }, []);

    const removeFromCache = useCallback((id: number) => {
        setCache(prev => {
            const newCache = new Map(prev);
            newCache.delete(id);
            return newCache;
        });
    }, []);

    const updateCache = useCallback((id: number, updates: Partial<Product>) => {
        setCache(prev => {
            const newCache = new Map(prev);
            const existing = newCache.get(id);
            if (existing) {
                newCache.set(id, { ...existing, ...updates });
            }
            return newCache;
        });
    }, []);

    const getFromCache = useCallback((id: number): Product | undefined => {
        return cache.get(id);
    }, [cache]);

    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    return {
        cache,
        addToCache,
        removeFromCache,
        updateCache,
        getFromCache,
        clearCache,
    };
};

// Hook for infinite products by category - Fixed parameter type
export const useInfiniteProductsByCategory = (categoryId: number | null, params: ProductsByCategoryParams = {}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const isLoadingRef = useRef(false);

    const fetchProducts = useCallback(async (page: number, isLoadMore: boolean = false) => {
        if (isLoadingRef.current || !categoryId) return;

        isLoadingRef.current = true;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setProducts([]);
        }

        setError(null);

        try {
            const result = await productService.getProductsByCategory(categoryId, {
                ...params,
                page,
                limit: params.limit || 20,
            });

            if (!result) {
                throw new Error('No data received from server');
            }

            const data = result.items || [];
            const totalCount = result.meta?.totalItems || 0;

            if (isLoadMore) {
                setProducts(prev => [...prev, ...data]);
            } else {
                setProducts(data);
            }

            setTotalCount(totalCount);
            setCurrentPage(page);

            const totalPages = result.meta?.totalPages || 0;
            setHasNextPage(page < totalPages);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products');

            if (!isLoadMore) {
                setProducts([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isLoadingRef.current = false;
        }
    }, [
        categoryId,
        params.limit,
        params.search,
        params.status,
        params.sortBy,
        params.sortOrder,
    ]);

    const loadMore = useCallback(() => {
        if (!hasNextPage || loadingMore || loading) return;
        fetchProducts(currentPage + 1, true);
    }, [hasNextPage, loadingMore, loading, currentPage, fetchProducts]);

    const refresh = useCallback(() => {
        setCurrentPage(1);
        setHasNextPage(true);
        fetchProducts(1, false);
    }, [fetchProducts]);

    useEffect(() => {
        if (categoryId) {
            setCurrentPage(1);
            setHasNextPage(true);
            fetchProducts(1, false);
        } else {
            setProducts([]);
            setLoading(false);
            setLoadingMore(false);
            setError(null);
        }
    }, [fetchProducts, categoryId]);

    return {
        products,
        loading,
        loadingMore,
        error,
        hasNextPage,
        loadMore,
        refresh,
        totalCount,
        isEmpty: products.length === 0 && !loading
    };
};
