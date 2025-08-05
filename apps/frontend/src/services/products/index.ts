// services/products/index.tsx
import { apiClient } from "@/lib/axios";
import {
  Product,
  ProductsResponse,
  ProductsCategoryResponse,
  CreateProductDto,
  UpdateProductDto,
  ProductsQueryParams, GetProductsParams, GetProductsCategoryParams,
} from "./types";
import {
  ProductWithPrices,
  ProductsWithPricesResponse,
} from "@/types/product-prices";

export class ProductService {
  private baseUrl = "/api/v1/products";
  private baseCategoryUrl = "/api/v1/products-category";

  async getProducts(params?: ProductsQueryParams): Promise<ProductsResponse> {
    if (params?.search) {
      const searchPage = params.page || 1;
      return this.searchProducts(params.search, searchPage, params.limit);
    }

    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    try {
      const response = await apiClient.get<ProductsResponse>(url);
      return response;
    } catch (error: any) {
      console.error("Error in getProducts:", error);
      throw new Error(
          error.response?.data?.message || "Failed to fetch products"
      );
    }
  }

  // Get all products with pagination and filtersAdd commentMore actions
  async getProductsV2(params: GetProductsParams = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());

    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    return await apiClient.get<ProductsResponse>(url);

  }

  async getProductsCategory(
      params: ProductsQueryParams = {}
  ): Promise<ProductsCategoryResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.sort_by) searchParams.append("sortBy", params.sort_by);
    if (params.sort_order) searchParams.append("sortOrder", params.sort_order);

    const url = `${this.baseCategoryUrl}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    try {
      return await apiClient.get<ProductsCategoryResponse>(url);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to fetch product categories"
      );
    }
  }

  async getProductsCategoryV2(params: GetProductsCategoryParams = {}): Promise<ProductsCategoryResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${this.baseCategoryUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    return await apiClient.get<ProductsCategoryResponse>(url);

  }

  async getProductsByCategory(
      categoryId: number,
      params?: ProductsQueryParams
  ): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("id", categoryId.toString());

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "category_id") {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/category?${searchParams.toString()}`;

    try {
      return await apiClient.get<ProductsResponse>(url);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to fetch products by category"
      );
    }
  }

  // NEW: Get products with prices
  async getProductsWithPrices(
      params?: ProductsQueryParams
  ): Promise<ProductsWithPricesResponse> {
    if (params?.search) {
      const searchPage = params.page || 1;
      return this.searchProductsWithPrices(
          params.search,
          searchPage,
          params.limit
      );
    }

    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "search") {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/with-prices${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    try {
      const response = await apiClient.get<ProductsWithPricesResponse>(url);
      return response;
    } catch (error: any) {
      console.error("Error in getProductsWithPrices:", error);
      throw new Error(
          error.response?.data?.message || "Failed to fetch products with prices"
      );
    }
  }

  private async searchProducts(
      name: string,
      page: number = 1,
      limit: number = 10
  ): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams({
      name,
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${this.baseUrl}/search?${searchParams.toString()}`;

    try {
      const response = await apiClient.get<ProductsResponse>(url);
      return response;
    } catch (error: any) {
      console.error("Error in searchProducts:", error);
      throw new Error(
          error.response?.data?.message || "Failed to search products"
      );
    }
  }

  // Search products - Fixed to use getProductsV2 instead of getProducts
  async searchProductsV2(query: string, params: Omit<GetProductsParams, 'search'> = {}): Promise<ProductsResponse> {
    return this.getProductsV2({...params, search: query});
  }

  // NEW: Search products with prices
  private async searchProductsWithPrices(
      name: string,
      page: number = 1,
      limit: number = 10
  ): Promise<ProductsWithPricesResponse> {
    const searchParams = new URLSearchParams({
      name,
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${this.baseUrl}/search/with-prices?${searchParams.toString()}`;

    try {
      const response = await apiClient.get<ProductsWithPricesResponse>(url);
      return response;
    } catch (error: any) {
      console.error("Error in searchProductsWithPrices:", error);
      throw new Error(
          error.response?.data?.message || "Failed to search products with prices"
      );
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      return await apiClient.get<Product>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to fetch product"
      );
    }
  }

  // NEW: Get product by ID with prices
  async getProductByIdWithPrices(id: number): Promise<ProductWithPrices> {
    try {
      return await apiClient.get<ProductWithPrices>(
          `${this.baseUrl}/${id}/with-prices`
      );
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to fetch product with prices"
      );
    }
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    try {
      return await apiClient.post<Product>(this.baseUrl, productData);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to create product"
      );
    }
  }

  async updateProduct(
      id: number,
      productData: UpdateProductDto
  ): Promise<Product> {
    try {
      return await apiClient.put<Product>(`${this.baseUrl}/${id}`, productData);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to update product"
      );
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to delete product"
      );
    }
  }

  async getProductCategories(
      page: number = 1
  ): Promise<ProductsCategoryResponse> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });

    try {
      return await apiClient.get<ProductsCategoryResponse>(
          `${this.baseCategoryUrl}?${searchParams.toString()}`
      );
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message || "Failed to fetch product categories"
      );
    }
  }

  // NEW: Get products by category with prices
  async getProductsByCategoryWithPrices(
      categoryId: number,
      params?: ProductsQueryParams
  ): Promise<ProductsWithPricesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("id", categoryId.toString());

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "id") {
          searchParams.append(key, value.toString());
        }
      });
    }

    try {
      return await apiClient.get<ProductsWithPricesResponse>(
          `${this.baseUrl}/category/with-prices?${searchParams.toString()}`
      );
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message ||
          "Failed to fetch products by category with prices"
      );
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
