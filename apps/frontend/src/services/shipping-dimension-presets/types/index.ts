export interface ShippingDimensionPreset {
  pk_dimension_preset_id: number;
  name: string;
  length: number;
  width: number;
  height: number;
  description: string | null;
  measurement_unit: "metric" | "imperial";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShippingDimensionPresetRequest {
  name: string;
  length: number;
  width: number;
  height: number;
  description?: string;
  measurement_unit?: "metric" | "imperial";
  is_active?: boolean;
}

export interface UpdateShippingDimensionPresetRequest {
  name?: string;
  length?: number;
  width?: number;
  height?: number;
  description?: string;
  measurement_unit?: "metric" | "imperial";
  is_active?: boolean;
}

export interface ShippingDimensionPresetsResponse {
  data: ShippingDimensionPreset[];
  message: string;
}

export interface ShippingDimensionPresetResponse {
  data: ShippingDimensionPreset;
  message: string;
}

export interface PaginatedShippingDimensionPresetsResponse {
  items: ShippingDimensionPreset[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}
