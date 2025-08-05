// "use client";
//
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { useDropzone } from "react-dropzone";
// import {
//   ShoppingCart,
//   Plus,
//   X,
//   Check,
//   ImageIcon,
//   UploadIcon,
//   Loader2,
// } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   useQuoteItemsByQuoteId,
//   useCreateQuoteItem,
//   useUpdateQuoteItem,
//   useDeleteQuoteItem,
// } from "@/hooks/useQuoteItems";
// import { useYarns } from "@/hooks/useYarns";
// import { useTrims } from "@/hooks/useTrims";
// import { usePackaging } from "@/hooks/usePackaging";
// import { useProducts } from "@/hooks/useProducts";
// import { useCustomersWithContacts } from "@/hooks/useCustomers";
// import { uploadQuoteItemLogoToS3 } from "@/utils/quote-items-logo-upload";
// // import LogoUploadDropzone from "../../../../widgets/dropzone/quotes-items/logo-upload-dropzone";
//
// // Transform API response to component format
// export interface ComponentQuoteItem {
//   id: string;
//   pk_quote_item_id?: number;
//   productId: string;
//   category: string;
//   itemNumber: string;
//   description: string;
//   logo: string | { url: string; type: string };
//   yarn: string;
//   packaging: string;
//   trims: string;
//   addresses: string;
//   quantity: number;
//   unitPrice: number;
//   total: number;
//   // API fields
//   fk_quote_id?: number;
//   fk_product_id?: number;
//   fk_yarn_id?: number;
//   fk_packaging_id?: number;
//   fk_trim_id?: number;
//   fk_address_id?: number;
// }
//
// interface QuoteItemsSectionProps {
//   quoteId: number;
//   onUpdateTotals?: (
//     subtotal: number,
//     taxTotal: number,
//     totalAmount: number
//   ) => void;
//   onUpdateQuantity?: (totalQuantity: number) => void;
//   readOnly?: boolean;
//   currency?: string;
// }
//
// export default function QuoteItemsSection({
//   quoteId,
//   onUpdateTotals,
//   onUpdateQuantity,
//   readOnly = false,
//   currency = "USD",
// }: QuoteItemsSectionProps) {
//   // API Hooks - Using the by-quote endpoint
//   const {
//     data: quoteItemsResponse,
//     isLoading: itemsLoading,
//     error: itemsError,
//     refetch,
//   } = useQuoteItemsByQuoteId(quoteId, { page: 1, limit: 100 }, !!quoteId);
//
//   const { data: yarnsData, isLoading: yarnsLoading } = useYarns();
//   const { data: trimsData, isLoading: trimsLoading } = useTrims();
//   const { data: packagingData, isLoading: packagingLoading } = usePackaging();
//   const { data: productsData, isLoading: productsLoading } = useProducts();
//   const { data: customersResponse, isLoading: customersLoading } =
//     useCustomersWithContacts();
//
//   // Mutations
//   const createQuoteItem = useCreateQuoteItem();
//   const updateQuoteItem = useUpdateQuoteItem();
//   const deleteQuoteItem = useDeleteQuoteItem();
//
//   // State
//   const [focusedPriceIndex, setFocusedPriceIndex] = useState<number | null>(
//     null
//   );
//   const [editModeItems, setEditModeItems] = useState<Set<string>>(new Set());
//   const [localItems, setLocalItems] = useState<ComponentQuoteItem[]>([]);
//
//   // Transform API data to component format - Memoized to prevent re-creation
//   const transformApiItemToComponent = useCallback(
//     (apiItem: any): ComponentQuoteItem => {
//       return {
//         id: apiItem.pk_quote_item_id.toString(),
//         pk_quote_item_id: apiItem.pk_quote_item_id,
//         productId: apiItem.product_data?.pk_product_id?.toString() || "",
//         category:
//           apiItem.product_data?.product_category?.pk_product_category_id?.toString() ||
//           "",
//         itemNumber: apiItem.product_data?.pk_product_id?.toString() || "",
//         description:
//           apiItem.item_description || apiItem.product_data?.product_name || "",
//         logo: apiItem.artwork_url || "",
//         yarn: apiItem.yarn_data?.pk_yarn_id?.toString() || "",
//         packaging: apiItem.packaging_data?.pk_packaging_id?.toString() || "",
//         trims: apiItem.trims_data?.pk_trim_id?.toString() || "",
//         addresses: apiItem.address_data?.pk_address_id?.toString() || "",
//         quantity: apiItem.quantity || 0,
//         unitPrice: apiItem.unit_price || 0,
//         total: (apiItem.quantity || 0) * (apiItem.unit_price || 0),
//         // Keep API fields for updates
//         fk_quote_id: quoteId,
//         fk_product_id: apiItem.product_data?.pk_product_id,
//         fk_yarn_id: apiItem.yarn_data?.pk_yarn_id,
//         fk_packaging_id: apiItem.packaging_data?.pk_packaging_id,
//         fk_trim_id: apiItem.trims_data?.pk_trim_id,
//         fk_address_id: apiItem.address_data?.pk_address_id,
//       };
//     },
//     [quoteId]
//   );
//
//   // Update local items when API data changes
//   useEffect(() => {
//     if (quoteItemsResponse?.items) {
//       const transformedItems: ComponentQuoteItem[] =
//         quoteItemsResponse.items.map(transformApiItemToComponent);
//       setLocalItems(transformedItems);
//
//       // Set edit mode for new items (items without pk_quote_item_id)
//       const newItemIds = transformedItems
//         .filter((item: ComponentQuoteItem) => !item.pk_quote_item_id)
//         .map((item: ComponentQuoteItem) => item.id);
//       if (newItemIds.length > 0 && !readOnly) {
//         setEditModeItems(new Set(newItemIds));
//       }
//     }
//   }, [quoteItemsResponse, readOnly, transformApiItemToComponent]);
//
//   // Extract options from API data
//   const yarnOptions = yarnsData?.items || [];
//   const trimOptions = trimsData?.items || [];
//   const packagingOptions = packagingData?.items || [];
//   const productOptions = productsData?.items || [];
//   const customersData = customersResponse || [];
//
//   // Extract unique categories from products data - Memoized
//   const categoryOptions = useMemo(() => {
//     if (!productsData?.items) return [];
//     const uniqueCategories = new Map();
//     productsData.items.forEach((product) => {
//       if (product.product_category) {
//         const category = product.product_category;
//         uniqueCategories.set(category.pk_product_category_id, category);
//       }
//     });
//     return Array.from(uniqueCategories.values());
//   }, [productsData]);
//
//   // Extract shipping addresses from customers data - Memoized
//   const shippingAddresses = useMemo(() => {
//     if (!customersData) return [];
//     const addresses: Array<{ id: string; label: string; customerId: number }> =
//       [];
//     customersData.forEach((customer: any) => {
//       customer.addresses
//         ?.filter((address: any) => address.address_type === "SHIPPING")
//         .forEach((address: any) => {
//           const addressLabel = `${customer.name} - ${address.address1}, ${address.city}, ${address.state} ${address.zip}`;
//           addresses.push({
//             id: String(address.pk_address_id),
//             label: addressLabel,
//             customerId: customer.pk_customer_id,
//           });
//         });
//     });
//     return addresses;
//   }, [customersData]);
//
//   // Calculate and update totals whenever items change - Fixed the infinite loop
//   useEffect(() => {
//     const subtotal = localItems.reduce((sum, item) => sum + item.total, 0);
//     const totalQuantity = localItems.reduce(
//       (sum, item) => sum + item.quantity,
//       0
//     );
//     const taxTotal = 0;
//     const totalAmount = subtotal + taxTotal;
//
//     // Only call if the callbacks exist and values have actually changed
//     if (onUpdateTotals) {
//       onUpdateTotals(subtotal, taxTotal, totalAmount);
//     }
//     if (onUpdateQuantity) {
//       onUpdateQuantity(totalQuantity);
//     }
//   }, [localItems]); // Removed callback dependencies to prevent infinite loop
//
//   // Helper functions - Memoized to prevent re-creation
//   const getFilteredProducts = useCallback(
//     (categoryId: string) => {
//       if (!categoryId) return [];
//       return productOptions.filter(
//         (product) => product.fk_category_id.toString() === categoryId
//       );
//     },
//     [productOptions]
//   );
//
//   const getDisplayText = useCallback(
//     (value: string, options: any[], labelKey: string) => {
//       if (!value) return "Not selected";
//       let option;
//       if (labelKey === "category_name") {
//         option = options.find(
//           (opt) => opt.pk_product_category_id?.toString() === value
//         );
//       } else if (labelKey === "yarn") {
//         option = options.find((opt) => opt.pk_yarn_id?.toString() === value);
//       } else if (labelKey === "packaging") {
//         option = options.find(
//           (opt) => opt.pk_packaging_id?.toString() === value
//         );
//       } else if (labelKey === "trim") {
//         option = options.find((opt) => opt.pk_trim_id?.toString() === value);
//       } else {
//         option = options.find((opt) => opt[labelKey] === value);
//       }
//       return option ? option[labelKey] : "Not selected";
//     },
//     []
//   );
//
//   const formatCurrency = useCallback(
//     (amount: number) => {
//       return new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: currency,
//       }).format(amount);
//     },
//     [currency]
//   );
//
//   // API Operations - Memoized to prevent re-creation
//   const handleCreateItem = useCallback(
//     async (item: ComponentQuoteItem) => {
//       try {
//         await createQuoteItem.mutateAsync({
//           fkQuoteID: quoteId,
//           fkProductID: parseInt(item.productId) || 0,
//           fkYarnID: item.yarn ? parseInt(item.yarn) : undefined,
//           fkPackagingID: item.packaging ? parseInt(item.packaging) : undefined,
//           fkTrimID: item.trims ? parseInt(item.trims) : undefined,
//           fkAddressID: item.addresses ? parseInt(item.addresses) : undefined,
//           artworkURL: typeof item.logo === "string" ? item.logo : "",
//           itemName: item.description || "New Item",
//           itemDescription: item.description || "",
//           quantity: item.quantity,
//           unitPrice: item.unitPrice,
//           taxRate: 0,
//         });
//         await refetch();
//       } catch (error) {
//         console.error("Failed to create item:", error);
//         alert("Failed to create item. Please try again.");
//       }
//     },
//     [createQuoteItem, quoteId, refetch]
//   );
//
//   const handleUpdateItem = useCallback(
//     async (item: ComponentQuoteItem) => {
//       if (!item.pk_quote_item_id) return;
//
//       try {
//         await updateQuoteItem.mutateAsync({
//           id: item.pk_quote_item_id,
//           item: {
//             fkYarnID: item.yarn ? parseInt(item.yarn) : undefined,
//             fkPackagingID: item.packaging
//               ? parseInt(item.packaging)
//               : undefined,
//             fkTrimID: item.trims ? parseInt(item.trims) : undefined,
//             fkAddressID: item.addresses ? parseInt(item.addresses) : undefined,
//             artworkURL: typeof item.logo === "string" ? item.logo : "",
//             itemName: item.description || "Updated Item",
//             itemDescription: item.description || "",
//             quantity: item.quantity,
//             unitPrice: item.unitPrice,
//             taxRate: 0,
//           },
//         });
//         await refetch();
//       } catch (error) {
//         console.error("Failed to update item:", error);
//         alert("Failed to update item. Please try again.");
//       }
//     },
//     [updateQuoteItem, refetch]
//   );
//
//   const handleDeleteItem = useCallback(
//     async (itemId: number) => {
//       try {
//         await deleteQuoteItem.mutateAsync(itemId);
//         await refetch();
//       } catch (error) {
//         console.error("Failed to delete item:", error);
//         alert("Failed to delete item. Please try again.");
//       }
//     },
//     [deleteQuoteItem, refetch]
//   );
//
//   // Local state operations - Memoized
//   const batchUpdateItem = useCallback(
//     (index: number, updates: Partial<ComponentQuoteItem>) => {
//       setLocalItems((prev) => {
//         const updatedItems = [...prev];
//         updatedItems[index] = { ...updatedItems[index], ...updates };
//
//         // Recalculate total
//         if ("quantity" in updates || "unitPrice" in updates) {
//           const quantity =
//             "quantity" in updates
//               ? updates.quantity!
//               : updatedItems[index].quantity;
//           const unitPrice =
//             "unitPrice" in updates
//               ? updates.unitPrice!
//               : updatedItems[index].unitPrice;
//           updatedItems[index].total = quantity * unitPrice;
//         }
//
//         return updatedItems;
//       });
//     },
//     []
//   );
//
//   const addItem = useCallback(() => {
//     if (readOnly) return;
//
//     const newItemId = Date.now().toString();
//     const newItem: ComponentQuoteItem = {
//       id: newItemId,
//       productId: "",
//       category: "",
//       itemNumber: "",
//       description: "",
//       logo: "",
//       yarn: "",
//       packaging: "",
//       trims: "",
//       addresses: "",
//       quantity: 1,
//       unitPrice: 0,
//       total: 0,
//     };
//
//     setLocalItems((prev) => [...prev, newItem]);
//     setEditModeItems((prev) => new Set([...prev, newItemId]));
//   }, [readOnly]);
//
//   const removeItem = useCallback(
//     async (index: number) => {
//       if (readOnly) return;
//
//       const item = localItems[index];
//
//       if (item.pk_quote_item_id) {
//         // Delete from API
//         await handleDeleteItem(item.pk_quote_item_id);
//       } else {
//         // Remove from local state only
//         setLocalItems((prev) => prev.filter((_, i) => i !== index));
//         setEditModeItems((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(item.id);
//           return newSet;
//         });
//       }
//     },
//     [readOnly, localItems, handleDeleteItem]
//   );
//
//   const toggleEditMode = useCallback(
//     async (itemId: string) => {
//       if (readOnly) return;
//
//       const item = localItems.find((item) => item.id === itemId);
//       if (!item) return;
//
//       const isCurrentlyEditing = editModeItems.has(itemId);
//
//       if (isCurrentlyEditing) {
//         // Save changes
//         if (item.pk_quote_item_id) {
//           await handleUpdateItem(item);
//         } else {
//           await handleCreateItem(item);
//         }
//
//         setEditModeItems((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(itemId);
//           return newSet;
//         });
//       } else {
//         // Enter edit mode
//         setEditModeItems((prev) => new Set([...prev, itemId]));
//       }
//     },
//     [readOnly, localItems, editModeItems, handleUpdateItem, handleCreateItem]
//   );
//
//   // File upload handler - Memoized
//   const handleFileUpload = useCallback(
//     async (files: File[], index: number) => {
//       if (files.length === 0) return;
//
//       const file = files[0];
//
//       if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
//         alert("Please upload only image files or PDFs");
//         return;
//       }
//
//       if (file.size > 5 * 1024 * 1024) {
//         alert("File size must be less than 5MB");
//         return;
//       }
//
//       try {
//         // Upload to S3 and get the public URL
//         const publicUrl = await uploadQuoteItemLogoToS3(file);
//         console.log("Uploaded logo URL:", publicUrl);
//
//         // Update the item with the file information
//         batchUpdateItem(index, { logo: publicUrl });
//       } catch (err) {
//         console.error("Upload failed:", err);
//         alert("Failed to upload file. Please try again.");
//       }
//     },
//     [batchUpdateItem]
//   );
//
//   // Drag and drop handlers - Removed (now handled by react-dropzone)
//
//   // Loading state
//   if (
//     itemsLoading ||
//     yarnsLoading ||
//     trimsLoading ||
//     packagingLoading ||
//     productsLoading ||
//     customersLoading
//   ) {
//     return (
//       <div className="p-6 border-b border-gray-200 bg-white">
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//           <span className="ml-2 text-gray-600">Loading quote items...</span>
//         </div>
//       </div>
//     );
//   }
//
//   // Error state
//   if (itemsError) {
//     return (
//       <div className="p-6 border-b border-gray-200 bg-white">
//         <div className="flex items-center justify-center py-12">
//           <div className="text-center">
//             <p className="text-red-600 mb-2">Failed to load quote items</p>
//             <button
//               onClick={() => refetch()}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
//
//   return (
//     <div className="p-6 border-b border-gray-200 bg-white">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-2">
//           <ShoppingCart className="h-5 w-5 text-gray-500" />
//           <h3 className="text-lg font-medium text-gray-900">Quote Items</h3>
//           {quoteItemsResponse?.meta && (
//             <span className="text-sm text-gray-500">
//               ({quoteItemsResponse.meta.totalItems} items)
//             </span>
//           )}
//         </div>
//         {!readOnly && (
//           <button
//             onClick={addItem}
//             disabled={createQuoteItem.isPending}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
//           >
//             {createQuoteItem.isPending ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <Plus className="h-4 w-4" />
//             )}
//             Add Items
//           </button>
//         )}
//       </div>
//
//       {localItems.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-12 text-center">
//           <div className="mb-4">
//             <ShoppingCart className="h-12 w-12 text-gray-400" />
//           </div>
//           <h4 className="font-semibold text-lg mb-2 text-gray-900">
//             No items added yet
//           </h4>
//           <p className="text-gray-500 mb-4">
//             Add items to your quote by clicking the "Add Items" button above.
//           </p>
//         </div>
//       ) : (
//         <div className="border rounded-lg overflow-hidden">
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "10px" }}
//                   >
//                     CATEGORY
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     ITEM #
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     DESCRIPTION
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     LOGO
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     YARNS
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     PACKAGE
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     TRIM
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     ADDRESS
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     QUANTITY
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     PRICE
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px" }}
//                   >
//                     TOTAL
//                   </TableHead>
//                   <TableHead
//                     className="text-left text-xs font-semibold text-gray-700 py-2 min-w-[500px] max-w-[1000px]"
//                     style={{ paddingLeft: "15px", paddingRight: "10px" }}
//                   >
//                     ACTIONS
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {localItems.map((item, index) => {
//                   const isEditMode = editModeItems.has(item.id);
//                   const isProcessing =
//                     updateQuoteItem.isPending ||
//                     createQuoteItem.isPending ||
//                     deleteQuoteItem.isPending;
//
//                   return (
//                     <TableRow
//                       key={item.id}
//                       className="hover:bg-gray-50/50 transition-colors duration-150 h-28"
//                     >
//                       {/* Category */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "10px" }}
//                       >
//                         {isEditMode ? (
//                           <Select
//                             value={item.category}
//                             onValueChange={(value) =>
//                               batchUpdateItem(index, {
//                                 category: value,
//                                 itemNumber: "",
//                                 description: "",
//                                 productId: "",
//                               })
//                             }
//                             disabled={isProcessing}
//                           >
//                             <SelectTrigger className="w-full text-xs">
//                               <SelectValue placeholder="Select Category" />
//                             </SelectTrigger>
//                             <SelectContent
//                               style={{ maxHeight: "200px", overflowY: "auto" }}
//                             >
//                               {categoryOptions.map((category) => (
//                                 <SelectItem
//                                   key={category.pk_product_category_id}
//                                   value={category.pk_product_category_id.toString()}
//                                 >
//                                   {category.category_name}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         ) : (
//                           <p className="text-xs">
//                             {getDisplayText(
//                               item.category,
//                               categoryOptions,
//                               "category_name"
//                             )}
//                           </p>
//                         )}
//                       </TableCell>
//
//                       {/* Item Number */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                           <Select
//                             value={item.itemNumber}
//                             onValueChange={(value) => {
//                               const selectedProduct = getFilteredProducts(
//                                 item.category
//                               ).find(
//                                 (p) => p.pk_product_id.toString() === value
//                               );
//
//                               batchUpdateItem(index, {
//                                 itemNumber: value,
//                                 productId: value,
//                                 description: selectedProduct
//                                   ? selectedProduct.product_name
//                                   : item.description,
//                                 unitPrice: selectedProduct
//                                   ? selectedProduct.product_price || 0
//                                   : item.unitPrice,
//                               });
//                             }}
//                             disabled={!item.category || isProcessing}
//                           >
//                             <SelectTrigger className="w-full text-xs">
//                               <SelectValue
//                                 placeholder={
//                                   !item.category
//                                     ? "Select Category First"
//                                     : "Select Item #"
//                                 }
//                               />
//                             </SelectTrigger>
//                             <SelectContent
//                               style={{ maxHeight: "200px", overflowY: "auto" }}
//                             >
//                               {getFilteredProducts(item.category).map(
//                                 (product) => (
//                                   <SelectItem
//                                     key={product.pk_product_id}
//                                     value={product.pk_product_id.toString()}
//                                   >
//                                     {product.sku ||
//                                       `P-${product.pk_product_id}`}{" "}
//                                     - {product.product_name}
//                                   </SelectItem>
//                                 )
//                               )}
//                             </SelectContent>
//                           </Select>
//                         ) : (
//                           <p className="text-xs">
//                             {item.itemNumber
//                               ? (() => {
//                                   const product = getFilteredProducts(
//                                     item.category
//                                   ).find(
//                                     (p) =>
//                                       p.pk_product_id.toString() ===
//                                       item.itemNumber
//                                   );
//                                   return product
//                                     ? product.sku ||
//                                         `P-${product.pk_product_id}`
//                                     : item.itemNumber;
//                                 })()
//                               : "Not selected"}
//                           </p>
//                         )}
//                       </TableCell>
//
//                       {/* Description */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                           <input
//                             style={{ width: "150px" }}
//                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
//                             placeholder="Enter description"
//                             value={item.description}
//                             onChange={(e) =>
//                               batchUpdateItem(index, {
//                                 description: e.target.value,
//                               })
//                             }
//                             disabled={isProcessing}
//                           />
//                         ) : (
//                           <p className="text-xs">
//                             {item.description || "No description"}
//                           </p>
//                         )}
//                       </TableCell>
//
//                       {/* Logo */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                             <>Test</>
//                           // <LogoUploadDropzone
//                           //   item={item}
//                           //   index={index}
//                           //   onFileUpload={handleFileUpload}
//                           //   isProcessing={isProcessing}
//                           // />
//                         ) : (
//                           <div className="flex items-center justify-center h-26">
//                             {item.logo ? (
//                               <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden">
//                                 <img
//                                   src={
//                                     typeof item.logo === "string"
//                                       ? item.logo
//                                       : item.logo.url
//                                   }
//                                   alt="Logo"
//                                   className="w-full h-full object-cover"
//                                 />
//                               </div>
//                             ) : (
//                               <div className="px-3 py-2 text-sm text-gray-500">
//                                 No logo uploaded
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </TableCell>
//
//                       {/* Yarns */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                           <Select
//                             value={item.yarn}
//                             onValueChange={(value) =>
//                               batchUpdateItem(index, { yarn: value })
//                             }
//                             disabled={isProcessing}
//                           >
//                             <SelectTrigger className="w-full text-xs">
//                               <SelectValue placeholder="Select Yarn" />
//                             </SelectTrigger>
//                             <SelectContent
//                               style={{ maxHeight: "200px", overflowY: "auto" }}
//                             >
//                               {yarnOptions.map((yarn) => (
//                                 <SelectItem
//                                   key={yarn.pk_yarn_id}
//                                   value={yarn.pk_yarn_id.toString()}
//                                 >
//                                   {yarn.yarn_color}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         ) : (
//                           <p className="text-xs">
//                             {getDisplayText(item.yarn, yarnOptions, "yarn")}
//                           </p>
//                         )}
//                       </TableCell>
//
//                       {/* Package */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                           <Select
//                             value={item.packaging}
//                             onValueChange={(value) =>
//                               batchUpdateItem(index, { packaging: value })
//                             }
//                             disabled={isProcessing}
//                           >
//                             <SelectTrigger className="w-full text-xs">
//                               <SelectValue placeholder="Select Package" />
//                             </SelectTrigger>
//                             <SelectContent
//                               style={{ maxHeight: "200px", overflowY: "auto" }}
//                             >
//                               {packagingOptions.map((packaging) => (
//                                 <SelectItem
//                                   key={packaging.pk_packaging_id}
//                                   value={packaging.pk_packaging_id.toString()}
//                                 >
//                                   {packaging.packaging}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         ) : (
//                           <p className="text-xs">
//                             {getDisplayText(
//                               item.packaging,
//                               packagingOptions,
//                               "packaging"
//                             )}
//                           </p>
//                         )}
//                       </TableCell>
//
//                       {/* Trim */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                           <Select
//                             value={item.trims}
//                             onValueChange={(value) =>
//                               batchUpdateItem(index, { trims: value })
//                             }
//                             disabled={isProcessing}
//                           >
//                             <SelectTrigger className="w-full text-xs">
//                               <SelectValue placeholder="Select Trim" />
//                             </SelectTrigger>
//                             <SelectContent
//                               style={{ maxHeight: "200px", overflowY: "auto" }}
//                             >
//                               {trimOptions.map((trim) => (
//                                 <SelectItem
//                                   key={trim.pk_trim_id}
//                                   value={trim.pk_trim_id.toString()}
//                                 >
//                                   {trim.trim}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         ) : (
//                           <p className="text-xs">
//                             {getDisplayText(item.trims, trimOptions, "trim")}
//                           </p>
//                         )}
//                       </TableCell>
//
//                       {/* Address */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                           <Select
//                             value={item.addresses}
//                             onValueChange={(value) =>
//                               batchUpdateItem(index, { addresses: value })
//                             }
//                             disabled={isProcessing}
//                           >
//                             <SelectTrigger className="w-full text-xs">
//                               <SelectValue placeholder="Select Address" />
//                             </SelectTrigger>
//                             <SelectContent
//                               style={{ maxHeight: "200px", overflowY: "auto" }}
//                             >
//                               {shippingAddresses.map((address) => (
//                                 <SelectItem key={address.id} value={address.id}>
//                                   {address.label}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         ) : (
//                           <p className="text-xs">
//                             {item.addresses
//                               ? shippingAddresses.find(
//                                   (a) => a.id === item.addresses
//                                 )?.label || "Not selected"
//                               : "Not selected"}
//                           </p>
//                         )}
//                       </TableCell>
//
//                       {/* Quantity */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                           <input
//                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
//                             type="number"
//                             min="0"
//                             step="1"
//                             placeholder="0"
//                             value={item.quantity}
//                             onChange={(e) => {
//                               const quantity = parseInt(e.target.value) || 0;
//                               if (quantity >= 0) {
//                                 batchUpdateItem(index, { quantity });
//                               }
//                             }}
//                             disabled={isProcessing}
//                           />
//                         ) : (
//                           <p className="text-xs">{item.quantity}</p>
//                         )}
//                       </TableCell>
//
//                       {/* Price */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         {isEditMode ? (
//                           <input
//                             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
//                             type="text"
//                             placeholder="0.00"
//                             value={
//                               focusedPriceIndex === index
//                                 ? item.unitPrice.toString()
//                                 : `$${item.unitPrice.toFixed(2)}`
//                             }
//                             onFocus={() => setFocusedPriceIndex(index)}
//                             onChange={(e) => {
//                               const rawValue = e.target.value.replace(
//                                 /[$,]/g,
//                                 ""
//                               );
//                               const numericValue = parseFloat(rawValue) || 0;
//
//                               if (!isNaN(numericValue) && numericValue >= 0) {
//                                 batchUpdateItem(index, {
//                                   unitPrice: numericValue,
//                                 });
//                               }
//                             }}
//                             onBlur={() => {
//                               setFocusedPriceIndex(null);
//                               const currentValue = item.unitPrice;
//                               if (isNaN(currentValue) || currentValue < 0) {
//                                 batchUpdateItem(index, { unitPrice: 0 });
//                               }
//                             }}
//                             disabled={isProcessing}
//                           />
//                         ) : (
//                           <p className="text-xs">
//                             {formatCurrency(item.unitPrice)}
//                           </p>
//                         )}
//                       </TableCell>
//
//                       {/* Total */}
//                       <TableCell
//                         className="py-2 min-w-[500px] max-w-[1000px]"
//                         style={{ paddingLeft: "15px" }}
//                       >
//                         <div className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-center">
//                           {formatCurrency(item.total)}
//                         </div>
//                       </TableCell>
//
//                       {/* Actions */}
//                       <TableCell className="px-4 py-4 text-center min-w-[500px] max-w-[1000px]">
//                         {!readOnly && (
//                           <div className="flex items-center justify-center gap-1">
//                             <button
//                               type="button"
//                               onClick={() => toggleEditMode(item.id)}
//                               disabled={isProcessing}
//                               className={`${
//                                 isEditMode
//                                   ? "text-green-600 hover:text-green-700 hover:bg-green-50"
//                                   : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//                               } rounded-lg p-2 transition-colors duration-150 disabled:opacity-50`}
//                               title={isEditMode ? "Save changes" : "Edit item"}
//                             >
//                               {isProcessing ? (
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                               ) : isEditMode ? (
//                                 <Check className="w-4 h-4" />
//                               ) : (
//                                 <svg
//                                   className="w-4 h-4"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                                   />
//                                 </svg>
//                               )}
//                             </button>
//
//                             <button
//                               type="button"
//                               onClick={() => removeItem(index)}
//                               disabled={isProcessing}
//                               className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors duration-150 disabled:opacity-50"
//                               title="Remove item"
//                             >
//                               <X className="w-4 h-4" />
//                             </button>
//                           </div>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
