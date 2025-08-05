// "use client";
// import React, { useState } from "react";
// import {
//   Plus,
//   X,
//   ShoppingCart,
//   SquarePen,
//   Check,
//   AlertCircle,
// } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../../../ui/table";
// import { Button } from "../../../../ui/button";
// import { Input } from "../../../../ui/input";
// import { useProductsCategories } from "../../../../../hooks/useProducts2";
// import {
//   Select,
//   SelectValue,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
// } from "../../../../ui/select";
// import { Alert, AlertDescription } from "../../../../ui/alert";

// import { useYarns } from "@/hooks/useYarns";
// import { useTrims } from "@/hooks/useTrims";
// import { usePackaging } from "@/hooks/usePackaging";
// import LogoCell2 from "./logo-cell-2";
// import { TableOrdersItems } from "../types";
// import { useDeleteOrderItem } from "../../../../../hooks/useOrdersItems";
// import InfiniteProductSelect from "../../quotes-details/custom/InfiniteProductSelect";


// interface ComponentsProps {
//   orderItems: TableOrdersItems[];
//   customerID: number;
//   setOrdersItems: React.Dispatch<React.SetStateAction<TableOrdersItems[]>>;
//   setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
//   setIsCreateFlag: React.Dispatch<React.SetStateAction<boolean>>;
//   // refetchQuoteItems?: () => void | Promise<void>;
//   // refetchQuotesSummary?: () => void | Promise<QueryObserverResult<QuoteTotals, Error>>;
// }

// interface ValidationError {
//   field: string;
//   message: string;
// }

// const OrdersItemsTable = ({
//   orderItems,
//   customerID,
//   setOrdersItems,
//   setModifyFlag,
//   setIsCreateFlag,
// }: // refetchQuoteItems,
// // refetchQuotesSummary,
// ComponentsProps) => {
//   const [addOrdersItems, setAddOrdersItems] = React.useState(0);

//   // State to manage new items being added
//   const [newItems, setNewItems] = React.useState<Partial<TableOrdersItems>[]>(
//     []
//   );

//   // State for validation errors
//   const [validationErrors, setValidationErrors] = React.useState<
//     Record<number, ValidationError[]>
//   >({});

//   const { data: dataProductsCategory } = useProductsCategories();
//   const { data: yarnsData, isLoading: yarnsLoading } = useYarns();
//   const { data: trimsData, isLoading: trimsLoading } = useTrims();
//   const { data: packagingData, isLoading: packagingLoading } = usePackaging();

//   // Initialize delete mutation
//   const deleteOrdersItemMutation = useDeleteOrderItem();

//   // Add URL cache using useRef
//   const urlCache = React.useRef<Map<string, string>>(new Map());

//   const productsCategoryOptions = dataProductsCategory?.items || [];

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount);
//   };

//   // Validation function for new items
//   const validateNewItem = (
//     item: Partial<TableOrdersItems>
//   ): ValidationError[] => {
//     const errors: ValidationError[] = [];

//     if (!item.productID || item.productID <= 0) {
//       errors.push({ field: "productID", message: "Please select a product" });
//     }

//     if (!item.categoryID || item.categoryID <= 0) {
//       errors.push({ field: "categoryID", message: "Please select a category" });
//     }

//     // if (!item.addressID || item.addressID <= 0) {
//     //   errors.push({
//     //     field: "addressID",
//     //     message: "Please select a shipping address",
//     //   });
//     // }

//     if (!item.item_name || item.item_name.trim() === "") {
//       errors.push({ field: "item_name", message: "Item name is required" });
//     }

//     if (!item.item_description || item.item_description.trim() === "") {
//       errors.push({
//         field: "item_description",
//         message: "Item description is required",
//       });
//     }

//     if (!item.quantity || item.quantity <= 0) {
//       errors.push({
//         field: "quantity",
//         message: "Quantity must be greater than 0",
//       });
//     }

//     if (!item.unit_price || item.unit_price <= 0) {
//       errors.push({
//         field: "unit_price",
//         message: "Unit price must be greater than 0",
//       });
//     }

//     if (!item.yarnID || item.yarnID <= 0) {
//       errors.push({ field: "yarnID", message: "Please select a yarn" });
//     }

