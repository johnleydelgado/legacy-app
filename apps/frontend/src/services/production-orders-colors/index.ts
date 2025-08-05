import { apiClient } from "@/lib/axios";
import {
  ProductionOrderKnitColorsResponse,
  ProductionOrderBodyColorsResponse,
  ProductionOrderPackagingResponse,
  ProductionOrderKnitColor,
  ProductionOrderBodyColor,
  ProductionOrderPackaging,
  CreateProductionOrderKnitColorDto,
  UpdateProductionOrderKnitColorDto,
  CreateProductionOrderBodyColorDto,
  UpdateProductionOrderBodyColorDto,
  CreateProductionOrderPackagingDto,
  UpdateProductionOrderPackagingDto,
} from "./types";

export class ProductionOrderKnitColorsService {
  private readonly endpoint = "/api/v1/production-orders-knit-colors";

  async getAllKnitColors(): Promise<ProductionOrderKnitColorsResponse> {
    return apiClient.get<ProductionOrderKnitColorsResponse>(this.endpoint);
  }

  async getActiveKnitColors(): Promise<ProductionOrderKnitColorsResponse> {
    return apiClient.get<ProductionOrderKnitColorsResponse>(
      `${this.endpoint}/active`
    );
  }

  async getKnitColorById(id: number): Promise<ProductionOrderKnitColor> {
    return apiClient.get<ProductionOrderKnitColor>(`${this.endpoint}/${id}`);
  }

  async createKnitColor(
    data: CreateProductionOrderKnitColorDto
  ): Promise<ProductionOrderKnitColor> {
    return apiClient.post<ProductionOrderKnitColor>(this.endpoint, data);
  }

  async updateKnitColor(
    id: number,
    data: UpdateProductionOrderKnitColorDto
  ): Promise<ProductionOrderKnitColor> {
    return apiClient.put<ProductionOrderKnitColor>(
      `${this.endpoint}/${id}`,
      data
    );
  }

  async deleteKnitColor(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}

export class ProductionOrderBodyColorsService {
  private readonly endpoint = "/api/v1/production-orders-body-colors";

  async getAllBodyColors(): Promise<ProductionOrderBodyColorsResponse> {
    return apiClient.get<ProductionOrderBodyColorsResponse>(this.endpoint);
  }

  async getActiveBodyColors(): Promise<ProductionOrderBodyColorsResponse> {
    return apiClient.get<ProductionOrderBodyColorsResponse>(
      `${this.endpoint}/active`
    );
  }

  async getBodyColorById(id: number): Promise<ProductionOrderBodyColor> {
    return apiClient.get<ProductionOrderBodyColor>(`${this.endpoint}/${id}`);
  }

  async createBodyColor(
    data: CreateProductionOrderBodyColorDto
  ): Promise<ProductionOrderBodyColor> {
    return apiClient.post<ProductionOrderBodyColor>(this.endpoint, data);
  }

  async updateBodyColor(
    id: number,
    data: UpdateProductionOrderBodyColorDto
  ): Promise<ProductionOrderBodyColor> {
    return apiClient.put<ProductionOrderBodyColor>(
      `${this.endpoint}/${id}`,
      data
    );
  }

  async deleteBodyColor(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}

export class ProductionOrderPackagingService {
  private readonly endpoint = "/api/v1/production-orders-packaging";

  async getAllPackaging(): Promise<ProductionOrderPackagingResponse> {
    return apiClient.get<ProductionOrderPackagingResponse>(this.endpoint);
  }

  async getActivePackaging(): Promise<ProductionOrderPackagingResponse> {
    return apiClient.get<ProductionOrderPackagingResponse>(
      `${this.endpoint}/active`
    );
  }

  async getPackagingById(id: number): Promise<ProductionOrderPackaging> {
    return apiClient.get<ProductionOrderPackaging>(`${this.endpoint}/${id}`);
  }

  async createPackaging(
    data: CreateProductionOrderPackagingDto
  ): Promise<ProductionOrderPackaging> {
    return apiClient.post<ProductionOrderPackaging>(this.endpoint, data);
  }

  async updatePackaging(
    id: number,
    data: UpdateProductionOrderPackagingDto
  ): Promise<ProductionOrderPackaging> {
    return apiClient.put<ProductionOrderPackaging>(
      `${this.endpoint}/${id}`,
      data
    );
  }

  async deletePackaging(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const productionOrderKnitColorsService =
  new ProductionOrderKnitColorsService();
export const productionOrderBodyColorsService =
  new ProductionOrderBodyColorsService();
export const productionOrderPackagingService =
  new ProductionOrderPackagingService();
