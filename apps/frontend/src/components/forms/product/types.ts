// Define the quantity breaks
export type QuantityBreak = 180 | 300 | 500 | 1000 | 2500 | 5000;

// Define pricing tier
export interface PricingTier {
  [key: number]: number; // quantity break -> price
}

// Define the complete pricing structure
export interface TieredPricing {
  economy: PricingTier; // Ocean freight
  expedited: PricingTier; // Air freight
}

// Define the simplified pricing structure
export interface SimplePricing {
  basePrice?: number;
  suggestedPrices?: { [key: number]: number };
}

// Define price matrix item for quantity-based pricing (aligned with backend)
export interface PriceMatrixItem {
  id?: number; // backend ID for existing prices, undefined for new ones
  tempId?: string; // temporary ID for new items before saving
  max_qty: number; // changed from quantity to match backend
  price: number;
  fk_product_id?: number; // will be set when saving
  isNew?: boolean; // flag to indicate if this is a new item
  isDeleted?: boolean; // flag to indicate if this item should be deleted
}

export interface ProductForm {
  /* —–– Details —–– */
  product_id?: string;
  category: string | number; // string for form, number for API
  name: string;
  style: string;
  status: "ACTIVE" | "DISCONTINUED";
  imageURL: File | null | string; // File for upload, string for display
  imageURLs: (string | File)[]; // Array of image URLs and Files for multiple images

  // —–– Decoration —–– */

  trims: "Woven Labels" | "Patch" | "" | string;
  packaging:
    | "Header Card"
    | "Wrap"
    | "Three Pack Wrap"
    | "Slider Hook"
    | "J-Hook"
    | "UPC Barcode"
    | ""
    | string;

  /* —–– Pricing —–– */
  pricing: SimplePricing;
  priceMatrix: PriceMatrixItem[]; // Enhanced price matrix field aligned with backend

  /* —–– Decoration / Inventory (place-holders) —–– */
  decoration_notes?: string;
  // Deprecated: kept for backward compatibility
  sku?: string;
  stock?: number;
  vendor?: string | number;
}