//     if (!item.trimsID || item.trimsID <= 0) {
//       errors.push({ field: "trimsID", message: "Please select a trim" });
//     }

//     if (!item.packagingID || item.packagingID <= 0) {
//       errors.push({ field: "packagingID", message: "Please select packaging" });
//     }

//     return errors;
//   };

//   const handleOrderEditClick = (index: number) => {
//     setOrdersItems((prevState) =>
//       prevState.map((data, innerIndex) => {
//         if (index === innerIndex)
//           return { ...data, actionEdit: !data.actionEdit };

//         return data;
//       })
//     );
//   };

//   const handleOnchangeText = (
//     index: number,
//     label: string,
//     value: number | string | File | null
//   ) => {
//     setModifyFlag(true);

//     if (
//       ["quantity", "yarnID", "trimsID", "packagingID"].includes(label) &&
//       typeof value === "string"
//     ) {
//       setOrdersItems((prevState) =>
//         prevState.map((data, innerIndex) => {
//           if (index === innerIndex)
//             return { ...data, [label]: parseInt(value, 10) };
//           return data;
//         })
//       );
//     } else if (label === "unit_price" && typeof value === "string") {
//       setOrdersItems((prevState) =>
//         prevState.map((data, innerIndex) => {
//           if (index === innerIndex)
//             return { ...data, [label]: parseFloat(value) };
//           return data;
//         })
//       );
//     } else {
//       setOrdersItems((prevState) =>
//         prevState.map((data, innerIndex) => {
//           if (index === innerIndex) return { ...data, [label]: value };
//           return data;
//         })
//       );
//     }

//     if (label === "categoryID" && typeof value === "string") {
//       const categoryData = productsCategoryOptions.filter(
//         (data) => data.pk_product_category_id === parseInt(value, 10)
//       );

//       if (categoryData.length > 0) {
//         setOrdersItems((prevState) =>
//           prevState.map((data, innerIndex) => {
//             if (index === innerIndex)
//               return { ...data, categoryName: categoryData[0].category_name };
//             return data;
//           })
//         );
//       }
//     } else if (
//       label === "yarnID" &&
//       yarnsData?.items &&
//       typeof value === "string"
//     ) {
//       const yarnList = yarnsData.items.filter(
//         (data) => data.pk_yarn_id === parseInt(value, 10)
//       );

//       if (yarnList.length > 0) {
//         setOrdersItems((prevState) =>
//           prevState.map((data, innerIndex) => {
//             if (index === innerIndex)
//               return {
//                 ...data,
//                 yarnName: `${yarnList[0].yarn_color} - ${yarnList[0].yarn_type}`,
//               };
//             return data;
//           })
//         );
//       }
//     } else if (
//       label === "trimsID" &&
//       trimsData?.items &&
//       typeof value === "string"
//     ) {
//       const trimList = trimsData.items.filter(
//         (data) => data.pk_trim_id === parseInt(value, 10)
//       );

//       if (trimList.length > 0) {
//         setOrdersItems((prevState) =>
//           prevState.map((data, innerIndex) => {
//             if (index === innerIndex)
//               return { ...data, trimsName: trimList[0].trim };
//             return data;
//           })
//         );
//       }
//     } else if (
//       label === "packagingID" &&
//       packagingData?.items &&
//       typeof value === "string"
//     ) {
//       const packagingList = packagingData.items.filter(
//         (data) => data.pk_packaging_id === parseInt(value, 10)
//       );

//       if (packagingList.length > 0) {
//         setOrdersItems((prevState) =>
//           prevState.map((data, innerIndex) => {
//             if (index === innerIndex)
//               return { ...data, packagingName: packagingList[0].packaging };
//             return data;
//           })
//         );
//       }
//     }
//   };

//   // Handle changes for new items
//   const handleNewItemChange = (
//     index: number,
//     label: string,
//     value: number | string | File | null
//   ) => {
//     setNewItems((prevState) => {
//       const newState = [...prevState];
//       if (!newState[index]) {
//         newState[index] = {
//           actionEdit: false,
//           quantity: 0,
//           unit_price: 0,
//         } as Partial<TableOrdersItems>;
//       }

