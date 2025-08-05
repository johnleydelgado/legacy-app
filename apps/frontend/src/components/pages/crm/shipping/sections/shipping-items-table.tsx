"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";

import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Button } from "../../../../ui/button";
import {
  Asterisk,
  ImagePlus,
  Package,
  Plus,
  Save,
  SquarePen,
  SquareX,
  Trash2,
  X,
  AlertCircle,
  Truck,
} from "lucide-react";
import { Separator } from "../../../../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import { Label } from "../../../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../ui/select";
import { useProductsCategories } from "../../../../../hooks/useProducts2";
import InfiniteProductSelect from "../../quotes-details/custom/InfiniteProductSelect";
import { Input } from "../../../../ui/input";
import { useYarns } from "../../../../../hooks/useYarns";
import { useTrims } from "../../../../../hooks/useTrims";
import { usePackaging } from "../../../../../hooks/usePackaging";
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
} from "../../quotes-details/sections/image-upload-dropzone";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../ui/tooltip";
import ImageGallerySelect, {
  switchColor,
} from "../../../../custom/select/image-gallery-select";
import { Badge } from "../../../../ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../../ui/pagination";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../ui/alert-dialog";

import { TableOrdersItems } from "../types";
import { PackageSpec } from "./package-specifications";

// Extended shipping item used only inside this component
export interface ShippingItem extends TableOrdersItems {
  images?: ExtendedFile[];
  imagesLoaded?: boolean;
  taxRate: number;
  actionCreate: boolean;
  actionModify: boolean;
  actionEdited: boolean;
  errorState: string[];
  modifyList?: string[];
  itemNumber: string; // human-readable reference like "1-5"
  packageID?: number; // ID of the package this item is assigned to
  packageQuantities?: Record<number, number>; // Map of package ID to quantity for this item
  originalOrderItemID?: number; // ID of the original order item for image fetching
}

interface ModifiedItemType {
  index: number;
  value: string;
}

const initialItemValue: ShippingItem = {
  orderItemsID: -1,
  orderID: -1,
  productID: -1,
  categoryID: -1,
  categoryName: "",
  itemNumber: "",
  item_name: "",
  item_description: "",
  images: [],
  imagesLoaded: false,
  packagingID: -1,
  packagingName: "",
  trimsID: -1,
  trimsName: "",
  yarnID: -1,
  yarnName: "",
  quantity: 0,
  unit_price: 0,
  taxRate: 0.08,
  total: 0,
  actionCreate: false,
  actionModify: false,
  actionEdited: false,
  actionEdit: false,
  actionDelete: false,
  errorState: [],
  modifyList: [],
  packageID: undefined,
  packageQuantities: {},
};

