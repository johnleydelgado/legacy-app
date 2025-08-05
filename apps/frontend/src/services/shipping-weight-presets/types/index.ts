export interface ShippingWeightPreset {
  pk_weight_preset_id: number;
  name: string;
  weight: number;
  description: string | null;
  measurement_unit: "metric" | "imperial";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShippingWeightPresetRequest {
  name: string;
  weight: number;
  description?: string;
  measurement_unit?: "metric" | "imperial";
  is_active?: boolean;
}

export interface UpdateShippingWeightPresetRequest {
  name?: string;
  weight?: number;
  description?: string;
  measurement_unit?: "metric" | "imperial";
  is_active?: boolean;
}

export interface ShippingWeightPresetsResponse {
  data: ShippingWeightPreset[];
  message: string;
}

export interface ShippingWeightPresetResponse {
  data: ShippingWeightPreset;
  message: string;
}

export interface PaginatedShippingWeightPresetsResponse {
  items: ShippingWeightPreset[];
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
