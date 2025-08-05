// Color and Packaging data structures for frontend forms
export interface KnitColorFormData {
  name: string;
  fk_yarn_id: number;
  description?: string;
  yarn?: {
    id: number;
    yarn_color: string;
    color_code: string;
    card_number: string;
    yarn_type: string;
  };
}

export interface BodyColorFormData {
  name: string;
  fk_yarn_id: number;
  description?: string;
  yarn?: {
    id: number;
    yarn_color: string;
    color_code: string;
    card_number: string;
    yarn_type: string;
  };
}

export interface PackagingFormData {
  fk_packaging_id: number;
  quantity?: number;
  packaging?: {
    pk_packaging_id: number;
    packaging: string;
    type: string;
    dimensions: string;
    weight_capacity: number;
    unit: string;
    cost: number;
  };
}

export interface ProductionOrderItem {
  productionOrderItemID: number;
  productionOrderID: number;
  productID: number;
  categoryID: number;
  categoryName: string;
  item_name: string;
  item_description: string;
  item_number: string;
  size: string; // Add size field back
  quantity: number;
  unit_price: number;
  total: number;
  taxRate: number; // Added missing taxRate field
  // Updated to use object arrays instead of ID arrays
  knit_colors: KnitColorFormData[];
  body_colors: BodyColorFormData[];
  packaging: PackagingFormData[];
  actionEdit: boolean;
  actionDelete: boolean;
  actionCreate: boolean;
  actionModify: boolean;
  actionEdited: boolean;
  errorState: string[];
  modifyList: string[];
}