interface ComponentsProps {
  shippingItems: ShippingItem[];
  setShippingItems: React.Dispatch<React.SetStateAction<ShippingItem[]>>;
  setModifyFlag: (tick: boolean) => void;
  setDeletedShippingItems?: React.Dispatch<React.SetStateAction<number[]>>;
  packages?: PackageSpec[];
  // Pagination props
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const ShippingItemsTable = React.memo(
  ({
    shippingItems,
    setShippingItems,
    setModifyFlag,
    setDeletedShippingItems,
    packages = [],
    totalItems = 0,
    currentPage = 1,
    totalPages = 1,
    onPageChange = () => {},
  }: ComponentsProps) => {
    const [openImageUpload, setOpenImageUpload] =
      React.useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] =
      React.useState<number>(-1);
    const [fullscreenImage, setFullscreenImage] =
      React.useState<ExtendedFile | null>(null);
    const [openFullscreenDialog, setOpenFullscreenDialog] =
      React.useState<boolean>(false);

    const tableRef = React.useRef<HTMLTableElement>(null);
    const [width, setWidth] = React.useState(0);

    const [modifiedItems, setModifiedItems] = React.useState<
      ModifiedItemType[]
    >([]);

    React.useLayoutEffect(() => {
      const updateWidth = () => {
        if (tableRef.current) {
          setWidth(tableRef.current.offsetWidth - 45);
        }
      };
      updateWidth();
      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }, []);

    const { data: dataProductsCategory } = useProductsCategories();
    const productsCategoryOptions = dataProductsCategory?.items || [];

    const { data: yarnsData } = useYarns();
    const { data: trimsData } = useTrims();
    const { data: packagingData } = usePackaging();

    // Memoize the Select values to prevent infinite re-renders
    const getSelectValue = React.useCallback(
      (value: number | undefined): string => {
        return value && value > 0 ? value.toString() : "";
      },
      []
    );

    const handleAddingItems = () => {
      setShippingItems((prevState) => [
        ...prevState,
        {
          ...initialItemValue,
          actionCreate: true,
          actionModify: true,
        },
      ]);
    };

    const handleOnchangeText = (
      index: number,
      label: string,
      value: number | string | File | null
    ) => {
      setModifyFlag(true);

      if (["productID", "item_name", "itemNumber"].includes(label)) {
        setShippingItems((prevState) =>
          prevState.map((data, innerIndex) => {
            if (index === innerIndex) {
              return {
                ...data,
                [label]: value,
                actionEdited: true,
              } as ShippingItem;
            }
            return data;
          })
        );
      }

      if (label === "categoryID" && typeof value === "string") {
        // region Change Category Data
        const categoryData = productsCategoryOptions.filter(
          (data) => data.pk_product_category_id === parseInt(value, 10)
        );

        if (categoryData.length > 0) {
          setShippingItems((prevState) =>
            prevState.map((data, innerIndex) => {
              if (index === innerIndex) {
                return {
                  ...data,
                  categoryID: parseInt(value, 10),
                  categoryName: categoryData[0].category_name,
                  actionEdited: true,
                  modifyList: [
                    ...(data.modifyList || []),
                    `Change Product Category to ${categoryData[0].category_name}`,
                  ],
                } as ShippingItem;
              }
              return data;
            })
          );
        }
        // endregion
      } else if (label === "yarnID" && typeof value === "string") {
        // region Change Yarns Data
        const yarnsFiltered =
          yarnsData?.items?.filter(
            (data) => data.pk_yarn_id === parseInt(value, 10)
          ) || [];

        if (yarnsFiltered.length > 0) {
          setShippingItems((prevState) =>
            prevState.map((data, innerIndex) => {
              if (index === innerIndex) {
                return {
                  ...data,
                  yarnID: parseInt(value, 10),
                  yarnName: `${yarnsFiltered[0].color_code} - ${yarnsFiltered[0].yarn_color}`,
                  actionEdited: true,
                  modifyList: [
                    ...(data.modifyList || []),
                    `Change Yarn to ${yarnsFiltered[0].color_code} - ${yarnsFiltered[0].yarn_color}`,
                  ],
                } as ShippingItem;
              }
              return data;
            })
          );
        }
        // endregion
      } else if (label === "trimsID" && typeof value === "string") {
        // region Change Trim Data
        const trimsFiltered =
          trimsData?.items?.filter(
            (data) => data.pk_trim_id === parseInt(value, 10)
          ) || [];

        if (trimsFiltered.length > 0) {
          setShippingItems((prevState) =>
            prevState.map((data, innerIndex) => {
              if (index === innerIndex) {
                return {
                  ...data,
                  trimsID: parseInt(value, 10),
                  trimsName: `${trimsFiltered[0].trim}`,
                  actionEdited: true,
                  modifyList: [
                    ...(data.modifyList || []),
                    `Change Trim to ${trimsFiltered[0].trim}`,
                  ],
                } as ShippingItem;
              }
              return data;
            })
          );
        }
        // endregion
      } else if (label === "packagingID" && typeof value === "string") {
        // region Change Packaging Data
        const packagingFiltered =
          packagingData?.items?.filter(
            (data) => data.pk_packaging_id === parseInt(value, 10)
          ) || [];

        if (packagingFiltered.length > 0) {
          setShippingItems((prevState) =>
            prevState.map((data, innerIndex) => {
              if (index === innerIndex) {
                return {
                  ...data,
                  packagingID: parseInt(value, 10),
                  packagingName: `${packagingFiltered[0].packaging}`,
                  actionEdited: true,
                  modifyList: [
                    ...(data.modifyList || []),
                    `Change Packaging to ${packagingFiltered[0].packaging}`,
                  ],
                } as ShippingItem;
              }
              return data;
            })
          );
        }
        // endregion
      } else if (label === "quantity") {
        const quantityValue =
          typeof value === "number"
            ? value
            : typeof value === "string"
            ? parseInt(value, 10) || 0
            : 0;

        setShippingItems((prevState) =>
          prevState.map((data, innerIndex) => {
            if (index === innerIndex) {
              return {
                ...data,
                quantity: quantityValue,
                actionEdited: true,
              } as ShippingItem;
            }
            return data;
          })
        );
      } else if ("item_description" === label) {
        const descValue =
          typeof value === "string"
            ? value
            : value !== null && value !== undefined
            ? String(value)
            : "";

        setShippingItems((prevState) =>
          prevState.map((data, innerIndex) => {
            if (index === innerIndex) {
              return {
                ...data,
                item_description: descValue,
                actionEdited: true,
              } as ShippingItem;
            }
            return data;
          })
        );
      }
    };

    const handleSaveClick = (index: number, data: ShippingItem) => {
      const errorState: string[] = [];

      if (!data.item_name) {
        errorState.push("Entering Item Name is required");
      }

      if (!data.quantity || data.quantity <= 0) {
        errorState.push("Entering Quantity is required");
      }

      if (errorState.length > 0) {
        setShippingItems((prevState) =>
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

      setShippingItems((prevState) =>
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
            if (data.yarnID <= 0) errorState.push("Selecting Yarn is required");
            if (data.trimsID <= 0)
              errorState.push("Selecting Trim is required");
            if (data.packagingID <= 0)
              errorState.push("Selecting Packaging is required");

            const modifyList = modifiedItems
              .filter((m) => m.index === index)
              .map((m) => m.value);

            if (errorState.length > 0)
              return { ...innerData, errorState, modifyList } as ShippingItem;

            return {
              ...innerData,
              errorState,
              modifyList,
              actionModify: false,
            } as ShippingItem;
          }
          return innerData;
        })
      );
    };

