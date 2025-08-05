"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Button } from "../../../../ui/button";
import {
  Plus,
  Save,
  SquarePen,
  SquareX,
  Trash2,
  ImagePlus,
  X,
  Asterisk,
  Package,
} from "lucide-react";
import { Separator } from "../../../../ui/separator";
import { Label } from "../../../../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import { Input } from "../../../../ui/input";
import {
  ProductionOrderItem,
  KnitColorFormData,
  BodyColorFormData,
  PackagingFormData,
} from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../ui/dialog";
import ImageUploadDropzone, {
  ExtendedFile,
} from "../../../crm/quotes-details/sections/image-upload-dropzone";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../ui/tooltip";
import { Badge } from "../../../../ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../ui/alert-dialog";
import { switchColor } from "../../../../custom/select/image-gallery-select";
import { MultipleKnitColorsSelect } from "../../../../custom/select/multiple-knit-colors-select";
import { MultipleBodyColorsSelect } from "../../../../custom/select/multiple-body-colors-select";
import { MultiplePackagingSelect } from "../../../../custom/select/multiple-packaging-select";
import { useProductsCategories } from "../../../../../hooks/useProducts2";
import InfiniteProductSelect from "../../../crm/quotes-details/custom/InfiniteProductSelect";
import { useYarns } from "../../../../../hooks/useYarns";
import { usePackaging } from "../../../../../hooks/usePackaging";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../ui/select";

// Extended production item used only inside this component
export interface ProductionItem extends ProductionOrderItem {
  images?: ExtendedFile[];
  imagesLoaded?: boolean;
}

interface ProductionItemsTableProps {
  productionItems: ProductionItem[];
  setProductionItems: React.Dispatch<React.SetStateAction<ProductionItem[]>>;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading?: boolean;
}