//       if (
//         ["categoryID", "quantity", "yarnID", "packagingID", "trimsID"].includes(
//           label
//         ) &&
//         typeof value === "string"
//       ) {
//         newState[index] = {
//           ...newState[index],
//           [label]: parseInt(value, 10) || 0,
//         };
//       } else if (label === "unit_price" && typeof value === "string") {
//         newState[index] = {
//           ...newState[index],
//           [label]: parseFloat(value) || 0,
//         };
//       } else {
//         newState[index] = { ...newState[index], [label]: value };
//       }

//       // Handle category selection
//       if (label === "categoryID" && typeof value === "string") {
//         const categoryData = productsCategoryOptions.filter(
//           (data) => data.pk_product_category_id === parseInt(value, 10)
//         );

//         if (categoryData.length > 0) {
//           newState[index] = {
//             ...newState[index],
//             categoryName: categoryData[0].category_name,
//           };
//         }
//       } else if (
//         label === "yarnID" &&
//         yarnsData?.items &&
//         typeof value === "string"
//       ) {
//         const yarnList = yarnsData.items.filter(
//           (data) => data.pk_yarn_id === parseInt(value, 10)
//         );
//         if (yarnList.length > 0) {
//           newState[index] = {
//             ...newState[index],
//             yarnName: `${yarnList[0].yarn_color} - ${yarnList[0].yarn_type}`,
//           };
//         }
//       } else if (
//         label === "trimsID" &&
//         trimsData?.items &&
//         typeof value === "string"
//       ) {
//         const trimList = trimsData.items.filter(
//           (data) => data.pk_trim_id === parseInt(value, 10)
//         );
//         if (trimList.length > 0) {
//           newState[index] = { ...newState[index], trimsName: trimList[0].trim };
//         }
//       } else if (
//         label === "packagingID" &&
//         packagingData?.items &&
//         typeof value === "string"
//       ) {
//         const packagingList = packagingData.items.filter(
//           (data) => data.pk_packaging_id === parseInt(value, 10)
//         );
//         if (packagingList.length > 0) {
//           newState[index] = {
//             ...newState[index],
//             packagingName: packagingList[0].packaging,
//           };
//         }
//       }

//       return newState;
//     });

//     // Clear validation errors for this field when user makes changes
//     setValidationErrors((prevErrors) => {
//       const newErrors = { ...prevErrors };
//       if (newErrors[index]) {
//         newErrors[index] = newErrors[index].filter(
//           (error) => error.field !== label
//         );
//         if (newErrors[index].length === 0) {
//           delete newErrors[index];
//         }
//       }
//       return newErrors;
//     });

//     setIsCreateFlag(true);
//   };

//   // Save new item to orders items with validation
//   const handleOrderSaveClick = async (index: number) => {
//     const newItem = newItems[index];

//     if (newItem) {
//       // Validate the new item
//       const errors = validateNewItem(newItem);

//       if (errors.length > 0) {
//         // Set validation errors and don't save
//         setValidationErrors((prevErrors) => ({
//           ...prevErrors,
//           [index]: errors,
//         }));
//         return;
//       }

//       try {
//         // Clear any existing validation errors for this item
//         setValidationErrors((prevErrors) => {
//           const newErrors = { ...prevErrors };
//           delete newErrors[index];
//           return newErrors;
//         });

//         // Save the item with the File object directly
//         setOrdersItems((prevState) => [
//           ...prevState,
//           {
//             ...newItem,
//             actionEdit: false,
//           } as TableOrdersItems,
//         ]);
//         setModifyFlag(true);

//         // Remove the saved item from new items and decrease counter
//         setNewItems((prevState) => prevState.filter((_, i) => i !== index));
//         setAddOrdersItems((prevState) => prevState - 1);
//       } catch (error) {
//         console.error("Failed to save order item:", error);
//         alert("Failed to save order item. Please try again.");
//       }
//     }
//   };

//   // Cancel adding new item
//   const handleCancelNewItem = (index: number) => {
//     // Clear validation errors for this item
//     setValidationErrors((prevErrors) => {
//       const newErrors = { ...prevErrors };
//       delete newErrors[index];
//       return newErrors;
//     });

//     setNewItems((prevState) => prevState.filter((_, i) => i !== index));
//     setAddOrdersItems((prevState) => prevState - 1);
//   };

