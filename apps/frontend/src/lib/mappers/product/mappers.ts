// lib/mappers.ts
import { ProductForm } from "@/components/forms/product/types"; // ← UI type
import { CreateProductDto, Product } from "@/services/products/types";

/**
 * Adapt a Product (as returned by the backend) into the local
 * ProductForm structure used by <ProductFormUI>.
 */
export function mapProductToForm(p: Product | null): ProductForm {
  console.log("mapProductToForm - Product from database:", p);
  console.log("mapProductToForm - Status from database:", p?.status);

  const mappedStatus =
    p?.status === "Active"
      ? "ACTIVE"
      : p?.status === "Inactive"
      ? "DISCONTINUED"
      : "ACTIVE"; // Default to ACTIVE if status is unclear

  console.log("mapProductToForm - Mapped status to form:", mappedStatus);

  return {
    /* —–– Details —–– */
    product_id: String(p?.pk_product_id),
    category: p?.product_category?.pk_product_category_id ?? "",
    name: p?.product_name ?? "",
    style: p?.style ?? "",
    status: mappedStatus,
    imageURL: p?.image_url ?? null, // backend gives URL, UI wants File
    imageURLs: p?.image_urls || (p?.image_url ? [p.image_url] : []), // Use image_urls if available, fallback to single image_url
    pricing: { basePrice: p?.product_price ?? 0 },

    /* —–– Decoration —–– */
    trims: p?.trims ?? "",
    packaging: p?.packaging ?? "",

    /* —–– Pricing —–– */
    priceMatrix: [], // Initialize empty price matrix

    /* —–– Place-holders —–– */
    decoration_notes: "",
    sku: p?.sku ?? undefined,
    stock: p?.inventory ?? undefined,
    vendor: p?.fk_vendor_id ? String(p?.fk_vendor_id) : "", // Convert vendor ID to string for form select
  };
}

/**
 * Convert a ProductForm (from your UI) into a CreateProductPayload
 * (the exact shape your NestJS /api/v1/products POST expects).
 *
 * @param form            The values coming from your form (ProductForm).
 * @param organizationID  The ID of the organization under which to create this product.
 */
export function mapProductFormToCreatePayload(
  form: ProductForm,
  organizationID: number
): CreateProductDto {
  const payload: CreateProductDto = {
    // Required backend fields:
    organizationID: 1,

    // form.category is a string (e.g. "3"), so parse it to a number:
    productCategoryID: Number(form.category),

    // form.stock is "inventory"
    inventory: Number(form.stock) ?? 0,

    // Style & Name:
    style: form.style || "",
    productName: form.name,

    // Status (ACTIVE / INACTIVE / DISCONTINUED, your form uses these strings):
    status: form.status,

    // Add productPrice with default value - now using price matrix instead
    productPrice: form.pricing?.basePrice || 0,

    // imageURL: your form field is a File | null, but the payload
    // expects a string URL. In practice you'll first upload the File
    // to S3, get back a string URL, then fill that into `form.imageURL`
    // before calling this mapper. Here we coerce to `string` or empty.
    imageURL: typeof form.imageURL === "string" ? form.imageURL : "",
    imageURLs:
      form.imageURLs?.filter((url): url is string => typeof url === "string") ||
      [],

    // SKU:
    sku: form.sku || "",

    // These decoration fields exist "extra" on your form but
    // are also allowed in the payload:
    trims: form.trims,
    packaging: form.packaging,
  };

  // Only add vendor ID if a vendor is selected
  if (form.vendor) {
    payload.fk_vendor_id = Number(form.vendor);
  }

  return payload;
}