const ProductionItemsTable: React.FC<ProductionItemsTableProps> = ({
  productionItems,
  setProductionItems,
  setModifyFlag,
  isLoading = false,
}) => {
  const [editingItemId, setEditingItemId] = React.useState<number | null>(null);
  const [openImageUpload, setOpenImageUpload] = React.useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState<number>(-1);
  const [fullscreenImage, setFullscreenImage] =
    React.useState<ExtendedFile | null>(null);
  const [openFullscreenDialog, setOpenFullscreenDialog] =
    React.useState<boolean>(false);

  // API data hooks
  const { data: dataProductsCategory } = useProductsCategories();
  const productsCategoryOptions = dataProductsCategory?.items || [];

  const { data: yarnsData } = useYarns();
  const availableYarns = yarnsData?.items || [];

  const { data: packagingData } = usePackaging();
  const availablePackaging =
    packagingData?.items?.map((pkg) => ({
      pk_packaging_id: pkg.pk_packaging_id,
      name: pkg.packaging,
      type: "",
      dimensions: "",
      weight_capacity: 0,
      unit: "g",
      cost: 0,
    })) || [];

  // Memoize the Select values to prevent infinite re-renders
  const getSelectValue = React.useCallback(
    (value: number | undefined): string => {
      return value && value > 0 ? value.toString() : "";
    },
    []
  );

  // Calculate totals
  const subtotal = productionItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = productionItems.reduce(
    (sum, item) => sum + item.total * item.taxRate,
    0
  );
  const grandTotal = subtotal + taxAmount;

  const handleAddItem = () => {
    const newItem: ProductionItem = {
      productionOrderItemID: -1,
      productionOrderID: -1,
      productID: -1,
      categoryID: -1,
      categoryName: "",
      item_name: "",
      item_description: "",
      item_number: (productionItems.length + 1).toString(),
      size: "",
      quantity: 0,
      unit_price: 0,
      total: 0,
      knit_colors: [],
      body_colors: [],
      packaging: [],
      images: [],
      imagesLoaded: false,
      actionEdit: false,
      actionDelete: false,
      taxRate: 0.08,
      actionCreate: true,
      actionModify: true,
      actionEdited: false,
      errorState: [],
      modifyList: [],
    };

    setProductionItems((prev) => [...prev, newItem]);
    setModifyFlag(true);
  };

  const handleEditItem = (
    index: number,
    field: keyof ProductionItem,
    value: any
  ) => {
    setProductionItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        actionModify: true,
        actionEdited: true,
      };

      // Recalculate total if quantity or unit_price changed
      if (field === "quantity" || field === "unit_price") {
        updated[index].total =
          updated[index].quantity * updated[index].unit_price;
      }

      return updated;
    });
    setModifyFlag(true);
  };

  const handleRemoveItem = (index: number) => {
    setProductionItems((prev) => prev.filter((_, i) => i !== index));
    setModifyFlag(true);
  };

  const handleSaveClick = (index: number, data: ProductionItem) => {
    const errorState: string[] = [];

    // Basic validation
    if (!data.item_name) {
      errorState.push("Entering Item Name is required");
    }

    if (!data.quantity || data.quantity <= 0) {
      errorState.push("Entering Quantity is required");
    }

    if (errorState.length > 0) {
      setProductionItems((prevState) =>
        prevState.map((innerData, innerIndex) => {
          if (index === innerIndex) {
            return {
              ...innerData,
              errorState,
            };
          }
          return innerData;
        })
      );
      return;
    }

    // More detailed validation
    setProductionItems((prevState) =>
      prevState.map((innerData, innerIndex) => {
        if (innerIndex === index) {
          let errorState: string[] = [];

          if (data.categoryID === -1)
            errorState.push("Selecting Category is required");
          if (data.productID === -1)
            errorState.push("Selecting Product is required");
          if (data.item_description.length <= 0)
            errorState.push("Entering Item Description is required");
          if (data.quantity <= 0)
            errorState.push("Entering Quantity is required");
          if (data.knit_colors.length === 0)
            errorState.push("Adding at least one Knit Color is required");
          if (data.body_colors.length === 0)
            errorState.push("Adding at least one Body Color is required");
          if (data.packaging.length === 0)
            errorState.push("Adding at least one Packaging is required");

          if (errorState.length > 0)
            return { ...innerData, errorState } as ProductionItem;

          return {
            ...innerData,
            errorState: [],
            actionModify: false,
          } as ProductionItem;
        }
        return innerData;
      })
    );
    setModifyFlag(true);
  };

  const handleImageClick = (image: ExtendedFile) => {
    setFullscreenImage(image);
    setOpenFullscreenDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="py-4 px-6 flex flex-row justify-between items-center w-full border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Production Order Items
            </CardTitle>
            <p className="text-sm text-gray-500">
              Manage items for this production order
            </p>
          </div>
        </div>
        <Button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer text-sm font-medium"
          onClick={handleAddItem}
        >
          <Plus className="h-4 w-4" />
          Add Production Item
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                  Item Name
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider w-64">
                  Description
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Size
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Knit Colors
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Body Colors
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Packaging
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                  Qty
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Unit Price
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-[300px]">
                    <div className="w-full h-full flex flex-col gap-y-4 justify-center items-center">
                      <div className="bg-blue-100 rounded-full p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Loading production items...
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                          Please wait while we fetch the production order items
                          and their related data.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {productionItems.map((item, index) => (
                    <React.Fragment key={`item-${index}`}>
                      {item.actionModify ? (
                        <TableRow>
                          <TableCell colSpan={12} className="min-h-[100px]">
                            <div className="w-full flex flex-col gap-3 p-3">
                              {/* Item Number Badge */}
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-sm font-semibold"
                                >
                                  Item #{item.item_number}
                                </Badge>
                              </div>

                              {/* Main Form Fields - 3 columns with description */}
                              <div className="flex flex-row gap-6">
                                {/* Select Category */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs font-medium text-gray-700 pb-2">
                                    Category *
                                  </label>
                                  <Select
                                    value={getSelectValue(item.categoryID)}
                                    onValueChange={(value) => {
                                      const categoryData =
                                        productsCategoryOptions.find(
                                          (cat) =>
                                            cat.pk_product_category_id ===
                                            parseInt(value, 10)
                                        );
                                      if (categoryData) {
                                        handleEditItem(
                                          index,
                                          "categoryID",
                                          parseInt(value, 10)
                                        );
                                        handleEditItem(
                                          index,
                                          "categoryName",
                                          categoryData.category_name
                                        );
                                        // Reset product selection when category changes
                                        handleEditItem(index, "productID", -1);
                                        handleEditItem(index, "item_name", "");
                                        handleEditItem(
                                          index,
                                          "item_description",
                                          ""
                                        );
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {productsCategoryOptions.map(
                                        (category) => (
                                          <SelectItem
                                            key={
                                              category.pk_product_category_id
                                            }
                                            value={category.pk_product_category_id.toString()}
                                            className="text-sm"
                                          >
                                            {category.category_name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Item Product */}
                                <div className="flex flex-col">
                                  <label className="text-xs font-medium text-gray-700 pb-2">
                                    Item Product *
                                  </label>
                                  <InfiniteProductSelect
                                    categoryId={item.categoryID || -1}
                                    value={{
                                      id: item.productID,
                                      name: item.item_name,
                                      index: index,
                                    }}
                                    index={index}
                                    onValueChange={(value) => {
                                      if (item.item_number.length <= 0) {
                                        handleEditItem(
                                          index,
                                          "item_number",
                                          `${index + 1}`
                                        );
                                      }
                                      handleEditItem(
                                        index,
                                        "productID",
                                        value.id
                                      );
                                      handleEditItem(
                                        index,
                                        "item_name",
                                        value.name
                                      );
                                      handleEditItem(
                                        index,
                                        "item_description",
                                        `Item #${value.id} - ${item.categoryName} - ${value.name}`
                                      );
                                    }}
                                    placeholder="Select product"
                                    enableSearch={true}
                                    className="text-sm"
                                  />
                                </div>

                                {/* Description */}
                                <div className="flex flex-col w-full">
                                  <label className="text-xs font-medium text-gray-700 pb-2">
                                    Description
                                  </label>
                                  <Input
                                    value={item.item_description}
                                    onChange={(e) =>
                                      handleEditItem(
                                        index,
                                        "item_description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter item description"
                                    className="text-sm w-full"
                                  />
                                </div>
                              </div>

                              {/* Size, Quantity, Unit Price, Total Row */}
                              <div className="grid grid-cols-4 gap-3 w-full">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Size:
                                  </label>
                                  <Input
                                    type="text"
                                    value={item.size}
                                    onChange={(e) =>
                                      handleEditItem(
                                        index,
                                        "size",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g. S, M, L, XL"
                                    className="text-sm w-full"
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Quantity:
                                  </label>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleEditItem(
                                        index,
                                        "quantity",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0"
                                    className="text-sm w-full"
                                    min="0"
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Unit Price:
                                  </label>
                                  <Input
                                    type="number"
                                    value={item.unit_price}
                                    onChange={(e) =>
                                      handleEditItem(
                                        index,
                                        "unit_price",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0"
                                    className="text-sm w-full"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Total:
                                  </label>
                                  <Button
                                    variant="outline"
                                    className="w-full text-sm font-medium bg-gray-100 cursor-default border-gray-300"
                                    disabled
                                  >
                                    {formatCurrency(item.total)}
                                  </Button>
                                </div>
                              </div>

                              {/* Color and Packaging Selections - Three Columns */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Knit Colors */}
                                <MultipleKnitColorsSelect
                                  availableYarns={availableYarns}
                                  value={item.knit_colors}
                                  onChange={(colors) =>
                                    handleEditItem(index, "knit_colors", colors)
                                  }
                                />

                                {/* Body Colors */}
                                <MultipleBodyColorsSelect
                                  availableYarns={availableYarns}
                                  value={item.body_colors}
                                  onChange={(colors) =>
                                    handleEditItem(index, "body_colors", colors)
                                  }
                                />

                                {/* Packaging */}
                                <MultiplePackagingSelect
                                  availablePackaging={availablePackaging}
                                  value={item.packaging}
                                  onChange={(packaging) =>
                                    handleEditItem(
                                      index,
                                      "packaging",
                                      packaging
                                    )
                                  }
                                />
                              </div>

                              {/* Save/Cancel Buttons at Bottom */}
                              <div className="flex justify-end gap-2 mt-4">
                                <Button
                                  className="bg-green-500 hover:bg-green-600 text-white cursor-pointer flex items-center gap-2"
                                  onClick={() => handleSaveClick(index, item)}
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="cursor-pointer flex items-center gap-2"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <SquareX className="w-4 h-4" />
                                  Cancel
                                </Button>
                              </div>

                              {/* Error Display */}
                              {item.errorState &&
                                item.errorState.length > 0 && (
                                  <div className="flex flex-col gap-2 p-4 mt-4 border border-solid border-red-700 bg-red-50 rounded-lg text-red-700">
                                    {item.errorState.map(
                                      (errorMessage, errorIndex) => (
                                        <div
                                          className="flex flex-row items-center gap-2"
                                          key={errorIndex}
                                        >
                                          <Asterisk
                                            size={20}
                                            className="text-red-700"
                                          />
                                          <p className="text-xs font-semibold tracking-wide">
                                            {errorMessage}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}

                              <Separator className="my-2" />
                              <div className="w-full">
                                <div className="max-h-[150px] overflow-hidden">
                                  <div className="flex flex-row flex-wrap gap-1 p-1 items-center">
                                    {item.images &&
                                      item.images.map((image, imgIndex) => {
                                        if (image.preview || image.url) {
                                          return (
                                            <div
                                              key={imgIndex}
                                              className="relative flex flex-col gap-y-2"
                                            >
                                              <Badge
                                                className={`lowercase text-xs font-light absolute top-0 l-0 z-10 ${switchColor(
                                                  image.typeImage || image.type
                                                )}`}
                                              >
                                                {image.typeImage}
                                              </Badge>
                                              <div className="relative size-[70px] flex items-center justify-center border rounded-lg">
                                                <Button
                                                  variant="ghost"
                                                  className="absolute top-0 right-0 p-0 h-6 w-6 bg-white/80 hover:bg-white rounded-full z-10 cursor-pointer"
                                                  onClick={() => {
                                                    setProductionItems(
                                                      (prevState) =>
                                                        prevState.map(
                                                          (item, idx) => {
                                                            if (idx === index) {
                                                              return {
                                                                ...item,
                                                                images:
                                                                  item.images &&
                                                                  item.images.filter(
                                                                    (
                                                                      _,
                                                                      imgIdx
                                                                    ) =>
                                                                      imgIdx !==
                                                                      imgIndex
                                                                  ),
                                                                actionEdited:
                                                                  true,
                                                              };
                                                            }
                                                            return item;
                                                          }
                                                        )
                                                    );
                                                    setModifyFlag(true);
                                                  }}
                                                >
                                                  <X
                                                    size={14}
                                                    className="text-gray-700"
                                                  />
                                                </Button>
                                                <img
                                                  src={
                                                    image.preview || image.url
                                                  }
                                                  alt={image.name}
                                                  className="h-full w-full object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                  onClick={() =>
                                                    handleImageClick(image)
                                                  }
                                                  onError={(e) => {
                                                    const target =
                                                      e.target as HTMLImageElement;
                                                    target.style.display =
                                                      "none";
                                                    const parent =
                                                      target.parentNode as HTMLElement;
                                                    const fallback =
                                                      document.createElement(
                                                        "div"
                                                      );
                                                    fallback.className =
                                                      "text-xs text-gray-500";
                                                    fallback.innerText =
                                                      "No preview";
                                                    parent.appendChild(
                                                      fallback
                                                    );
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div
                                              key={imgIndex}
                                              className="h-full w-24 flex items-center justify-center border rounded"
                                            >
                                              <div className="text-xs text-gray-500">
                                                No preview
                                              </div>
                                            </div>
                                          );
                                        }
                                      })}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="cursor-pointer"
                                          onClick={() => {
                                            setOpenImageUpload(true);
                                            setCurrentImageIndex(index);
                                          }}
                                        >
                                          <ImagePlus
                                            size={30}
                                            className="text-blue-500"
                                          />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Upload Image</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          <TableRow className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                            <TableCell className="p-3 text-sm ">
                              <div
                                className="max-w-24 min-w-0 whitespace-normal break-words hyphens-auto text-gray-700"
                                title={item.item_name}
                              >
                                {item.item_name}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                              <div
                                className="truncate text-gray-700  w-64"
                                title={item.item_description}
                              >
                                {item.item_description}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                              <div
                                className="truncate text-gray-700"
                                title={item.categoryName}
                              >
                                {item.categoryName}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                              <div className="truncate text-gray-700">
                                {item.size ? (
                                  <span className="font-medium">
                                    {item.size.toUpperCase()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    -
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                              <div className="text-gray-700 w-18 whitespace-normal break-words">
                                {(() => {
                                  return item.knit_colors.length > 0 ? (
                                    item.knit_colors
                                      .map((color) => color.name)
                                      .join(", ")
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      -
                                    </span>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                              <div className="w-18 text-gray-700 break-words">
                                {(() => {
                                  return item.body_colors.length > 0 ? (
                                    item.body_colors
                                      .map((color) => color.name)
                                      .join(", ")
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      -
                                    </span>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                              <div className="max-w-18 min-w-0 whitespace-normal break-words hyphens-auto text-gray-700">
                                {(() => {
                                  return item.packaging.length > 0 ? (
                                    item.packaging
                                      .map((pkg) => {
                                        const packageInfo =
                                          availablePackaging.find(
                                            (p) =>
                                              p.pk_packaging_id ===
                                              pkg.fk_packaging_id
                                          );
                                        return (
                                          packageInfo?.name ||
                                          `Package ${pkg.fk_packaging_id}`
                                        );
                                      })
                                      .join(", ")
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      -
                                    </span>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 text-sm text-center">
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {item.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="p-3 text-sm text-right">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="p-3 text-sm text-right font-medium">
                              {formatCurrency(item.total)}
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                              <div className="flex gap-1">
                                <Button
                                  className="cursor-pointer hover:bg-blue-50"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditItem(index, "actionModify", true)
                                  }
                                >
                                  <SquarePen className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  className="cursor-pointer hover:bg-red-50"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                                {item.images && item.images.length > 0 && (
                                  <Button
                                    className="cursor-pointer hover:bg-green-50"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setOpenImageUpload(true);
                                      setCurrentImageIndex(index);
                                    }}
                                  >
                                    <ImagePlus className="h-4 w-4 text-green-600" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={12} className="min-h-[100px]">
                              <div className="w-full">
                                <div className="max-h-[150px] overflow-hidden">
                                  <div className="flex flex-row flex-wrap gap-1 p-1 items-center">
                                    {item.images &&
                                      item.images.map((image, imgIndex) => {
                                        if (image.preview || image.url) {
                                          return (
                                            <div
                                              key={imgIndex}
                                              className="relative flex flex-col gap-y-2"
                                            >
                                              <Badge
                                                className={`lowercase text-xs font-light absolute top-0 l-0 z-10 ${switchColor(
                                                  image.typeImage || image.type
                                                )}`}
                                              >
                                                {image.typeImage}
                                              </Badge>
                                              <div className="relative size-[70px] flex items-center justify-center border rounded-lg">
                                                <img
                                                  src={
                                                    image.preview || image.url
                                                  }
                                                  alt={image.name}
                                                  className="h-full w-full object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                  onClick={() =>
                                                    handleImageClick(image)
                                                  }
                                                  onError={(e) => {
                                                    const target =
                                                      e.target as HTMLImageElement;
                                                    target.style.display =
                                                      "none";
                                                    const parent =
                                                      target.parentNode as HTMLElement;
                                                    const fallback =
                                                      document.createElement(
                                                        "div"
                                                      );
                                                    fallback.className =
                                                      "text-xs text-gray-500";
                                                    fallback.innerText =
                                                      "No preview";
                                                    parent.appendChild(
                                                      fallback
                                                    );
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div
                                              key={imgIndex}
                                              className="h-full w-24 flex items-center justify-center border rounded"
                                            >
                                              <div className="text-xs text-gray-500">
                                                No preview
                                              </div>
                                            </div>
                                          );
                                        }
                                      })}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
              {productionItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="h-[300px]">
                    <div className="w-full h-full flex flex-col gap-y-4 justify-center items-center">
                      <div className="bg-gray-100 rounded-full p-6">
                        <Package size={48} className="text-gray-400" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No production items yet
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                          Start by adding items to this production order. You
                          can add products, colors, and packaging.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Image Upload Dialog */}
        {openImageUpload && (
          <Dialog open={openImageUpload} onOpenChange={setOpenImageUpload}>
            <DialogTrigger asChild>{}</DialogTrigger>
            <DialogContent className="w-[70%]">
              <DialogHeader>
                <DialogTitle>Upload Image to Production Item</DialogTitle>
                <DialogDescription className="hidden">{`Production Item Row ${
                  currentImageIndex + 1
                }`}</DialogDescription>
              </DialogHeader>

              <ImageUploadDropzone
                currentItemIndex={currentImageIndex}
                onSaveImages={(files, index) => {
                  setProductionItems((prevState) => {
                    const updatedState = prevState.map((item, idx) => {
                      if (idx === index) {
                        const updatedItem = {
                          ...item,
                          images: [...(item.images || []), ...files],
                          imagesLoaded: true,
                        };
                        return updatedItem;
                      }
                      return item;
                    });

                    return updatedState;
                  });
                  setOpenImageUpload(false);
                  setModifyFlag(true);
                }}
              />

              <DialogFooter>{}</DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Fullscreen Image Dialog */}
        {openFullscreenDialog && (
          <AlertDialog
            open={openFullscreenDialog}
            onOpenChange={setOpenFullscreenDialog}
          >
            <AlertDialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-none shadow-none">
              <div className="relative w-full h-full flex items-center justify-center">
                {fullscreenImage && (
                  <div className="relative max-w-full max-h-full">
                    <img
                      src={fullscreenImage.preview || fullscreenImage.url}
                      alt={fullscreenImage.name}
                      className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentNode as HTMLElement;
                        const fallback = document.createElement("div");
                        fallback.className =
                          "text-lg text-white bg-gray-800 p-8 rounded-lg";
                        fallback.innerText = "Image not available";
                        parent.appendChild(fallback);
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
                        onClick={() => setOpenFullscreenDialog(false)}
                      >
                        <X size={20} />
                      </Button>
                    </div>
                    {fullscreenImage.name && (
                      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
                        <p className="text-sm font-medium">
                          {fullscreenImage.name}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionItemsTable;
