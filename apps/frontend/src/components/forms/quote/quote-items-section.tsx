"use client";

import * as React from "react";
import { ShoppingCart, Plus, ImageIcon, UploadIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QuoteItemForm } from "@/types/quote";
import { useYarns } from "@/hooks/useYarns";
import { useTrims } from "@/hooks/useTrims";
import { usePackaging } from "@/hooks/usePackaging";
import { useProducts } from "@/hooks/useProducts";
import { useCustomersWithContacts } from "@/hooks/useCustomers";
import { uploadQuoteItemLogoToS3 } from "@/utils/quote-items-logo-upload";

interface Props {
  items: QuoteItemForm[];
  onUpdateItems: (items: QuoteItemForm[]) => void;
  onUpdateTotals: (
    subtotal: number,
    taxTotal: number,
    totalAmount: number
  ) => void;
  readOnly?: boolean;
  selectedCustomerId?: number;
}

export function QuoteItemsSection({
  items,
  onUpdateItems,
  onUpdateTotals,
  readOnly,
  selectedCustomerId,
}: Props) {
  // Fetch data using the custom hooks
  const {
    data: yarnsData,
    isLoading: yarnsLoading,
    error: yarnsError,
  } = useYarns();
  const { data: trimsData, isLoading: trimsLoading } = useTrims();
  const { data: packagingData, isLoading: packagingLoading } = usePackaging();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: customersResponse, isLoading: customersLoading } =
    useCustomersWithContacts();

  // Fix: Extract items array from the response object
  const customersData = customersResponse?.items || [];

  // Extract options from fetched data
  const yarnOptions = yarnsData?.items || [];
  const trimOptions = trimsData?.items || [];
  const packagingOptions = packagingData?.items || [];
  const productOptions = productsData?.items || [];

  // Extract unique categories from products data
  const categoryOptions = React.useMemo(() => {
    if (!productsData?.items) return [];

    const uniqueCategories = new Map<string, any>();
    productsData.items.forEach((product: any) => {
      if (product.product_category) {
        const category = product.product_category;
        uniqueCategories.set(category.pk_product_category_id, category);
      }
    });

    return Array.from(uniqueCategories.values());
  }, [productsData]);

  // Extract shipping addresses from customers data
  const shippingAddresses = React.useMemo(() => {
    if (!customersData) return [];

    // Use a Map to prevent duplicates
    const addressMap = new Map<
      string,
      { id: string; label: string; customerId: number }
    >();

    customersData.forEach((customer: any) => {
      // Only process addresses for the selected customer
      if (
        selectedCustomerId &&
        customer.pk_customer_id !== selectedCustomerId
      ) {
        return;
      }

      customer.addresses
        ?.filter((address: any) => address.address_type === "SHIPPING")
        .forEach((address: any) => {
          const addressLabel = `${customer.name} - ${address.address1}, ${address.city}, ${address.state} ${address.zip}`;
          const addressId = String(address.pk_address_id);

          // Only add if this address ID hasn't been seen before
          if (!addressMap.has(addressId)) {
            addressMap.set(addressId, {
              id: addressId,
              label: addressLabel,
              customerId: customer.pk_customer_id,
            });
          }
        });
    });

    return Array.from(addressMap.values());
  }, [customersData, selectedCustomerId]);

  // State for drag and drop
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  // State for tracking which price field is being edited
  const [focusedPriceIndex, setFocusedPriceIndex] = React.useState<
    number | null
  >(null);

  // State for tracking edit mode for each item
  const [editModeItems, setEditModeItems] = React.useState<Set<string>>(
    new Set(
      // Only add items to edit mode if not in readOnly mode
      readOnly
        ? []
        : items.map((item) => item.id).filter((id): id is string => Boolean(id))
    )
  );

  // Calculate and update totals whenever items change
  React.useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    // const taxTotal = subtotal * 0.1; // Assuming 10% tax rate - adjust as needed
    const taxTotal = 0;
    const totalAmount = subtotal + taxTotal;

    onUpdateTotals(subtotal, taxTotal, totalAmount);
  }, [items]); // Removed onUpdateTotals from dependencies to prevent infinite loop

  // Helper function to get filtered products based on category
  const getFilteredProducts = (categoryId: string) => {
    if (!categoryId) return [];
    return productOptions.filter(
      (product) => product.fk_category_id.toString() === categoryId
    );
  };

  // Helper function for batch updating multiple fields
  const batchUpdateItem = (index: number, updates: Partial<QuoteItemForm>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...updates };

    // Recalculate total whenever quantity or unitPrice changes
    if ("quantity" in updates || "unitPrice" in updates) {
      const quantity =
        "quantity" in updates
          ? updates.quantity!
          : updatedItems[index].quantity;
      const unitPrice =
        "unitPrice" in updates
          ? updates.unitPrice!
          : updatedItems[index].unitPrice;
      updatedItems[index].total = quantity * unitPrice;
    }

    onUpdateItems(updatedItems);
  };

  // Handle file upload
  const handleFileUpload = async (file: File, index: number) => {
    // Validate file type
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Please upload only image files or PDFs");
      return;
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      // Get existing logo URL if it exists
      const existingLogo = items[index]?.logo;
      const existingImageUrl =
        typeof existingLogo === "string" && existingLogo
          ? existingLogo
          : typeof existingLogo === "object" && existingLogo?.url
          ? existingLogo.url
          : undefined;

      // Upload to S3 and get the public URL
      const publicUrl = await uploadQuoteItemLogoToS3(file, existingImageUrl);

      // Update the item with the file information
      updateItem(index, "logo", publicUrl);
    } catch (err) {
      alert("Failed to upload file. Please try again.");
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedIndex(index);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're leaving the drag area completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedIndex(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], index);
    }
  };

  // File input change handler
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], index);
    }
  };

  const addItem = () => {
    // Mock adding an item - in real app this would open an item selector
    const newItemId = Date.now().toString();
    const newItem: QuoteItemForm = {
      id: newItemId,
      productId: "1",
      category: "",
      itemNumber: "",
      description: "",
      logo: "",
      yarn: "",
      packaging: "",
      trims: "",
      addresses: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };

    // Add the new item to edit mode
    setEditModeItems((prev) => new Set([...prev, newItemId]));

    onUpdateItems([...items, newItem]);
  };

  const updateItem = (
    index: number,
    field: keyof QuoteItemForm,
    value: any
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Clear item selection when category changes
    if (field === "category") {
      updatedItems[index].itemNumber = "";
      updatedItems[index].description = "";
      updatedItems[index].productId = "";
    }

    // Recalculate total for this item
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    onUpdateItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdateItems(updatedItems);
  };

  // Toggle edit mode for an item
  const toggleEditMode = (itemId: string) => {
    if (!itemId || readOnly) return;
    setEditModeItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Helper function to get display text for select values
  const getDisplayText = (value: string, options: any[], labelKey: string) => {
    if (!value) return "Not selected";

    // Use specific field lookup based on the labelKey
    let option;
    if (labelKey === "category_name") {
      option = options.find(
        (opt) => opt.pk_product_category_id?.toString() === value
      );
    } else if (labelKey === "yarn") {
      option = options.find((opt) => opt.pk_yarn_id?.toString() === value);
    } else if (labelKey === "packaging") {
      option = options.find((opt) => opt.pk_packaging_id?.toString() === value);
    } else if (labelKey === "trim") {
      option = options.find((opt) => opt.pk_trim_id?.toString() === value);
    } else {
      // Fallback to generic lookup
      option = options.find((opt) => opt[labelKey] === value);
    }

    const result = option ? option[labelKey] : "Not selected";
    return result;
  };

  console.log("selectedCustomerId", selectedCustomerId);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <ShoppingCart className="h-4 w-4" />
          Quote Items
        </CardTitle>
        {!readOnly && (
          <Button
            type="button"
            onClick={addItem}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Items
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No items added yet</h3>
            <p className="text-muted-foreground mb-4">
              Add items to your quote by clicking the "Add Items" button above.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-32">
                      CATEGORY
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-24">
                      ITEM #
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-48">
                      DESCRIPTION
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-40">
                      LOGO
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-24">
                      YARNS
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-24">
                      PACKAGE
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-24">
                      TRIM
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-32">
                      ADDRESS
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-20">
                      QUANTITY
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-20">
                      PRICE
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-700 px-4 py-4 w-20">
                      TOTAL
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-700 px-4 py-4 w-16">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const isEditMode = editModeItems.has(item.id || "");

                    return (
                      <tr
                        key={item.id || `item-${index}`}
                        className="hover:bg-gray-50/50 transition-colors duration-150 h-28"
                      >
                        {/* Category */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <select
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              value={item.category}
                              onChange={(e) =>
                                batchUpdateItem(index, {
                                  category: e.target.value,
                                  itemNumber: "",
                                  description: "",
                                  productId: "",
                                })
                              }
                              disabled={productsLoading}
                            >
                              <option value="">
                                {productsLoading
                                  ? "Loading..."
                                  : "Select Category"}
                              </option>
                              {categoryOptions.map((category) => (
                                <option
                                  key={category.pk_product_category_id}
                                  value={category.pk_product_category_id.toString()}
                                >
                                  {category.category_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700">
                              {getDisplayText(
                                item.category,
                                categoryOptions,
                                "category_name"
                              )}
                            </div>
                          )}
                        </td>

                        {/* Item Number */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <select
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                              value={item.itemNumber}
                              onChange={(e) => {
                                const selectedProductId = e.target.value;
                                const selectedProduct = getFilteredProducts(
                                  item.category
                                ).find(
                                  (p) =>
                                    p.pk_product_id.toString() ===
                                    selectedProductId
                                );

                                batchUpdateItem(index, {
                                  itemNumber: selectedProductId,
                                  productId: selectedProductId,
                                  description: selectedProduct
                                    ? selectedProduct.product_name
                                    : item.description,
                                  unitPrice: selectedProduct
                                    ? selectedProduct.product_price || 0
                                    : item.unitPrice,
                                });
                              }}
                              disabled={!item.category || productsLoading}
                            >
                              <option value="">
                                {!item.category
                                  ? "Select Category First"
                                  : productsLoading
                                  ? "Loading..."
                                  : "Select Item #"}
                              </option>
                              {getFilteredProducts(item.category).map(
                                (product) => (
                                  <option
                                    key={product.pk_product_id}
                                    value={product.pk_product_id.toString()}
                                  >
                                    {product.sku ||
                                      `P-${product.pk_product_id}`}{" "}
                                    - {product.product_name}
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700">
                              {item.itemNumber
                                ? (() => {
                                    const product = getFilteredProducts(
                                      item.category
                                    ).find(
                                      (p) =>
                                        p.pk_product_id.toString() ===
                                        item.itemNumber
                                    );
                                    return product
                                      ? product.sku ||
                                          `P-${product.pk_product_id}`
                                      : item.itemNumber;
                                  })()
                                : "Not selected"}
                            </div>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <Input
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              placeholder="Enter description"
                              value={item.description}
                              onChange={(e) =>
                                batchUpdateItem(index, {
                                  description: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700">
                              {item.description || "No description"}
                            </div>
                          )}
                        </td>

                        {/* Logo */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <div className="flex items-stretch gap-3 h-26">
                              {/* ─── upload ───────────────────────────────────────────── */}
                              <div
                                className={`flex-1 relative border-2 border-dashed rounded-lg p-1 sm:p-2 transition-colors duration-200 ${
                                  draggedIndex === index
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                                }`}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                              >
                                <div className="flex flex-col items-center justify-center py-1 sm:py-2 text-center h-full">
                                  <UploadIcon
                                    className={`h-5 w-5 sm:h-6 sm:w-6 mb-0.5 sm:mb-1 ${
                                      draggedIndex === index
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-blue-500 dark:text-blue-400"
                                    }`}
                                    strokeWidth={2}
                                  />
                                  <p
                                    className={`text-xs font-medium mb-0.5 hidden sm:block ${
                                      draggedIndex === index
                                        ? "text-blue-700 dark:text-blue-300"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {draggedIndex === index
                                      ? "Drop file here"
                                      : "Drag file here"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 hidden sm:block">
                                    or
                                  </p>
                                  <label className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer shadow-sm transition-colors">
                                    Browse
                                    <input
                                      className="hidden"
                                      accept="image/*,.pdf"
                                      type="file"
                                      onChange={(e) =>
                                        handleFileSelect(e, index)
                                      }
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* ─── preview ──────────────────────────────────────────── */}
                              <div className="w-20">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-full flex items-center justify-center">
                                  <div className="text-center p-1 sm:p-2">
                                    {item.logo ? (
                                      <div className="w-full h-full">
                                        {typeof item.logo === "string" ? (
                                          <img
                                            src={item.logo}
                                            alt="Logo preview"
                                            className="w-full h-full object-cover rounded"
                                          />
                                        ) : item.logo.type?.startsWith(
                                            "image/"
                                          ) ? (
                                          <img
                                            src={item.logo.url}
                                            alt="Logo preview"
                                            className="w-full h-full object-cover rounded"
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center justify-center h-full">
                                            <svg
                                              className="w-4 h-4 text-red-500 mb-1"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            <p className="text-[8px] text-gray-500">
                                              PDF
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <>
                                        <ImageIcon
                                          className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-500 mx-auto mb-0.5 sm:mb-1"
                                          strokeWidth={2}
                                        />
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                          Preview
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-26">
                              {item.logo ? (
                                <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden">
                                  {typeof item.logo === "string" ? (
                                    <img
                                      src={item.logo}
                                      alt="Logo"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : item.logo.type?.startsWith("image/") ? (
                                    <img
                                      src={item.logo.url}
                                      alt="Logo"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                                      <svg
                                        className="w-6 h-6 text-red-500 mb-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <p className="text-xs text-gray-500">
                                        PDF
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No logo uploaded
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Yarns */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <select
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              value={item.yarn}
                              onChange={(e) =>
                                batchUpdateItem(index, { yarn: e.target.value })
                              }
                              disabled={yarnsLoading}
                            >
                              <option value="">
                                {yarnsLoading ? "Loading..." : "Select Yarn"}
                              </option>
                              {yarnOptions.map((yarn) => (
                                <option
                                  key={yarn.pk_yarn_id}
                                  value={yarn.pk_yarn_id.toString()}
                                >
                                  {yarn.yarn_type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700">
                              {item.yarn
                                ? yarnOptions.find(
                                    (y) => y.pk_yarn_id.toString() === item.yarn
                                  )?.yarn_type || "Not selected"
                                : "Not selected"}
                            </div>
                          )}
                        </td>

                        {/* Package */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <select
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              value={item.packaging}
                              onChange={(e) =>
                                batchUpdateItem(index, {
                                  packaging: e.target.value,
                                })
                              }
                              disabled={packagingLoading}
                            >
                              <option value="">
                                {packagingLoading
                                  ? "Loading..."
                                  : "Select Package"}
                              </option>
                              {packagingOptions.map((packaging) => (
                                <option
                                  key={packaging.pk_packaging_id}
                                  value={packaging.pk_packaging_id.toString()}
                                >
                                  {packaging.packaging}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700">
                              {item.packaging
                                ? packagingOptions.find(
                                    (p) =>
                                      p.pk_packaging_id.toString() ===
                                      item.packaging
                                  )?.packaging || "Not selected"
                                : "Not selected"}
                            </div>
                          )}
                        </td>

                        {/* Trim */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <select
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              value={item.trims}
                              onChange={(e) =>
                                batchUpdateItem(index, {
                                  trims: e.target.value,
                                })
                              }
                              disabled={trimsLoading}
                            >
                              <option value="">
                                {trimsLoading ? "Loading..." : "Select Trim"}
                              </option>
                              {trimOptions.map((trim) => (
                                <option
                                  key={trim.pk_trim_id}
                                  value={trim.pk_trim_id.toString()}
                                >
                                  {trim.trim}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700">
                              {item.trims
                                ? trimOptions.find(
                                    (t) =>
                                      t.pk_trim_id.toString() === item.trims
                                  )?.trim || "Not selected"
                                : "Not selected"}
                            </div>
                          )}
                        </td>

                        {/* Address */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <select
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              value={item.addresses}
                              onChange={(e) =>
                                batchUpdateItem(index, {
                                  addresses: e.target.value,
                                })
                              }
                              disabled={customersLoading || !selectedCustomerId}
                            >
                              <option value="">
                                {customersLoading
                                  ? "Loading..."
                                  : !selectedCustomerId
                                  ? "Select Customer First"
                                  : "Select Address"}
                              </option>
                              {shippingAddresses.map((address) => (
                                <option key={address.id} value={address.id}>
                                  {address.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700">
                              {item.addresses
                                ? shippingAddresses.find(
                                    (a) => a.id === item.addresses
                                  )?.label || "Not selected"
                                : "Not selected"}
                            </div>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <Input
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              value={item.quantity}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0;
                                if (quantity >= 0) {
                                  batchUpdateItem(index, { quantity });
                                }
                              }}
                            />
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700 text-center">
                              {item.quantity}
                            </div>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4">
                          {isEditMode ? (
                            <Input
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                              type="text"
                              placeholder="0.00"
                              value={
                                focusedPriceIndex === index
                                  ? item.unitPrice.toString()
                                  : `$${item.unitPrice.toFixed(2)}`
                              }
                              onFocus={() => setFocusedPriceIndex(index)}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(
                                  /[$,]/g,
                                  ""
                                );
                                const numericValue = parseFloat(rawValue) || 0;

                                // Validate that it's a valid positive number
                                if (!isNaN(numericValue) && numericValue >= 0) {
                                  batchUpdateItem(index, {
                                    unitPrice: numericValue,
                                  });
                                }
                              }}
                              onBlur={() => {
                                setFocusedPriceIndex(null);
                                // Ensure the value is properly formatted
                                const currentValue = item.unitPrice;
                                if (isNaN(currentValue) || currentValue < 0) {
                                  batchUpdateItem(index, { unitPrice: 0 });
                                }
                              }}
                            />
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-700 text-center">
                              ${item.unitPrice.toFixed(2)}
                            </div>
                          )}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-4">
                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 text-center relative">
                            ${item.total.toFixed(2)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center">
                          {!readOnly && (
                            <div className="flex items-center justify-center gap-1">
                              {/* Check/Edit Toggle Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleEditMode(item.id || "")}
                                className={`${
                                  isEditMode
                                    ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                } p-2 transition-colors duration-150`}
                                title={
                                  isEditMode ? "Save changes" : "Edit item"
                                }
                              >
                                {isEditMode ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                )}
                              </Button>

                              {/* Remove Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors duration-150"
                                title="Remove item"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
