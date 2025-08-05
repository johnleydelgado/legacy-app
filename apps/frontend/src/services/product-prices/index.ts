import { apiClient } from "@/lib/axios";
import {
  ProductPrice,
  ProductPricesResponse,
  CreateProductPriceDto,
  UpdateProductPriceDto,
  ProductPricesQueryParams,
} from "@/types/product-prices";

class ProductPricesService {
  private baseUrl = "/api/v1/product-prices";

  async getProductPrices(
    params?: ProductPricesQueryParams
  ): Promise<ProductPricesResponse> {
    console.log("getProductPrices called with params:", params);

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

    console.log("Making request to:", url);

    try {
      const response = await apiClient.get<ProductPricesResponse>(url);
      console.log("Response received:", response);
      return response;
    } catch (error: any) {
      console.error("Error in getProductPrices:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch product prices"
      );
    }
  }

  async getProductPricesByProductId(
    productId: number,
    params?: ProductPricesQueryParams
  ): Promise<ProductPricesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("productId", productId.toString());

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "productId") {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/product?${searchParams.toString()}`;

    try {
      const response = await apiClient.get<ProductPricesResponse>(url);
      return response;
    } catch (error: any) {
      console.error("Error in getProductPricesByProductId:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch product prices by product ID"
      );
    }
  }

  async getProductPriceById(id: number): Promise<ProductPrice> {
    try {
      return await apiClient.get<ProductPrice>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch product price"
      );
    }
  }

  async createProductPrice(
    productPriceData: CreateProductPriceDto
  ): Promise<ProductPrice> {
    try {
      return await apiClient.post<ProductPrice>(this.baseUrl, productPriceData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create product price"
      );
    }
  }

  async updateProductPrice(
    id: number,
    productPriceData: UpdateProductPriceDto
  ): Promise<ProductPrice> {
    try {
      return await apiClient.put<ProductPrice>(
        `${this.baseUrl}/${id}`,
        productPriceData
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update product price"
      );
    }
  }

  async deleteProductPrice(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete product price"
      );
    }
  }

  // Bulk operations
  async createMultipleProductPrices(
    productPricesData: CreateProductPriceDto[]
  ): Promise<ProductPrice[]> {
    try {
      const promises = productPricesData.map((data) =>
        this.createProductPrice(data)
      );
      return await Promise.all(promises);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to create multiple product prices"
      );
    }
  }

  async deleteProductPricesByProductId(productId: number): Promise<void> {
    try {
      const pricesResponse = await this.getProductPricesByProductId(productId);
      const deletePromises = pricesResponse.items.map((price) =>
        this.deleteProductPrice(price.id)
      );
      await Promise.all(deletePromises);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to delete product prices by product ID"
      );
    }
  }
}

export const productPricesService = new ProductPricesService();