//   // Delete existing order item
//   const handleDeleteOrderItem = async (index: number) => {
//     const itemToDelete = orderItems[index];

//     if (itemToDelete.orderItemsID && itemToDelete.orderItemsID > 0) {
//       // Item exists in database, call API to delete
//       try {
//         await deleteOrdersItemMutation.deleteOrderItem(
//           itemToDelete.orderItemsID
//         );

//         // Refetch the quotes items list after successful deletion
//         // if (refetchQuoteItems) {
//         //   await refetchQuoteItems();
//         // }

//         // if (refetchQuotesSummary) {
//         //   await refetchQuotesSummary();
//         // }

//         // Remove from local state after successful API call
//         setOrdersItems((prevState) => prevState.filter((_, i) => i !== index));
//         setModifyFlag(true);
//       } catch (error) {
//         console.error("Failed to delete order item:", error);
//         // You might want to show an error message to the user here
//       }
//     } else {
//       // Item doesn't exist in database yet, just remove from local state
//       setOrdersItems((prevState) => prevState.filter((_, i) => i !== index));
//       setModifyFlag(true);
//     }
//   };

//   // Clean up cache when component unmounts
//   React.useEffect(() => {
//     return () => {
//       urlCache.current.clear();
//     };
//   }, []);

//   return (
//     <div className="w-full space-y-4 p-6 bg-white">
//       <div className="flex flex-row justify-between">
//         <div
//           className="flex flex-row text-lg font-bold"
//           style={{ columnGap: "10px" }}
//         >
//           <ShoppingCart />
//           Orders Items
//         </div>
//         <Button
//           className="p-4 bg-blue-500 cursor-pointer rounded-xl"
//           onClick={() => setAddOrdersItems((prevState) => prevState + 1)}
//         >
//           <Plus />
//           Add Order Item
//         </Button>
//       </div>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead
//               className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
//               style={{ width: "200px" }}
//             >
//               CATEGORY
//             </TableHead>
//             <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               ITEM #
//             </TableHead>
//             <TableHead
//               className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
//               style={{ width: "200px" }}
//             >
//               DESCRIPTION
//             </TableHead>
//             <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               LOGO
//             </TableHead>
//             <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               YARNS
//             </TableHead>
//             <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               PACKAGE
//             </TableHead>
//             <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               TRIM
//             </TableHead>
//             {/*<TableHead className="hidden px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">*/}
//             {/*  ADDRESS*/}
//             {/*</TableHead>*/}
//             <TableHead className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               QUANTITY
//             </TableHead>
//             <TableHead className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               PRICE
//             </TableHead>
//             <TableHead className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               TOTAL
//             </TableHead>
//             <TableHead className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
//               ACTIONS
//             </TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {orderItems.length === 0 && addOrdersItems === 0 ? (
//             <TableRow>
//               <TableCell colSpan={12} className="px-6 py-8 text-center">
//                 <div className="flex flex-col items-center justify-center space-y-4">
//                   <ShoppingCart className="h-12 w-12 text-gray-400" />
//                   <div className="text-gray-500 text-sm">
//                     No orders items added yet
//                   </div>
//                 </div>
//               </TableCell>
//             </TableRow>
//           ) : (
//             <>
//               {orderItems.map((data, index) => {
//                 // const address =
//                 //   data.address1 &&
//                 //   data.city &&
//                 //   data.state &&
//                 //   data.country &&
//                 //   data.zip
//                 //     ? `${data.address1}, ${data.city}, ${data.state}, ${data.country}, ${data.zip}`
//                 //     : "No Address";

//                 const totalAmount =
//                   (data.quantity || 0) * (data.unit_price || 0);

