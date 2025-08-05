"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Upload, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationDialog } from "@/components/sheets/delete-confirmation-sheet";

import type { ProductForm as PForm, PriceMatrixItem } from "./types";
import { mapProductFormToCreatePayload } from "@/lib/mappers/product/mappers";
import { HeaderWithActions } from "@/components/pages/production/product/header-actions";
import { headerTitle } from "@/constants/HeaderTitle";
import { uploadFileToS3 } from "@/utils/image-upload";
import { useDeleteProduct } from "@/hooks/useProducts";
import {
  useProductPricesByProductId,
  useCreateProductPrice,
  useUpdateProductPrice,
  useDeleteProductPrice,
} from "@/hooks/useProductPrices";
import { toast } from "sonner";
import { CreateProductDto } from "@/services/products/types";
import { MultiImageUploader } from "./multiple-image-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVendorsInfinite } from "@/hooks/useVendors2";

interface Props {
  mode: "create" | "details";
  initial: PForm;
  productId?: number; // only defined in [id] mode
  onSubmit: (payload: PForm) => void | Promise<void>;
  categories: {
    pk_product_category_id: number;
    category_name: string;
  }[];
  trims: {
    pk_trim_id: number;
    trim: string;
  }[];
  packaging: {
    pk_packaging_id: number;
    packaging: string;
  }[];
}

