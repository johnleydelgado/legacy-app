import {
  ProductionOrderItem,
  CreateProductionOrderItemPayload,
  ProductionOrderKnitColor,
  ProductionOrderBodyColor,
  ProductionOrderPackaging,
  CreateProductionOrderKnitColorPayload,
  CreateProductionOrderBodyColorPayload,
  CreateProductionOrderPackagingPayload,
} from "@/types/production-orders";
import { CreateProductionOrderItemDto } from "@/services/production-order-items/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

// Production Order Items API
export const productionOrderItemsAPI = {
  async create(
    data: CreateProductionOrderItemDto
  ): Promise<ProductionOrderItem> {
    const response = await fetch(`${API_BASE_URL}/production-order-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create production order item");
    }

    return response.json();
  },

  async getById(id: number): Promise<ProductionOrderItem> {
    const response = await fetch(
      `${API_BASE_URL}/production-order-items/${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch production order item");
    }

    return response.json();
  },

  async update(
    id: number,
    data: Partial<CreateProductionOrderItemDto>
  ): Promise<ProductionOrderItem> {
    const response = await fetch(
      `${API_BASE_URL}/production-order-items/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update production order item");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/production-order-items/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete production order item");
    }
  },
};

// Knit Colors API
export const knitColorsAPI = {
  async createMultiple(
    itemId: number,
    colors: Array<{ name: string; fk_yarn_id: number; description?: string }>
  ): Promise<ProductionOrderKnitColor[]> {
    const results = await Promise.all(
      colors.map((color) =>
        fetch(`${API_BASE_URL}/production-orders-knit-colors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fk_production_order_item_id: itemId,
            name: color.name,
            fk_yarn_id: color.fk_yarn_id,
            description: color.description,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error("Failed to create knit color");
          return res.json();
        })
      )
    );

    return results;
  },

  async getByItemId(itemId: number): Promise<ProductionOrderKnitColor[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/production-orders-knit-colors/item/${itemId}`
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch knit colors for item ${itemId}:`,
          response.status,
          response.statusText
        );
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching knit colors for item ${itemId}:`, error);
      return [];
    }
  },

  async deleteByItemId(itemId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/production-orders-knit-colors/item/${itemId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete knit colors");
    }
  },
};

// Body Colors API
export const bodyColorsAPI = {
  async createMultiple(
    itemId: number,
    colors: Array<{ name: string; fk_yarn_id: number; description?: string }>
  ): Promise<ProductionOrderBodyColor[]> {
    const results = await Promise.all(
      colors.map((color) =>
        fetch(`${API_BASE_URL}/production-orders-body-colors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fkProductionOrderItemID: itemId,
            name: color.name,
            fkYarnID: color.fk_yarn_id,
            description: color.description,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error("Failed to create body color");
          return res.json();
        })
      )
    );

    return results;
  },

  async getByItemId(itemId: number): Promise<ProductionOrderBodyColor[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/production-orders-body-colors/item/${itemId}`
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch body colors for item ${itemId}:`,
          response.status,
          response.statusText
        );
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching body colors for item ${itemId}:`, error);
      return [];
    }
  },

  async deleteByItemId(itemId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/production-orders-body-colors/item/${itemId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete body colors");
    }
  },
};

// Packaging API
export const packagingAPI = {
  async createMultiple(
    itemId: number,
    packaging: Array<{ fk_packaging_id: number; quantity: number }>
  ): Promise<ProductionOrderPackaging[]> {
    const results = await Promise.all(
      packaging.map((pkg) =>
        fetch(`${API_BASE_URL}/production-orders-packaging`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fk_production_order_item_id: itemId,
            fk_packaging_id: pkg.fk_packaging_id,
            quantity: pkg.quantity,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error("Failed to create packaging");
          return res.json();
        })
      )
    );

    return results;
  },

  async getByItemId(itemId: number): Promise<ProductionOrderPackaging[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/production-orders-packaging/item/${itemId}`
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch packaging for item ${itemId}:`,
          response.status,
          response.statusText
        );
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching packaging for item ${itemId}:`, error);
      return [];
    }
  },

  async deleteByItemId(itemId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/production-orders-packaging/item/${itemId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete packaging");
    }
  },
};