//                 return (
//                   <TableRow key={index}>
//                     <TableCell className="px-6 py-3 text-left text-xs">
//                       {data.actionEdit ? (
//                         <Select
//                           value={data.categoryID?.toString() || "1"}
//                           onValueChange={(e) =>
//                             handleOnchangeText(index, "categoryID", e)
//                           }
//                         >
//                           <SelectTrigger className="w-[130px] text-xs">
//                             <SelectValue placeholder="Select a Product Categories" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {productsCategoryOptions.map(
//                               (innerData, innerIndex) => {
//                                 return (
//                                   <SelectItem
//                                     className="text-xs"
//                                     key={innerIndex}
//                                     value={innerData.pk_product_category_id.toString()}
//                                   >
//                                     {innerData.category_name}
//                                   </SelectItem>
//                                 );
//                               }
//                             )}
//                           </SelectContent>
//                         </Select>
//                       ) : (
//                         data.categoryName || "No Category"
//                       )}
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-left text-xs">
//                       {data.actionEdit ? (
//                         <InfiniteProductSelect
//                           categoryId={data.categoryID || -1}
//                           value={{
//                             id: data.productID,
//                             name: data.item_name,
//                             index: index,
//                           }}
//                           index={index}
//                           onValueChange={(value) => {
//                             handleOnchangeText(
//                               value.index,
//                               "productID",
//                               value.id
//                             );
//                             handleOnchangeText(
//                               value.index,
//                               "item_name",
//                               value.name
//                             );
//                             handleOnchangeText(
//                               value.index,
//                               "item_description",
//                               value.name
//                             );
//                           }}
//                           placeholder="Search and select a product..."
//                           enableSearch={true}
//                         />
//                       ) : (
//                         data.item_name || "No Item"
//                       )}
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-left text-xs">
//                       {data.actionEdit ? (
//                         <Input
//                           value={data.item_description}
//                           style={{ width: "300px", fontSize: "12px" }}
//                           onChange={(e) =>
//                             handleOnchangeText(
//                               index,
//                               "item_description",
//                               e.target.value
//                             )
//                           }
//                         />
//                       ) : (
//                         data.item_description || "No Description"
//                       )}
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-left text-xs">
//                       <LogoCell2
//                         notModify={!data.actionEdit}
//                         logoFile={data?.artworkURL || null}
//                         setLogoFile={(file) => {
//                           handleOnchangeText(index, "artworkURL", file);
//                         }}
//                       />
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-left text-xs">
//                       {data.actionEdit ? (
//                         <Select
//                           value={data.yarnID.toString() || "1"}
//                           onValueChange={(e) =>
//                             handleOnchangeText(index, "yarnID", e)
//                           }
//                         >
//                           <SelectTrigger className="w-[130px] text-xs">
//                             <SelectValue placeholder="Select a Product Categories" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {yarnsData?.items?.map((innerData, innerIndex) => {
//                               return (
//                                 <SelectItem
//                                   className="text-xs"
//                                   key={innerIndex}
//                                   value={innerData.pk_yarn_id.toString()}
//                                 >
//                                   {innerData.yarn_color}
//                                 </SelectItem>
//                               );
//                             })}
//                           </SelectContent>
//                         </Select>
//                       ) : (
//                         data.yarnName || "No Yarn"
//                       )}
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-left text-xs">
//                       {data.actionEdit ? (
//                         <Select
//                           value={data.packagingID.toString()}
//                           onValueChange={(e) =>
//                             handleOnchangeText(index, "packagingID", e)
//                           }
//                         >
//                           <SelectTrigger className="w-[130px] text-xs">
//                             <SelectValue placeholder="Select a Packaging" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {packagingData?.items?.map(
//                               (innerData, innerIndex) => {
//                                 return (
//                                   <SelectItem
//                                     className="text-xs"
//                                     key={innerIndex}
//                                     value={innerData.pk_packaging_id.toString()}
//                                   >
//                                     {innerData.packaging}
//                                   </SelectItem>
//                                 );
//                               }
//                             )}
//                           </SelectContent>
//                         </Select>
//                       ) : (
//                         data.packagingName || "No Packaging"
//                       )}
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-left text-xs">
//                       {data.actionEdit ? (
//                         <Select
//                           value={data.trimsID.toString()}
//                           onValueChange={(e) =>
//                             handleOnchangeText(index, "trimsID", e)
//                           }
//                         >
//                           <SelectTrigger className="w-[130px] text-xs">
//                             <SelectValue placeholder="Select a Packaging" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {trimsData?.items?.map((innerData, innerIndex) => {
//                               return (
//                                 <SelectItem
//                                   className="text-xs"
//                                   key={innerIndex}
//                                   value={innerData.pk_trim_id.toString()}
//                                 >
//                                   {innerData.trim}
//                                 </SelectItem>
//                               );
//                             })}
//                           </SelectContent>
//                         </Select>
//                       ) : (
//                         data.trimsName || "No Trim"
//                       )}
//                     </TableCell>
//                     {/* region hidden select shipping address */}
//                     {/*<TableCell className="px-6 py-3 text-left text-xs">*/}
//                     {/*  {data.actionEdit ? (*/}
//                     {/*    <InfiniteAddressSelect*/}
//                     {/*      index={index}*/}
//                     {/*      customerID={customerID}*/}
//                     {/*      value={{*/}
//                     {/*        id: data.addressID,*/}
//                     {/*        index,*/}
//                     {/*        address1: data.address1,*/}
//                     {/*        city: data.city,*/}
//                     {/*        state: data.state,*/}
//                     {/*        zip: data.zip,*/}
//                     {/*        country: data.country,*/}
//                     {/*      }}*/}
//                     {/*      onValueChange={(value) => {*/}
//                     {/*        handleOnchangeText(index, "addressID", value.id);*/}
//                     {/*        handleOnchangeText(*/}
//                     {/*          index,*/}
//                     {/*          "address1",*/}
//                     {/*          value.address1*/}
//                     {/*        );*/}
//                     {/*        handleOnchangeText(index, "city", value.city);*/}
//                     {/*        handleOnchangeText(index, "state", value.state);*/}
//                     {/*        handleOnchangeText(index, "zip", value.zip);*/}
//                     {/*        handleOnchangeText(index, "country", value.country);*/}
//                     {/*      }}*/}
//                     {/*      placeholder="Choose a shipping address..."*/}
//                     {/*      className="w-full"*/}
//                     {/*    />*/}
//                     {/*  ) : (*/}
//                     {/*    address*/}
//                     {/*  )}*/}
//                     {/*</TableCell>*/}
//                     {/* endregion */}
//                     <TableCell className="px-6 py-3 text-right text-xs">
//                       {data.actionEdit ? (
//                         <Input
//                           value={data.quantity}
//                           style={{ width: "100px" }}
//                           type="number"
//                           onChange={(e) =>
//                             handleOnchangeText(
//                               index,
//                               "quantity",
//                               e.target.value
//                             )
//                           }
//                         />
//                       ) : (
//                         data.quantity
//                       )}
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-right text-xs">
//                       {data.actionEdit ? (
//                         <Input
//                           value={data.unit_price}
//                           style={{ width: "100px" }}
//                           type="number"
//                           onChange={(e) =>
//                             handleOnchangeText(
//                               index,
//                               "unit_price",
//                               e.target.value
//                             )
//                           }
//                         />
//                       ) : (
//                         formatCurrency(data.unit_price)
//                       )}
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-right text-xs">
//                       {formatCurrency(totalAmount)}
//                     </TableCell>
//                     <TableCell className="px-6 py-3 text-center text-xs">
//                       <div className="flex items-center justify-center gap-2">
//                         {data.actionEdit ? (
//                           <Button
//                             variant="ghost"
//                             className="cursor-pointer"
//                             onClick={() => handleOrderEditClick(index)}
//                           >
//                             <Check className="text-green-500" />
//                           </Button>
//                         ) : (
//                           <>
//                             <Button
//                               variant="ghost"
//                               className="cursor-pointer"
//                               onClick={() => handleOrderEditClick(index)}
//                             >
//                               <SquarePen className="text-blue-500" />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               className="cursor-pointer"
//                               onClick={() => handleDeleteOrderItem(index)}
//                             >
//                               <X className="text-red-500" />
//                             </Button>
//                           </>
//                         )}
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//               {Array.from({ length: addOrdersItems }).map((_, index) => {
//                 const newItem = newItems[index] || {};
//                 const newItemIndex = orderItems.length + index;
//                 const totalAmount =
//                   (newItem.quantity || 0) * (newItem.unit_price || 0);
//                 const itemErrors = validationErrors[index] || [];