export function ProductFormUI({
  mode,
  initial,
  productId,
  onSubmit,
  categories,
  trims,
  packaging,
}: Props) {
  /* ------------------------------------------------------------------ */
  /* hooks                                                              */
  /* ------------------------------------------------------------------ */
  const router = useRouter();
  const deleteProduct = useDeleteProduct();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const {
    data: vendorsInfiniteData,
    isLoading: isLoadingVendors,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useVendorsInfinite();

  // Flatten all vendor items from all pages
  const allVendors = React.useMemo(() => {
    return vendorsInfiniteData?.pages.flatMap(page => page.items) ?? [];
  }, [vendorsInfiniteData]);

  // Product Prices hooks
  const { data: existingPrices, isLoading: isLoadingPrices } =
    useProductPricesByProductId(
      productId || 0,
      undefined // No additional params needed
    );
  const createProductPrice = useCreateProductPrice();
  const updateProductPrice = useUpdateProductPrice();
  const deleteProductPrice = useDeleteProductPrice();

  /* ------------------------------------------------------------------ */
  /* form state                                                         */
  /* ------------------------------------------------------------------ */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isValid },
  } = useForm<PForm>({
    defaultValues: {
      ...initial,
      status: initial.status || "ACTIVE",
      priceMatrix: [], // Initialize empty, will be populated from backend
    },
    mode: "onChange",
  });

  const form = watch();

  /* ------------------------------------------------------------------ */
  /* Effects - Load existing prices when editing                       */
  /* ------------------------------------------------------------------ */
  React.useEffect(() => {
    if (mode === "details" && existingPrices?.items && !isLoadingPrices) {
      const formattedPrices: PriceMatrixItem[] = existingPrices.items.map(
        (price) => ({
          id: price.id,
          max_qty: price.max_qty,
          price: price.price,
          fk_product_id: price.fk_product_id,
          isNew: false,
          isDeleted: false,
        })
      );
      setValue("priceMatrix", formattedPrices, { shouldDirty: false });
    }
  }, [existingPrices, isLoadingPrices, mode, setValue]);

  /* ------------------------------------------------------------------ */
  /* local UI state                                                     */
  /* ------------------------------------------------------------------ */
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(mode === "create");
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const { add, list, details } = headerTitle.production.products;

  /* ------------------------------------------------------------------ */
  /* Enhanced Submit Handler with Price Management                      */
  /* ------------------------------------------------------------------ */
  const handleFormSubmit = async (data: PForm) => {
    setIsSubmitting(true);
    try {
      console.log("Form submission started with data:", data);

      // Validate price matrix values
      if (data.priceMatrix && data.priceMatrix.length > 0) {
        console.log("Price matrix before validation:", data.priceMatrix);

        const invalidPrices = data.priceMatrix.filter(
          (item) => !item.isDeleted && (item.price < 0 || item.max_qty < 1)
        );

        if (invalidPrices.length > 0) {
          console.log("Invalid prices found:", invalidPrices);
          toast.error(
            "Please fix invalid price matrix values before submitting"
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Track uploaded files to prevent duplicates
      const uploadedFiles = new Map<File, string>();
      const uploadedImageURLs: string[] = [];

      // Helper function to upload a file only once
      const uploadFileOnce = async (file: File) => {
        if (uploadedFiles.has(file)) {
          return uploadedFiles.get(file)!;
        }
        const uploadedUrl = await uploadFileToS3(file);
        uploadedFiles.set(file, uploadedUrl);
        return uploadedUrl;
      };

      // Upload all images in imageURLs
      for (const item of data.imageURLs || []) {
        if (item instanceof File) {
          try {
            const uploadedUrl = await uploadFileOnce(item);
            uploadedImageURLs.push(uploadedUrl);
          } catch (err) {
            toast.error("Failed to upload one or more images");
            return;
          }
        } else {
          uploadedImageURLs.push(item); // Already a URL
        }
      }

      // Handle imageURL field (first image) - reuse uploaded URL if it's the same file
      let uploadedImageURL: string = "";
      if (data.imageURL) {
        if (data.imageURL instanceof File) {
          try {
            // Check if this file has already been uploaded as part of imageURLs
            uploadedImageURL = await uploadFileOnce(data.imageURL);
          } catch (err) {
            toast.error("Failed to upload primary image");
            return;
          }
        } else if (typeof data.imageURL === "string") {
          uploadedImageURL = data.imageURL;
        }
      } else if (uploadedImageURLs.length > 0) {
        // If no imageURL but we have images in imageURLs, use the first one
        uploadedImageURL = uploadedImageURLs[0];
      }

      // Update data with uploaded URLs
      const finalData = {
        ...data,
        imageURL: uploadedImageURL,
        imageURLs: uploadedImageURLs,
      };

      // Submit the main product form
      await onSubmit(finalData);

      // Handle product prices for edit mode only
      if (
        mode === "details" &&
        productId &&
        data.priceMatrix &&
        data.priceMatrix.length > 0
      ) {
        await handleProductPricesSubmission(data.priceMatrix, productId);
      }

      router.push(list.href);
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductPricesSubmission = async (
    priceMatrix: PriceMatrixItem[],
    currentProductId: number
  ) => {
    console.log("Price matrix submission started:", {
      priceMatrix,
      currentProductId,
    });

    const activeItems = priceMatrix.filter((item) => !item.isDeleted);
    const deletedItems = priceMatrix.filter(
      (item) => item.isDeleted && item.id
    );

    console.log("Processed items:", {
      activeItems,
      deletedItems,
      totalItems: priceMatrix.length,
    });

    try {
      // Delete removed items
      for (const item of deletedItems) {
        if (item.id) {
          console.log("Deleting price item:", item);
          await deleteProductPrice.mutateAsync(item.id);
        }
      }

      // Create/Update active items
      for (const item of activeItems) {
        // Ensure price is a number
        const price =
          typeof item.price === "string" ? parseFloat(item.price) : item.price;
        const max_qty =
          typeof item.max_qty === "string"
            ? parseInt(item.max_qty as string, 10)
            : item.max_qty;

        if (item.isNew) {
          // Create new price
          console.log("Creating new price:", { ...item, price, max_qty });
          await createProductPrice.mutateAsync({
            max_qty,
            price,
            fk_product_id: currentProductId,
          });
        } else if (item.id && !item.isNew) {
          // Update existing price
          console.log("Updating existing price:", { ...item, price, max_qty });
          await updateProductPrice.mutateAsync({
            id: item.id,
            data: {
              max_qty,
              price,
            },
          });
        }
      }

      toast.success("Product prices updated successfully");
    } catch (error) {
      console.error("Error managing product prices:", error);
      console.log("Failed price matrix state:", {
        priceMatrix,
        activeItems,
        deletedItems,
      });
      toast.error("Failed to save product prices");
      throw error;
    }
  };

  /* ------------------------------------------------------------------ */
  /* handlers                                                           */
  /* ------------------------------------------------------------------ */
  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload only image files");
      return;
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Get existing image URL if it exists
      const existingImageUrl =
        typeof form.imageURL === "string" ? form.imageURL : undefined;

      // Upload to S3 and get the public URL
      const publicUrl = await uploadFileToS3(file, existingImageUrl);

      // Update the form with the new image URL
      setValue("imageURL", publicUrl, { shouldDirty: true });
    } catch (err) {
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  async function handleConfirmDelete() {
    if (!productId) return;
    setIsDeleting(true);
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted successfully");
      router.push(list.href);
    } catch (err) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setIsSheetOpen(false);
    }
  }

  // Price matrix handlers
  const handlePriceMatrixChange = (
    index: number,
    field: "max_qty" | "price",
    value: number
  ) => {
    const newMatrix = [...(form.priceMatrix || [])];
    if (newMatrix[index]) {
      // Validate price and quantity
      if (field === "price" && value < 0) {
        toast.error("Price cannot be negative");
        return;
      }
      if (field === "max_qty" && value < 1) {
        toast.error("Quantity must be at least 1");
        return;
      }

      newMatrix[index] = { ...newMatrix[index], [field]: value };
      setValue("priceMatrix", newMatrix, { shouldDirty: true });
    }
  };

  const handleAddPriceMatrixItem = () => {
    const newMatrix = [...(form.priceMatrix || [])];
    newMatrix.push({
      id: undefined,
      tempId: Date.now().toString(),
      max_qty: 0,
      price: 0,
      fk_product_id: productId || 0,
      isNew: true,
      isDeleted: false,
    });
    setValue("priceMatrix", newMatrix, { shouldDirty: true });
  };

  const handleRemovePriceMatrixItem = (index: number) => {
    const newMatrix = [...(form.priceMatrix || [])];
    if (newMatrix[index]) {
      if (newMatrix[index].isNew) {
        // Remove new items immediately
        newMatrix.splice(index, 1);
      } else {
        // Mark existing items for deletion
        newMatrix[index] = { ...newMatrix[index], isDeleted: true };
      }
      setValue("priceMatrix", newMatrix, { shouldDirty: true });
    }
  };

  /* ------------------------------------------------------------------ */
  /* render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen ">
      {/* ─── delete-confirmation sheet ─────────────────────────────── */}
      <DeleteConfirmationDialog
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Delete Product?"
        description="Are you sure you want to delete this item? This action cannot be undone."
        onDelete={handleConfirmDelete}
        onCancel={() => setIsSheetOpen(false)}
      />

      {/* ─── header (back + actions) ───────────────────────────────── */}
      {mode === "create" ? (
        <HeaderWithActions add={{ title: add.title, href: list.href }} />
      ) : (
        <HeaderWithActions
          details={{ title: details.title, href: list.href }}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setIsSheetOpen(true)}
        />
      )}

      {/* ─── form ─────────────────────────────────────────────────── */}
      <form
        className="p-6 bg-gray-50"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="grid gap-6 md:grid-cols-12">
          {/* ─── product image ─────────────────────────────────────── */}
          <Card className="md:col-span-4 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiImageUploader
                value={form.imageURLs ?? []}
                onChange={(urls) =>
                  setValue(
                    "imageURLs",
                    typeof urls === "function"
                      ? urls(form.imageURLs ?? [])
                      : urls,
                    { shouldDirty: true }
                  )
                }
                onFirstImageChange={(firstImage) => {
                  setValue("imageURL", firstImage, { shouldDirty: true });
                }}
                disabled={!isEditing}
                minImages={4}
                maxImages={10}
              />

              <p className="text-xs text-gray-500">
                You need at least 4 images. Pay attention to image quality.
              </p>
            </CardContent>
          </Card>

          {/* ─── product [id] ──────────────────────────────────── */}
          <Card className="md:col-span-8">
            <CardHeader>
              <CardTitle className="text-sm">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* name */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Product Name
                  </label>
                  <Input
                    {...register("name", { required: true })}
                    disabled={!isEditing}
                    placeholder="Enter product name"
                  />
                </div>

                {/* sku */}
                <div>
                  <label className="mb-2 block text-sm font-medium">SKU</label>
                  <Input
                    {...register("sku")}
                    disabled={!isEditing}
                    placeholder="e.g. sku-12345"
                  />
                </div>

                {/* category */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>
                  <select
                    {...register("category")}
                    disabled={!isEditing}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option
                        key={c.pk_product_category_id}
                        value={c.pk_product_category_id}
                      >
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* style */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Style
                  </label>
                  <Input
                    {...register("style")}
                    disabled={!isEditing}
                    placeholder="Enter product style"
                  />
                </div>

                {/* status */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    disabled={!isEditing}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>

                {/* trims */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Trims
                  </label>
                  <select
                    {...register("trims")}
                    disabled={!isEditing}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Select trims</option>
                    {trims.map((t) => (
                      <option key={t.pk_trim_id} value={t.pk_trim_id}>
                        {t.trim}
                      </option>
                    ))}
                  </select>
                </div>

                {/* packaging */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Packaging
                  </label>
                  <select
                    {...register("packaging")}
                    disabled={!isEditing}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Select packaging</option>
                    {packaging.map((p) => (
                      <option key={p.pk_packaging_id} value={p.pk_packaging_id}>
                        {p.packaging}
                      </option>
                    ))}
                  </select>
                </div>

                {/* stock */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Initial Stock
                  </label>
                  <Input
                    {...register("stock", { valueAsNumber: true })}
                    disabled={!isEditing}
                    type="number"
                    placeholder="0"
                  />
                </div>

                {/* vendor */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Vendor
                  </label>
                  <Select
                    value={form.vendor?.toString() || ""}
                    onValueChange={(value) => {
                      setValue("vendor", value || "", { shouldDirty: true });
                    }}
                    disabled={!isEditing || isLoadingVendors}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        className="max-h-60 overflow-y-auto"
                        onScroll={(e) => {
                          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                          // Trigger next page when 80% scrolled and not already fetching
                          if (scrollTop + clientHeight >= scrollHeight * 0.8 && hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                          }
                        }}
                      >
                        {allVendors.map((vendor) => (
                          <SelectItem
                            key={vendor.pk_vendor_id}
                            value={vendor.pk_vendor_id.toString()}
                          >
                            {vendor.name}
                          </SelectItem>
                        ))}
                        {isFetchingNextPage && (
                          <div className="py-2 text-center text-sm text-muted-foreground">
                            Loading more vendors...
                          </div>
                        )}
                        {!hasNextPage && allVendors.length > 0 && (
                          <div className="py-2 text-center text-sm text-muted-foreground">
                            No more vendors to load
                          </div>
                        )}
                        {!isLoadingVendors && allVendors.length === 0 && (
                          <div className="py-2 text-center text-sm text-muted-foreground">
                            No vendors found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── price matrix ──────────────────────────────────── */}
          <div className="md:col-start-5 md:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Price Matrix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Loading state for existing prices */}
                {mode === "details" && isLoadingPrices && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Loading existing prices...
                  </div>
                )}

                {/* Price matrix items */}
                <div className="space-y-3">
                  {form.priceMatrix?.map((item, actualIndex) => {
                    // Skip deleted items in display
                    if (item.isDeleted) return null;

                    return (
                      <div
                        key={item.id || item.tempId}
                        className="flex gap-4 items-end"
                      >
                        <div className="flex-1">
                          <label className="mb-2 block text-sm font-medium">
                            Max Quantity
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={item.max_qty}
                            onChange={(e) =>
                              handlePriceMatrixChange(
                                actualIndex,
                                "max_qty",
                                Number(e.target.value) || 0
                              )
                            }
                            disabled={!isEditing}
                            placeholder="Enter max quantity"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="mb-2 block text-sm font-medium">
                            Price ($)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) =>
                              handlePriceMatrixChange(
                                actualIndex,
                                "price",
                                Number(e.target.value) || 0
                              )
                            }
                            disabled={!isEditing}
                            placeholder="Enter price"
                          />
                        </div>
                        <div className="flex gap-2">
                          {/* Status indicator for existing vs new items */}
                          {!item.isNew && (
                            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Existing
                            </div>
                          )}
                          {item.isNew && (
                            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              New
                            </div>
                          )}

                          {/* Remove button */}
                          {isEditing && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemovePriceMatrixItem(actualIndex)
                              }
                              className="h-10"
                              title={
                                item.isNew ? "Remove" : "Mark for deletion"
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Deleted items preview (shown as disabled) */}
                {form.priceMatrix?.some((item) => item.isDeleted) && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-red-600 mb-2">
                      Items marked for deletion:
                    </h4>
                    <div className="space-y-2">
                      {form.priceMatrix
                        ?.filter((item) => item.isDeleted)
                        ?.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex gap-4 items-center opacity-50 bg-red-50 p-2 rounded"
                          >
                            <div className="flex-1">
                              <span className="text-sm">
                                Max Quantity: {item.max_qty}
                              </span>
                            </div>
                            <div className="flex-1">
                              <span className="text-sm">
                                Price: ${item.price}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Restore the item
                                const newMatrix = [...(form.priceMatrix || [])];
                                const deletedIndex = newMatrix.findIndex(
                                  (i) => i.id === item.id
                                );
                                if (deletedIndex >= 0) {
                                  newMatrix[deletedIndex] = {
                                    ...item,
                                    isDeleted: false,
                                  };
                                  setValue("priceMatrix", newMatrix, {
                                    shouldDirty: true,
                                  });
                                }
                              }}
                              className="h-8"
                              title="Restore item"
                            >
                              Restore
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Add new price matrix item button */}
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPriceMatrixItem}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Price Tier
                  </Button>
                )}

                {/* Empty state */}
                {!isEditing &&
                  (!form.priceMatrix ||
                    form.priceMatrix.filter((item) => !item.isDeleted)
                      .length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No price tiers defined
                    </p>
                  )}

                {/* Summary for pricing tiers */}
                {form.priceMatrix &&
                  form.priceMatrix.filter((item) => !item.isDeleted).length >
                    0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Pricing Summary:
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        {form.priceMatrix
                          ?.filter((item) => !item.isDeleted)
                          ?.sort((a, b) => a.max_qty - b.max_qty)
                          ?.map((item, index) => (
                            <div key={item.id || item.tempId}>
                              Up to {item.max_qty} units: ${item.price} each
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── action buttons ─────────────────────────────────────── */}
        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(list.href)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={!isEditing || !isDirty || !isValid || isSubmitting}
            className="bg-gray-600 hover:bg-gray-700"
          >
            {isSubmitting
              ? "Saving…"
              : mode === "create"
              ? "Save Product"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