    const handleEditClick = (index: number) => {
      setShippingItems((prevState) =>
        prevState.map((data, innerIndex) => {
          if (innerIndex === index) {
            return { ...data, actionModify: true } as ShippingItem;
          }
          return data;
        })
      );
    };

    const handleImageClick = (image: ExtendedFile) => {
      setFullscreenImage(image);
      setOpenFullscreenDialog(true);
    };

    // Pagination helper
    const generatePagination = (currentPage: number, totalPages: number) => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      const pages: (number | string)[] = [];
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis-start");
      const rangeStart = Math.max(2, currentPage - 1);
      const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
      for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis-end");
      pages.push(totalPages);
      return pages;
    };

    const itemsPerPage = 10;
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="py-4 px-6 flex flex-row justify-between items-center w-full border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-2">
              <Truck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Shipping Items
              </CardTitle>
              <p className="text-sm text-gray-500">
                Manage items for this shipping order
              </p>
            </div>
          </div>
          <Button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer text-sm font-medium"
            onClick={handleAddingItems}
          >
            <Plus className="h-4 w-4" />
            Add Shipping Item
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table ref={tableRef} className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Item #
                  </TableHead>
                  <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Yarns
                  </TableHead>
                  <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Package
                  </TableHead>
                  <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trims
                  </TableHead>
                  <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                    Quantity
                  </TableHead>
                  <TableHead className="p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shippingItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[300px]">
                      <div className="w-full h-full flex flex-col gap-y-4 justify-center items-center">
                        <div className="bg-gray-100 rounded-full p-6">
                          <Package size={48} className="text-gray-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No shipping items yet
                          </h3>
                          <p className="text-gray-500 max-w-sm mx-auto">
                            Start by adding items to this shipping order. You
                            can add products, trims, yarns, and packaging.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  shippingItems.map((data, index) => {
                    if (data.actionModify) {
                      return (
                        <TableRow key={`edit-${index}`}>
                          <TableCell colSpan={8} className="min-h-[100px]">
                            <div className="w-full flex flex-row flex-wrap gap-2 p-1 w-full">
                              <div className="flex flex-row flex-wrap gap-1 w-[35%] grow">
                                <div className="flex flex-col gap-1 w-[35%] max-w-[120px] grow">
                                  {/* region Select Category */}
                                  <Label className="text-xs font-light">
                                    Select Category:
                                  </Label>
                                  {(() => {
                                    const selectValue = getSelectValue(
                                      data.categoryID
                                    );
                                    return (
                                      <Select
                                        value={selectValue}
                                        onValueChange={(e) => {
                                          handleOnchangeText(
                                            index,
                                            "categoryID",
                                            e
                                          );
                                          handleOnchangeText(
                                            index,
                                            "productID",
                                            -1
                                          );
                                          handleOnchangeText(
                                            index,
                                            "item_name",
                                            ""
                                          );
                                          handleOnchangeText(
                                            index,
                                            "item_description",
                                            ""
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="text-xs w-full">
                                          <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {productsCategoryOptions.map(
                                            (innerData, innerIndex) => {
                                              return (
                                                <SelectItem
                                                  className="text-xs"
                                                  key={innerIndex}
                                                  value={innerData.pk_product_category_id.toString()}
                                                >
                                                  {innerData.category_name}
                                                </SelectItem>
                                              );
                                            }
                                          )}
                                        </SelectContent>
                                      </Select>
                                    );
                                  })()}
                                  {/* endregion */}
                                </div>
                                <div className="flex flex-col gap-1 w-[55%] grow">
                                  {/* region Select Product */}
                                  <Label className="text-xs font-light">
                                    Select Item Product:
                                  </Label>
                                  <InfiniteProductSelect
                                    categoryId={data.categoryID || -1}
                                    value={{
                                      id: data.productID,
                                      name: data.item_name,
                                      index: index,
                                    }}
                                    index={index}
                                    onValueChange={(value) => {
                                      if (data.itemNumber.length <= 0) {
                                        handleOnchangeText(
                                          value.index,
                                          "itemNumber",
                                          `#${index}-${value.id}`
                                        );
                                      }

                                      handleOnchangeText(
                                        value.index,
                                        "productID",
                                        value.id
                                      );
                                      handleOnchangeText(
                                        value.index,
                                        "item_name",
                                        value.name
                                      );
                                      handleOnchangeText(
                                        value.index,
                                        "item_description",
                                        `Item #${value.id} - ${data.categoryName} - ${value.name}`
                                      );
                                    }}
                                    placeholder=""
                                    enableSearch={true}
                                    className="text-xs w-full"
                                  />
                                  {/* endregion */}
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                  {/* region Edit Description */}
                                  <Label className="text-xs font-light">
                                    Description:
                                  </Label>
                                  <Input
                                    value={data.item_description}
                                    style={{ fontSize: "12px" }}
                                    placeholder=""
                                    onChange={(e) =>
                                      handleOnchangeText(
                                        index,
                                        "item_description",
                                        e.target.value
                                      )
                                    }
                                  />
                                  {/* endregion */}
                                </div>
                              </div>
                              <div className="flex flex-row flex-wrap gap-1 w-[55%] grow">
                                <div className="flex flex-col gap-1 w-[30%] w-max-[120px] grow">
                                  {/*region Select Yarn*/}
                                  <Label className="text-xs font-light">
                                    Select Yarn:
                                  </Label>
                                  <Select
                                    value={getSelectValue(data.yarnID)}
                                    onValueChange={(e) =>
                                      handleOnchangeText(index, "yarnID", e)
                                    }
                                  >
                                    <SelectTrigger className="w-full text-xs">
                                      <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {yarnsData?.items?.map(
                                        (innerData, innerIndex) => {
                                          return (
                                            <SelectItem
                                              className="text-xs"
                                              key={innerIndex}
                                              value={innerData.pk_yarn_id.toString()}
                                            >
                                              {`${innerData.color_code} - ${innerData.yarn_color}`}
                                            </SelectItem>
                                          );
                                        }
                                      ) || []}
                                    </SelectContent>
                                  </Select>
                                  {/*endregion*/}
                                </div>
                                <div className="flex flex-col gap-1 w-[30%] w-max-[120px] grow">
                                  {/*region Select Trim*/}
                                  <Label className="text-xs font-light">
                                    Select Trim:
                                  </Label>
                                  <Select
                                    value={getSelectValue(data.trimsID)}
                                    onValueChange={(e) =>
                                      handleOnchangeText(index, "trimsID", e)
                                    }
                                  >
                                    <SelectTrigger className="w-full text-xs">
                                      <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {trimsData?.items?.map(
                                        (innerData, innerIndex) => {
                                          return (
                                            <SelectItem
                                              className="text-xs"
                                              key={innerIndex}
                                              value={innerData.pk_trim_id.toString()}
                                            >
                                              {`${innerData.trim}`}
                                            </SelectItem>
                                          );
                                        }
                                      ) || []}
                                    </SelectContent>
                                  </Select>
                                  {/*endregion*/}
                                </div>
                                <div className="flex flex-col gap-1 w-[30%] w-max-[120px] grow">
                                  {/*region Select Packaging*/}
                                  <Label className="text-xs font-light">
                                    Select Packaging:
                                  </Label>
                                  <Select
                                    value={getSelectValue(data.packagingID)}
                                    onValueChange={(e) =>
                                      handleOnchangeText(
                                        index,
                                        "packagingID",
                                        e
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full text-xs">
                                      <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {packagingData?.items?.map(
                                        (innerData, innerIndex) => {
                                          return (
                                            <SelectItem
                                              className="text-xs"
                                              key={innerIndex}
                                              value={innerData.pk_packaging_id.toString()}
                                            >
                                              {`${innerData.packaging}`}
                                            </SelectItem>
                                          );
                                        }
                                      ) || []}
                                    </SelectContent>
                                  </Select>
                                  {/*endregion*/}
                                </div>
                                <div className="flex flex-col gap-1 pr-11">
                                  {/*region Package Assignment Info*/}
                                  <Label className="text-xs font-light">
                                    Package Assignment:
                                  </Label>
                                  <div className="text-xs text-gray-500 px-2 py-1 ">
                                    {Object.keys(data.packageQuantities || {})
                                      .length > 0 ? (
                                      <span className="text-green-600">
                                        Assigned to{" "}
                                        {
                                          Object.keys(
                                            data.packageQuantities || {}
                                          ).length
                                        }{" "}
                                        package(s)
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">
                                        Not assigned
                                      </span>
                                    )}
                                  </div>
                                  {/*endregion*/}
                                </div>
                                <div className="flex flex-col gap-1 w-[30%] max-w-[100px]">
                                  {/* region Enter Quantity */}
                                  <Label className="text-xs font-light">
                                    Quantity:
                                  </Label>
                                  <Input
                                    type="number"
                                    value={data.quantity}
                                    style={{ fontSize: "12px" }}
                                    placeholder=""
                                    onChange={(e) => {
                                      handleOnchangeText(
                                        index,
                                        "quantity",
                                        parseInt(e.target.value, 10)
                                      );
                                    }}
                                  />
                                  {/* endregion */}
                                </div>
                              </div>
                              <div className="flex flex-row justify-end w-max-[120px] gap-1 p-1 w-[30%] grow h-[45px] mt-[13px]">
                                <Button
                                  className="bg-green-500 text-white cursor-pointer text-sm w-[100px]"
                                  onClick={() => handleSaveClick(index, data)}
                                >
                                  <Save />
                                  Save
                                </Button>
                                <Button
                                  className="bg-red-500 text-white cursor-pointer text-sm w-[100px]"
                                  onClick={() => {
                                    if (
                                      data.actionCreate &&
                                      data.actionModify
                                    ) {
                                      setShippingItems((prevState) =>
                                        prevState.filter(
                                          (_, innerIndex) =>
                                            innerIndex !== index
                                        )
                                      );
                                    } else if (
                                      !data.actionCreate &&
                                      data.actionModify
                                    ) {
                                      setShippingItems((prevState) =>
                                        prevState.map(
                                          (innerData, innerIndex) => {
                                            if (index === innerIndex)
                                              return {
                                                ...innerData,
                                                actionModify: false,
                                              };

                                            return innerData;
                                          }
                                        )
                                      );
                                    }
                                  }}
                                >
                                  <SquareX />
                                  Cancel
                                </Button>
                              </div>
                              <Separator className="my-2" />
                              <div className="w-full">
                                <div className="max-h-[150px] overflow-hidden">
                                  <div className="flex flex-row flex-wrap gap-1 p-1 items-center">
                                    {data.images &&
                                      data.images.map(
                                        (innerData, innerIndex) => {
                                          if (
                                            innerData.preview ||
                                            innerData.url
                                          ) {
                                            return (
                                              <div
                                                key={innerIndex}
                                                className="relative flex flex-col gap-y-2"
                                              >
                                                <Badge
                                                  className={`lowercase text-xs font-light absolute top-0 l-0 z-10 ${switchColor(
                                                    innerData.typeImage ||
                                                      innerData.type
                                                  )}`}
                                                >
                                                  {innerData.typeImage}
                                                </Badge>
                                                <div className="relative size-[70px] flex items-center justify-center border rounded-lg">
                                                  <Button
                                                    variant="ghost"
                                                    className="absolute top-0 right-0 p-0 h-6 w-6 bg-white/80 hover:bg-white rounded-full z-10 cursor-pointer"
                                                    onClick={() => {
                                                      setShippingItems(
                                                        (prevState) =>
                                                          prevState.map(
                                                            (item, idx) => {
                                                              if (
                                                                idx === index
                                                              ) {
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
                                                                        innerIndex
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
                                                      innerData.preview ||
                                                      innerData.url
                                                    }
                                                    alt={innerData.name}
                                                    className="h-full w-full object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() =>
                                                      handleImageClick(
                                                        innerData
                                                      )
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
                                                key={innerIndex}
                                                className="h-full w-24 flex items-center justify-center border rounded"
                                              >
                                                <div className="text-xs text-gray-500">
                                                  No preview
                                                </div>
                                              </div>
                                            );
                                          }
                                        }
                                      )}
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
                              {data.errorState &&
                                data.errorState.length > 0 && (
                                  <div
                                    className="flex flex-col gap-2 p-4 w-1/2
                                       border border-solid border-red-700 bg-red-50 rounded-lg text-red-700"
                                  >
                                    {data.errorState.map(
                                      (innerData, innerIndex) => (
                                        <div
                                          className="flex flex-row items-center gap-2"
                                          key={innerIndex}
                                        >
                                          <Asterisk
                                            size={20}
                                            className="text-red-700"
                                          />
                                          <p className="text-xs font-semibold tracking-wide">
                                            {innerData}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return (
                      <React.Fragment key={`item-${index}`}>
                        <TableRow className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <TableCell className="p-3 text-sm">
                            <div
                              className="truncate font-medium text-gray-900"
                              title={data.categoryName}
                            >
                              {data.categoryName}
                            </div>
                          </TableCell>
                          <TableCell className="p-3 text-sm">
                            <span className="font-mono text-blue-600 font-medium">
                              #{data.itemNumber}
                            </span>
                          </TableCell>
                          <TableCell className="p-3 text-sm">
                            <div
                              className="truncate text-gray-700"
                              title={data.item_description}
                            >
                              {data.item_description}
                            </div>
                          </TableCell>
                          <TableCell className="p-3 text-sm">
                            <div
                              className="truncate text-gray-700"
                              title={data.yarnName}
                            >
                              {data.yarnName || (
                                <span className="text-gray-400 italic">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-3 text-sm">
                            <div
                              className="truncate text-gray-700"
                              title={data.packagingName}
                            >
                              {data.packagingName || (
                                <span className="text-gray-400 italic">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-3 text-sm">
                            <div
                              className="truncate text-gray-700"
                              title={data.trimsName}
                            >
                              {data.trimsName || (
                                <span className="text-gray-400 italic">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-3 text-sm text-center">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {data.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="p-3 text-sm">
                            <div className="flex gap-1">
                              <Button
                                className="cursor-pointer hover:bg-blue-50"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(index)}
                              >
                                <SquarePen className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                className="cursor-pointer hover:bg-red-50"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (setDeletedShippingItems) {
                                    setDeletedShippingItems((prevState) => [
                                      ...prevState,
                                      data.orderItemsID,
                                    ]);
                                  }
                                  setShippingItems((prevState) =>
                                    prevState.filter(
                                      (_, innerIndex) => innerIndex !== index
                                    )
                                  );
                                  setModifyFlag(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                              {data.images && data.images.length > 0 && (
                                <Button
                                  className="cursor-pointer hover:bg-green-50"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentImageIndex(index);
                                    setOpenImageUpload(true);
                                  }}
                                >
                                  <ImagePlus className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={8} className="min-h-[100px]">
                            <div className="w-full">
                              <div className="max-h-[150px] overflow-hidden">
                                <div className="flex flex-row flex-wrap gap-1 p-1 items-center">
                                  {data.images &&
                                    data.images.map((innerData, innerIndex) => {
                                      if (innerData.preview || innerData.url) {
                                        return (
                                          <div
                                            key={innerIndex}
                                            className="relative flex flex-col gap-y-2"
                                          >
                                            <Badge
                                              className={`lowercase text-xs font-light absolute top-0 l-0 z-10 ${switchColor(
                                                innerData.typeImage ||
                                                  innerData.type
                                              )}`}
                                            >
                                              {innerData.typeImage}
                                            </Badge>
                                            <div className="relative size-[70px] flex items-center justify-center border rounded-lg">
                                              <img
                                                src={
                                                  innerData.preview ||
                                                  innerData.url
                                                }
                                                alt={innerData.name}
                                                className="h-full w-full object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() =>
                                                  handleImageClick(innerData)
                                                }
                                                onError={(e) => {
                                                  const target =
                                                    e.target as HTMLImageElement;
                                                  target.style.display = "none";
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
                                                  parent.appendChild(fallback);
                                                }}
                                              />
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div
                                            key={innerIndex}
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
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-end items-center mt-4 px-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1 && onPageChange)
                          onPageChange(currentPage - 1);
                      }}
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {generatePagination(currentPage || 0, totalPages || 0).map(
                    (page, i) => {
                      if (
                        page === "ellipsis-start" ||
                        page === "ellipsis-end"
                      ) {
                        return (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={`page-${page}`}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (onPageChange) onPageChange(page as number);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages && onPageChange)
                          onPageChange(currentPage + 1);
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>

            {openImageUpload && (
              <Dialog open={openImageUpload} onOpenChange={setOpenImageUpload}>
                <DialogTrigger asChild>{}</DialogTrigger>
                <DialogContent className="w-[70%]">
                  <DialogHeader>
                    <DialogTitle>Upload Image to Shipping Item</DialogTitle>
                    <DialogDescription className="hidden">{`Shipping Item Row ${
                      currentImageIndex + 1
                    }`}</DialogDescription>
                  </DialogHeader>

                  <ImageUploadDropzone
                    currentItemIndex={currentImageIndex}
                    onSaveImages={(files, index) => {
                      setShippingItems((prevState) => {
                        const updatedState = prevState.map((item, idx) => {
                          if (idx === index) {
                            const updatedItem = {
                              ...item,
                              images: [...(item.images || []), ...files],
                              imagesLoaded: true, // Mark as loaded when images are uploaded
                            };
                            return updatedItem;
                          }
                          return item;
                        });

                        return updatedState;
                      });
                      setOpenImageUpload(false);
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
          </div>
        </CardContent>
      </Card>
    );
  }
);

export default ShippingItemsTable;