//                 // const address =
//                 //   newItem.address1 &&
//                 //   newItem.city &&
//                 //   newItem.state &&
//                 //   newItem.country &&
//                 //   newItem.zip
//                 //     ? `${newItem.address1}, ${newItem.city}, ${newItem.state}, ${newItem.country}, ${newItem.zip}`
//                 //     : "No Address";

//                 return (
//                   <React.Fragment key={`new-${index}`}>
//                     <TableRow>
//                       <TableCell className="px-6 py-3 text-left text-xs">
//                         <Select
//                           value={newItem.categoryID?.toString() || ""}
//                           onValueChange={(e) =>
//                             handleNewItemChange(index, "categoryID", e)
//                           }
//                         >
//                           <SelectTrigger className="w-[130px] text-xs">
//                             <SelectValue placeholder="Select a Product Categories" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {productsCategoryOptions.map(
//                               (innerData, innerIndex) => {
//                                 return (
//                                   <SelectItem
//                                     className="text-xs"
//                                     key={innerIndex}
//                                     value={innerData.pk_product_category_id.toString()}
//                                   >
//                                     {innerData.category_name}
//                                   </SelectItem>
//                                 );
//                               }
//                             )}
//                           </SelectContent>
//                         </Select>
//                       </TableCell>
//                       <TableCell className="px-6 py-3 text-left text-xs">
//                         <InfiniteProductSelect
//                           categoryId={newItem.categoryID || -1}
//                           value={{
//                             id: newItem.productID || -1,
//                             name: newItem.item_name || "",
//                             index: index,
//                           }}
//                           index={index}
//                           onValueChange={(value) => {
//                             handleNewItemChange(index, "productID", value.id);
//                             handleNewItemChange(index, "item_name", value.name);
//                             handleNewItemChange(
//                               index,
//                               "item_description",
//                               value.name
//                             );
//                           }}
//                           placeholder="Search and select a product..."
//                           enableSearch={true}
//                         />
//                       </TableCell>
//                       <TableCell className="px-6 py-3 text-left text-xs">
//                         <Input
//                           value={newItem.item_description || ""}
//                           style={{ width: "300px", fontSize: "12px" }}
//                           onChange={(e) =>
//                             handleNewItemChange(
//                               index,
//                               "item_description",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell className="px-6 py-3 text-left text-xs">
//                         <LogoCell2
//                           logoFile={newItem?.artworkURL || null}
//                           setLogoFile={(file) => {
//                             handleNewItemChange(index, "artworkURL", file);
//                           }}
//                         />
//                       </TableCell>
//                       <TableCell className="px-6 py-3 text-left text-xs">
//                         <Select
//                           value={newItem.yarnID?.toString() || ""}
//                           onValueChange={(e) =>
//                             handleNewItemChange(index, "yarnID", e)
//                           }
//                         >
//                           <SelectTrigger className="w-[130px] text-xs">
//                             <SelectValue placeholder="Select a Yarn" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {yarnsData?.items?.map((innerData, innerIndex) => {
//                               return (
//                                 <SelectItem
//                                   className="text-xs"
//                                   key={innerIndex}
//                                   value={innerData.pk_yarn_id.toString()}
//                                 >
//                                   {innerData.yarn_color}
//                                 </SelectItem>
//                               );
//                             }) || []}
//                           </SelectContent>
//                         </Select>
//                       </TableCell>
//                       <TableCell className="px-6 py-3 text-left text-xs">
//                         <Select
//                           value={newItem.packagingID?.toString() || ""}
//                           onValueChange={(e) =>
//                             handleNewItemChange(index, "packagingID", e)
//                           }
//                         >
//                           <SelectTrigger className="w-[130px] text-xs">
//                             <SelectValue placeholder="Select a Packaging" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {packagingData?.items?.map(
//                               (innerData, innerIndex) => {
//                                 return (
//                                   <SelectItem
//                                     className="text-xs"
//                                     key={innerIndex}
//                                     value={innerData.pk_packaging_id.toString()}
//                                   >
//                                     {innerData.packaging}
//                                   </SelectItem>
//                                 );
//                               }
//                             ) || []}
//                           </SelectContent>
//                         </Select>
//                       </TableCell>
//                       <TableCell className="px-6 py-3 text-left text-xs">
//                         <Select
//                           value={newItem.trimsID?.toString() || ""}
//                           onValueChange={(e) =>
//                             handleNewItemChange(index, "trimsID", e)
//                           }
//                         >
//                           <SelectTrigger className="w-[130px] text-xs">
//                             <SelectValue placeholder="Select a Trim" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {trimsData?.items?.map((innerData, innerIndex) => {
//                               return (
//                                 <SelectItem
//                                   className="text-xs"
//                                   key={innerIndex}
//                                   value={innerData.pk_trim_id.toString()}
//                                 >
//                                   {innerData.trim}
//                                 </SelectItem>
//                               );
//                             }) || []}
//                           </SelectContent>
//                         </Select>
//                       </TableCell>
//                       {/* region hidden select shipping address */}
//                       {/*<TableCell className="px-6 py-3 text-left text-xs">*/}
//                       {/*  <InfiniteAddressSelect*/}
//                       {/*    index={index}*/}
//                       {/*    customerID={customerID}*/}
//                       {/*    value={{*/}
//                       {/*      id: newItem.addressID || -1,*/}
//                       {/*      index,*/}
//                       {/*      address1: newItem.address1 || "",*/}
//                       {/*      city: newItem.city || "",*/}
//                       {/*      state: newItem.state || "",*/}
//                       {/*      zip: newItem.zip || "",*/}
//                       {/*      country: newItem.country || "",*/}
//                       {/*    }}*/}
//                       {/*    onValueChange={(value) => {*/}
//                       {/*      handleNewItemChange(index, "addressID", value.id);*/}
//                       {/*      handleNewItemChange(*/}
//                       {/*        index,*/}
//                       {/*        "address1",*/}
//                       {/*        value.address1*/}
//                       {/*      );*/}
//                       {/*      handleNewItemChange(index, "city", value.city);*/}
//                       {/*      handleNewItemChange(index, "state", value.state);*/}
//                       {/*      handleNewItemChange(index, "zip", value.zip);*/}
//                       {/*      handleNewItemChange(*/}
//                       {/*        index,*/}
//                       {/*        "country",*/}
//                       {/*        value.country*/}
//                       {/*      );*/}
//                       {/*    }}*/}
//                       {/*    placeholder="Choose a shipping address..."*/}
//                       {/*    className="w-full"*/}
//                       {/*  />*/}
//                       {/*</TableCell>*/}
//                       {/* endregion */}
//                       <TableCell className="px-6 py-3 text-right text-xs">
//                         <Input
//                           value={newItem.quantity || ""}
//                           style={{ width: "100px" }}
//                           type="number"
//                           onChange={(e) =>
//                             handleNewItemChange(
//                               index,
//                               "quantity",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell className="px-6 py-3 text-right text-xs">
//                         <Input
//                           value={newItem.unit_price || ""}
//                           style={{ width: "100px" }}
//                           type="number"
//                           onChange={(e) =>
//                             handleNewItemChange(
//                               index,
//                               "unit_price",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell className="px-6 py-3 text-right text-xs">
//                         {formatCurrency(totalAmount)}
//                       </TableCell>
//                       <TableCell className="text-center text-xs h-full p-0">
//                         <div className="flex items-center justify-center gap-2 h-full">
//                           <Button
//                             variant="ghost"
//                             className="cursor-pointer"
//                             onClick={() => handleOrderSaveClick(index)}
//                           >
//                             <Check className="text-green-500" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             className="cursor-pointer"
//                             onClick={() => handleCancelNewItem(index)}
//                           >
//                             <X className="text-red-500" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                     {/* Error notification row */}
//                     {itemErrors.length > 0 && (
//                       <TableRow>
//                         <TableCell colSpan={12} className="px-6 py-2">
//                           <Alert className="border-red-200 bg-red-50">
//                             <AlertCircle className="h-4 w-4 text-red-600" />
//                             <AlertDescription className="text-red-800">
//                               <div className="space-y-1">
//                                 <div className="font-semibold">
//                                   Please fix the following errors:
//                                 </div>
//                                 {itemErrors.map((error, errorIndex) => (
//                                   <div key={errorIndex} className="text-sm">
//                                     • {error.message}
//                                   </div>
//                                 ))}
//                               </div>
//                             </AlertDescription>
//                           </Alert>
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </React.Fragment>
//                 );
//               })}
//             </>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default OrdersItemsTable;