// Combined service for handling complete item creation with all related data
export const productionOrderItemService = {
  async createCompleteItem(data: {
    // Basic item data
    fk_production_order_id: number;
    fk_product_id: number;
    fk_category_id: number;
    item_name: string;
    item_description: string;
    item_number: string;
    size?: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    // Related data
    knit_colors: Array<{
      name: string;
      fk_yarn_id: number;
      description?: string;
    }>;
    body_colors: Array<{
      name: string;
      fk_yarn_id: number;
      description?: string;
    }>;
    packaging: Array<{ fk_packaging_id: number; quantity: number }>;
  }) {
    try {
      // 1. Create the main production order item
      const itemPayload: CreateProductionOrderItemDto = {
        fkProductionOrderID: data.fk_production_order_id,
        fkProductID: data.fk_product_id,
        fkCategoryID: data.fk_category_id,
        itemName: data.item_name,
        itemDescription: data.item_description,
        itemNumber: data.item_number,
        size: data.size,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        taxRate: data.tax_rate,
      };

      const createdItem = await productionOrderItemsAPI.create(itemPayload);
      const itemId = createdItem.pk_production_order_item_id;

      // 2. Create related records in parallel
      const promises = [];

      if (data.knit_colors.length > 0) {
        promises.push(knitColorsAPI.createMultiple(itemId, data.knit_colors));
      }

      if (data.body_colors.length > 0) {
        promises.push(bodyColorsAPI.createMultiple(itemId, data.body_colors));
      }

      if (data.packaging.length > 0) {
        promises.push(packagingAPI.createMultiple(itemId, data.packaging));
      }

      const relatedResults = await Promise.all(promises);

      return {
        item: createdItem,
        knit_colors: relatedResults[0] || [],
        body_colors: relatedResults[1] || [],
        packaging: relatedResults[2] || [],
      };
    } catch (error) {
      console.error("Error creating complete item:", error);
      throw error;
    }
  },

  async updateCompleteItem(
    itemId: number,
    data: {
      // Basic item data (optional for updates)
      item_name?: string;
      item_description?: string;
      item_number?: string;
      size?: string;
      quantity?: number;
      unit_price?: number;
      tax_rate?: number;
      // Related data
      knit_colors: Array<{
        name: string;
        fk_yarn_id: number;
        description?: string;
      }>;
      body_colors: Array<{
        name: string;
        fk_yarn_id: number;
        description?: string;
      }>;
      packaging: Array<{ fk_packaging_id: number; quantity: number }>;
    }
  ) {
    try {
      // 1. Update the main item if any basic fields are provided
      const itemUpdateData = Object.fromEntries(
        Object.entries(data).filter(
          ([key]) => !["knit_colors", "body_colors", "packaging"].includes(key)
        )
      );

      let updatedItem;
      if (Object.keys(itemUpdateData).length > 0) {
        updatedItem = await productionOrderItemsAPI.update(
          itemId,
          itemUpdateData
        );
      }

      // 2. Delete existing related records
      await Promise.all([
        knitColorsAPI.deleteByItemId(itemId),
        bodyColorsAPI.deleteByItemId(itemId),
        packagingAPI.deleteByItemId(itemId),
      ]);

      // 3. Create new related records
      const promises = [];

      if (data.knit_colors.length > 0) {
        promises.push(knitColorsAPI.createMultiple(itemId, data.knit_colors));
      }

      if (data.body_colors.length > 0) {
        promises.push(bodyColorsAPI.createMultiple(itemId, data.body_colors));
      }

      if (data.packaging.length > 0) {
        promises.push(packagingAPI.createMultiple(itemId, data.packaging));
      }

      const relatedResults = await Promise.all(promises);

      return {
        item: updatedItem,
        knit_colors: relatedResults[0] || [],
        body_colors: relatedResults[1] || [],
        packaging: relatedResults[2] || [],
      };
    } catch (error) {
      console.error("Error updating complete item:", error);
      throw error;
    }
  },
};
