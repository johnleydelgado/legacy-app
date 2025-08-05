// Production Orders API Types
export interface ProductionOrder {
  pk_production_order_id: number;
  fk_customer_id: number;
  fk_factory_id: number;
  po_number: string;
  order_date: string; // ISO date string
  expected_delivery_date: string; // ISO date string
  actual_delivery_date?: string; // ISO date string
  shipping_method: 'OCEAN' | 'AIR' | 'GROUND' | 'EXPRESS';
  status: 'PENDING' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  total_quantity: number;
  total_amount: number;
  notes?: string;
  user_owner?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionOrderItem {
  pk_production_order_item_id: number;
  fk_production_order_id: number;
  fk_product_id: number;
  fk_category_id: number;
  item_name: string;
  item_description?: string;
  item_number?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  total: number; // Generated field
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionOrderKnitColor {
  pk_production_orders_knit_color_id: number;
  fk_production_order_item_id: number;
  name: string;
  fk_yarn_id: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface ProductionOrderBodyColor {
  pk_production_orders_body_color_id: number;
  fk_production_order_item_id: number;
  name: string;
  fk_yarn_id: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface ProductionOrderPackaging {
  pk_production_orders_packaging_id: number;
  fk_production_order_item_id: number;
  fk_packaging_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Create/Update Payloads (without generated fields)
export interface CreateProductionOrderPayload {
  fk_customer_id: number;
  fk_factory_id: number;
  po_number: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  shipping_method: 'OCEAN' | 'AIR' | 'GROUND' | 'EXPRESS';
  status?: 'PENDING' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  total_quantity: number;
  total_amount: number;
  notes?: string;
  user_owner?: string;
}

export interface CreateProductionOrderItemPayload {
  fk_production_order_id: number;
  fk_product_id: number;
  fk_category_id: number;
  item_name: string;
  item_description?: string;
  item_number?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
}

export interface CreateProductionOrderKnitColorPayload {
  name: string;
  fk_yarn_id: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateProductionOrderBodyColorPayload {
  name: string;
  fk_yarn_id: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateProductionOrderPackagingPayload {
  fk_production_order_item_id: number;
  fk_packaging_id: number;
  quantity?: number;
}

// Response Types
export interface ProductionOrdersResponse {
  data: ProductionOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductionOrderWithItems extends ProductionOrder {
  items: ProductionOrderItem[];
}

// Detailed response with joined data
export interface ProductionOrderDetailResponse extends ProductionOrder {
  items: (ProductionOrderItem & {
    knit_colors?: (ProductionOrderKnitColor & { yarn_color?: string; color_code?: string })[];
    body_colors?: (ProductionOrderBodyColor & { yarn_color?: string; color_code?: string })[];
    packaging_options?: ProductionOrderPackaging[];
  })[];
  customer?: {
    pk_customer_id: number;
    name: string;
    email?: string;
  };
  factory?: {
    pk_factories_id: number;
    name: string;
    email?: string;
  };
}