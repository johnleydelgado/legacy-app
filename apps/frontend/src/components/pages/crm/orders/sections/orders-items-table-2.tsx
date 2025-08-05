"use client";

import * as React from "react";

import {Card, CardContent, CardHeader, CardTitle} from "../../../../ui/card";
import {Button} from "../../../../ui/button";
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
    File,
} from "lucide-react";
import {Separator} from "../../../../ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../../../ui/table";
import {Label} from "../../../../ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../../ui/select";
import {useProductsCategories} from "../../../../../hooks/useProducts2";
import InfiniteProductSelect from "../../invoices/custom/InfiniteProductSelect";
import {Input} from "../../../../ui/input";
import {useYarns} from "../../../../../hooks/useYarns";
import {useTrims} from "../../../../../hooks/useTrims";
import {usePackaging} from "../../../../../hooks/usePackaging";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../../../ui/dialog";
import {ScrollArea, ScrollBar} from "../../../../ui/scroll-area";
import {Tooltip, TooltipContent, TooltipTrigger} from "../../../../ui/tooltip";
import ImageGallerySelect, {switchColor} from "../../../../custom/select/image-gallery-select";
import {Badge} from "../../../../ui/badge";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../../../ui/pagination";
import {TableOrdersItems} from "../types";
import ImageUploadDropzone, { ExtendedFile } from "./image-upload-dropzone";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";


const initialItemValue = {
    ordersItemsID: -1,
    orderID: -1,
    categoryID: -1,
    categoryName: "",
    productID: -1,
    itemNumber: "",
    itemName: "",
    itemDescription: "",
    images: [],
    imagesLoaded: false,
    packagingID: -1,
    packagingName: "",
    trimID: -1,
    trimName: "",
    yarnID: -1,
    yarnName: "",
    quantity: 0,
    unitPrice: 0,
    taxRate: 0.08,
    total: 0,
    actionCreate: false,
    actionModify: false,
    actionEdited: false,
    errorState: [],
    modifyList: [],
}

interface ComponentsProps {
    ordersItems: TableOrdersItems[];
    setOrdersItems: React.Dispatch<React.SetStateAction<TableOrdersItems[]>>;
    setModifyFlag: (tick: boolean) => void;
    setDeletedOrdersItems?: React.Dispatch<React.SetStateAction<number[]>>;
    totalItems?: number;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

const OrdersItemsTable2 = (
    {
        ordersItems,
        setOrdersItems,
        setModifyFlag,
        setDeletedOrdersItems,
        totalItems = 0,
        currentPage = 1,
        totalPages = 1,
        onPageChange = () => {},
    }: ComponentsProps) => {
    const [openImageUpload, setOpenImageUpload] = React.useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState<number>(-1);

    const tableRef = React.useRef<HTMLTableElement>(null);
    const [width, setWidth] = React.useState(0);

    const [fullscreenImage, setFullscreenImage] = React.useState<ExtendedFile | null>(null);
    const [openFullscreenDialog, setOpenFullscreenDialog] = React.useState<boolean>(false);

    React.useLayoutEffect(() => {
        const updateWidth = () => {
            if (tableRef.current) {
                setWidth(tableRef.current.offsetWidth - 45);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    const { data: dataProductsCategory } = useProductsCategories();
    const productsCategoryOptions = dataProductsCategory?.items || [];

    const { data: yarnsData, isLoading: yarnsLoading } = useYarns();
    const { data: trimsData, isLoading: trimsLoading } = useTrims();
    const { data: packagingData, isLoading: packagingLoading } = usePackaging();

    const handleAddingItems = () => {
        setOrdersItems(prevState => [
            ...prevState,
            {
                ...initialItemValue,
                actionCreate: true,
                actionModify: true
            }]);
    }

    const handleOnchangeText = (
        index: number,
        label: string,
        value: number | string | File | null,
    ) => {
        setModifyFlag(true);

        if(["productID",
            "itemDescription",
            "itemNumber",
            "total",
        ].includes(label)) {
            setOrdersItems(prevState => prevState.map((data, innerIndex) => {
                if (index === innerIndex) {
                    return {
                        ...data,
                        [label]: value,
                        actionEdited: true,
                    }
                }
                return data;
            }));
        }

        if (label === "categoryID" && typeof value === "string") {
            // region Change Category Data
            const categoryData = productsCategoryOptions.filter(
                (data) => data.pk_product_category_id === parseInt(value, 10)
            );

            if (categoryData.length > 0) {
                setOrdersItems(prevState => prevState.map((data, innerIndex) => {
                    if (index === innerIndex) {
                        return {
                            ...data,
                            categoryID: parseInt(value, 10),
                            categoryName: categoryData[0].category_name,
                            actionEdited: true,
                            modifyList: [
                                ...(data.modifyList || []),
                                `Change Product Category to ${categoryData[0].category_name}`
                            ],
                        }
                    }
                    return data;
                }));
            }
            // endregion
        } else if (label === "yarnID" && typeof value === "string") {
            // region Change Yarns Data
            const yarnsFiltered = yarnsData?.items?.filter(
                (data) => data.pk_yarn_id === parseInt(value, 10)
            ) || [];

            if (yarnsFiltered.length > 0) {
                setOrdersItems(prevState => prevState.map((data, innerIndex) => {
                    if (index === innerIndex) {
                        return {
                            ...data,
                            yarnID: parseInt(value, 10),
                            yarnName: `${yarnsFiltered[0].color_code} - ${yarnsFiltered[0].yarn_color}`,
                            actionEdited: true,
                            modifyList: [
                                ...(data.modifyList || []),
                                `Change Yarn to ${yarnsFiltered[0].color_code} - ${yarnsFiltered[0].yarn_color}`
                            ],
                        }
                    }
                    return data;
                }));
            }
            // endregion
        } else if (label === "trimID" && typeof value === "string") {
            // region Change Trim Data
            const trimsFiltered = trimsData?.items?.filter(
                (data) => data.pk_trim_id === parseInt(value, 10)
            ) || [];

            if (trimsFiltered.length > 0) {
                setOrdersItems(prevState => prevState.map((data, innerIndex) => {
                    if (index === innerIndex) {
                        return {
                            ...data,
                            trimID: parseInt(value, 10),
                            trimName: `${trimsFiltered[0].trim}`,
                            actionEdited: true,
                            modifyList: [
                                ...(data.modifyList || []),
                                `Change Trim to ${trimsFiltered[0].trim}`
                            ],
                        }
                    }
                    return data;
                }));
            }
            // endregion
        } else if (label === "packagingID" && typeof value === "string") {
            // region Change Packaging Data
            const packagingFiltered = packagingData?.items?.filter(
                (data) => data.pk_packaging_id === parseInt(value, 10)
            ) || [];

            if (packagingFiltered.length > 0) {
                setOrdersItems(prevState => prevState.map((data, innerIndex) => {
                    if (index === innerIndex) {
                        return {
                            ...data,
                            packagingID: parseInt(value, 10),
                            packagingName: `${packagingFiltered[0].packaging}`,
                            actionEdited: true,
                            modifyList: [
                                ...(data.modifyList || []),
                                `Change Trim to ${packagingFiltered[0].packaging}`
                            ],
                        }
                    }
                    return data;
                }));
            }
            // endregion
        } else if(label === "quantity") {
            // region Change Quantity
            const quantityValue = typeof value === 'number' ? value :
                (typeof value === 'string' ? parseInt(value, 10) || 0 : 0);

            setOrdersItems(prevState => prevState.map((data, innerIndex) => {
                if (index === innerIndex) {
                    return {
                        ...data,
                        quantity: quantityValue, // Use the explicit property name instead of computed property
                        actionEdited: true,
                        // modifyList: [...(data.modifyList || []), `Change Quantity to ${quantityValue}`],
                    }
                }
                return data;
            }));
            // endregion
        } else if(label === "unitPrice") {
            // region Change Unit Price
            const priceValue = typeof value === 'number' ? value :
                (typeof value === 'string' ? parseFloat(value) || 0 : 0);

            setOrdersItems(prevState => prevState.map((data, innerIndex) => {
                if (index === innerIndex) {
                    return {
                        ...data,
                        unitPrice: priceValue, // Use the explicit property name instead of computed property
                        actionEdited: true,
                        // modifyList: [...(data.modifyList || []), `Change Unit Price to ${priceValue}`],
                    }
                }
                return data;
            }));
            // endregion
        } else if("itemName" === label) {
            // region Change Item Name
            const nameValue = typeof value === 'string' ? value :
                (value !== null && value !== undefined ? String(value) : "");

            setOrdersItems(prevState => prevState.map((data, innerIndex) => {
                if (index === innerIndex) {
                    return {
                        ...data,
                        itemName: nameValue, // Use the explicit property name instead of computed property
                        actionEdited: true,
                        // modifyList: [...(data.modifyList || []), `Change Item Name to ${nameValue}`],
                    }
                }
                return data;
            }));
            // endregion
        }
    }

    const calculateTotal = (unitPrice: number = 0, quantity: number = 0, taxRate: number = 0) => {
        return (unitPrice * quantity) * (1 + taxRate) ;
    }

    const handleSaveClick = (index: number, data: TableOrdersItems) => {
        setOrdersItems(prevState => prevState.map(
            (innerData, innerIndex) => {
                if (innerIndex === index) {
                    let errorState = [];

                    if(data.categoryID === -1) errorState.push("Selecting Category is required");
                    if(data.productID === -1) errorState.push("Selecting Product is required");
                    if(data.itemDescription.length <= 0) errorState.push("Entering Item Description is required");
                    if(data.quantity <= 0) errorState.push("Entering Quantity is required");
                    if(data.unitPrice <= 0) errorState.push("Entering Unit Price is required");
                    if(data.yarnID <= 0) errorState.push("Selecting Yarn is required");
                    if(data.trimID <= 0) errorState.push("Selecting Trim is required");
                    if(data.packagingID <= 0) errorState.push("Selecting Packaging is required");

                    if (errorState.length > 0)
                        return { ...innerData, errorState }

                    // return { ...innerData, errorState, actionModify: false, actionCreate: false }
                    return { ...innerData, errorState, actionModify: false }
                }

                return innerData;
            }));
    }

    const handleEditClick = (index: number) => {
        setOrdersItems(prevState => prevState.map(
            (data, innerIndex) => {
                if (innerIndex === index) {
                    return { ...data, actionModify: true }
                }

                return data;
            }));
    }

    const handleImageClick = (image: ExtendedFile) => {
        setFullscreenImage(image);
        setOpenFullscreenDialog(true);
    }

    // Generate page numbers to display
    const generatePagination = (currentPage: number, totalPages: number) => {
        // Always show first and last page
        // Show ellipsis when needed
        // Show 2 pages before and after current page

        if (totalPages <= 7) {
            // If 7 or fewer pages, show all
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // More than 7 pages, we need to show ellipsis
        const pages = [];

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            // Show ellipsis after first page
            pages.push('ellipsis-start');
        }

        // Calculate range around current page
        const rangeStart = Math.max(2, currentPage - 1);
        const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

        // Add range pages
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            // Show ellipsis before last page
            pages.push('ellipsis-end');
        }

        // Always show last page
        pages.push(totalPages);

        return pages;
    };

    // Calculate displayed items range
    const itemsPerPage = 10; // Fixed at 10 items per page
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <Card>
            <CardHeader className="py-2 px-6 flex flex-row justify-between items-center w-full">
                <CardTitle className="text-sm font-semibold text-gray-700">Orders Items</CardTitle>
                <Button
                    className="flex flex-row gap-x-2 cursor-pointer bg-blue-500 rounded-lg"
                    onClick={handleAddingItems}
                >
                    <Plus /> Add Orders Item
                </Button>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent>
                <Table ref={tableRef}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-2 text-xs">Category</TableHead>
                            <TableHead className="p-2 text-xs">Item #</TableHead>
                            <TableHead className="p-2 text-xs">Description</TableHead>
                            <TableHead className="p-2 text-xs">Yarns</TableHead>
                            <TableHead className="p-2 text-xs">Package</TableHead>
                            <TableHead className="p-2 text-xs">Trims</TableHead>
                            <TableHead className="p-2 text-xs text-center">Quantity</TableHead>
                            <TableHead className="p-2 text-xs text-center">Unit Price</TableHead>
                            <TableHead className="p-2 text-xs text-center">Total</TableHead>
                            <TableHead className="p-2 text-xs">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        { ordersItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-[300px]">
                                    <div className="w-full h-full flex flex-col gap-y-4 justify-center items-center">
                                        <Package size={40} color='gray' />
                                        <p>No Items added to this orders yet</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : ( ordersItems.map((data, index) => {
                                if (data.actionModify) {
                                    return (
                                        <TableRow key={`edit-${index}`}>
                                            <TableCell colSpan={10} className="min-h-[100px]">
                                                <div className="w-full flex flex-row flex-wrap gap-2 p-1 w-full">
                                                    <div className="flex flex-row flex-wrap gap-1 w-[35%] grow">
                                                        <div className="flex flex-col gap-1 w-[35%] max-w-[120px] grow">
                                                            {/* region Select Category */}
                                                            <Label className="text-xs font-light">
                                                                Select Category:
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    (data.categoryID && data.categoryID > 0) ?
                                                                        data.categoryID?.toString() : ""
                                                                }
                                                                onValueChange={(e) => {
                                                                    handleOnchangeText(index, "categoryID", e);
                                                                    handleOnchangeText(index, "productID", -1);
                                                                    handleOnchangeText(index, "itemName", "");
                                                                    handleOnchangeText(index, "itemDescription", "");
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
                                                                    name: data.itemName,
                                                                    index: index,
                                                                    sku: data.itemNumber,
                                                                }}
                                                                index={index}
                                                                onValueChange={(value) => {
                                                                    handleOnchangeText(value.index, "productID", value.id);
                                                                    handleOnchangeText(value.index, "itemNumber", `#${index}-${value.id}`);
                                                                    handleOnchangeText(value.index, "itemName", value.name);
                                                                    handleOnchangeText(
                                                                        value.index,
                                                                        "itemDescription",
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
                                                            <Label
                                                                htmlFor="categoryID"
                                                                className="text-xs font-light"
                                                            >
                                                                Description:
                                                            </Label>
                                                            <Input
                                                                value={data.itemDescription}
                                                                style={{ fontSize: '12px' }}
                                                                placeholder=""
                                                                onChange={(e) =>
                                                                    handleOnchangeText(index, 'itemDescription', e.target.value)
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
                                                                value={data.yarnID?.toString() || ""}
                                                                onValueChange={(e) =>
                                                                    handleOnchangeText(index, "yarnID", e)
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full text-xs">
                                                                    <SelectValue placeholder="" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {yarnsData?.items?.map((innerData, innerIndex) => {
                                                                        return (
                                                                            <SelectItem
                                                                                className="text-xs"
                                                                                key={innerIndex}
                                                                                value={innerData.pk_yarn_id.toString()}
                                                                            >
                                                                                {`${innerData.color_code} - ${innerData.yarn_color}`}
                                                                            </SelectItem>
                                                                        );
                                                                    }) || []}
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
                                                                value={data.trimID?.toString() || ""}
                                                                onValueChange={(e) =>
                                                                    handleOnchangeText(index, "trimID", e)
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full text-xs">
                                                                    <SelectValue placeholder="" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {trimsData?.items?.map((innerData, innerIndex) => {
                                                                        return (
                                                                            <SelectItem
                                                                                className="text-xs"
                                                                                key={innerIndex}
                                                                                value={innerData.pk_trim_id.toString()}
                                                                            >
                                                                                {`${innerData.trim}`}
                                                                            </SelectItem>
                                                                        );
                                                                    }) || []}
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
                                                                value={data.packagingID?.toString() || ""}
                                                                onValueChange={(e) =>
                                                                    handleOnchangeText(index, "packagingID", e)
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full text-xs">
                                                                    <SelectValue placeholder="" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {packagingData?.items?.map((innerData, innerIndex) => {
                                                                        return (
                                                                            <SelectItem
                                                                                className="text-xs"
                                                                                key={innerIndex}
                                                                                value={innerData.pk_packaging_id.toString()}
                                                                            >
                                                                                {`${innerData.packaging}`}
                                                                            </SelectItem>
                                                                        );
                                                                    }) || []}
                                                                </SelectContent>
                                                            </Select>
                                                            {/*endregion*/}
                                                        </div>
                                                        <div className="flex flex-col gap-1 w-[30%] max-w-[100px]">
                                                            {/* region Enter Quantity */}
                                                            <Label className="text-xs font-light">Quantity:</Label>
                                                            <Input type="number" value={data.quantity}
                                                                   style={{ fontSize: '12px' }} placeholder=""
                                                                   onChange={(e) => {
                                                                       handleOnchangeText(index, 'quantity', parseInt(e.target.value, 10))
                                                                       handleOnchangeText(
                                                                           index,
                                                                           'total',
                                                                           calculateTotal(
                                                                               data.unitPrice,
                                                                               parseInt(e.target.value, 10),
                                                                               data.taxRate
                                                                           )
                                                                       )
                                                                   }}
                                                            />
                                                            {/* endregion */}
                                                        </div>
                                                        <div className="flex flex-col gap-1 w-[30%] max-w-[100px]">
                                                            {/* region Enter Unit Price */}
                                                            <Label className="text-xs font-light">Unit Price:</Label>
                                                            <Input type="number" value={data.unitPrice}
                                                                   style={{ fontSize: '12px' }} placeholder=""
                                                                   onChange={(e) => {
                                                                       handleOnchangeText(index, 'unitPrice', parseFloat(e.target.value))
                                                                       handleOnchangeText(
                                                                           index, 'total',
                                                                           calculateTotal(parseFloat(e.target.value), data.quantity, data.taxRate)
                                                                       )
                                                                   }}
                                                            />
                                                            {/* endregion */}
                                                        </div>
                                                        <div className="flex flex-row justify-end gap-1 p-1 w-[30%] grow h-[45px] mt-[13px]">
                                                            <div className="flex flex-row gap-1 border border-solid py-2 px-4 bg-gray-300 rounded-lg mr-4">
                                                                <p className="text-sm font-light">Total:</p>
                                                                <p className="text-sm font-semibold">{`$${data.total.toLocaleString('en-US', {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                })}`}</p>
                                                            </div>
                                                            <Button className="bg-green-500 text-white cursor-pointer text-sm w-[100px]"
                                                                    onClick={() => handleSaveClick(index, data)}
                                                            ><Save />Save</Button>
                                                            <Button className="bg-red-500 text-white cursor-pointer text-sm w-[100px]"
                                                                    onClick={() => {
                                                                        if (data.actionCreate && data.actionModify) {
                                                                            setOrdersItems(
                                                                                prevState => prevState.filter(
                                                                                    (_, innerIndex) => innerIndex !== index)
                                                                            )
                                                                        } else if (!data.actionCreate && data.actionModify) {
                                                                            setOrdersItems(
                                                                                prevState => prevState.map((innerData, innerIndex) => {
                                                                                    if (index === innerIndex)
                                                                                        return { ...innerData, actionModify: false };

                                                                                    return innerData;
                                                                                })
                                                                            )
                                                                        }
                                                                    }}
                                                            ><SquareX />Cancel</Button>
                                                        </div>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="w-full">
                                                        <ScrollArea className="max-h-[150px]" style={{ width }}>
                                                            <div className="flex flex-row flex-nowrap gap-1 p-1 items-center">
                                                                {data.images && data.images.map(
                                                                    (innerData, innerIndex) => {
                                                                        if (innerData.preview || innerData.url) {
                                                                            return (
                                                                                <div key={innerIndex} className="relative flex flex-col gap-y-2">
                                                                                    <Badge className={`lowercase text-xs font-light absolute top-0 l-0 z-10 ${switchColor(innerData.typeImage || innerData.type)}`}>
                                                                                        {innerData.typeImage}
                                                                                    </Badge>
                                                                                    <div className="relative size-[70px] flex items-center justify-center border rounded-lg">
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            className="absolute top-0 right-0 p-0 h-6 w-6 bg-white/80 hover:bg-white rounded-full z-10 cursor-pointer"
                                                                                            onClick={() => {
                                                                                                setOrdersItems(prevState => prevState.map((item, idx) => {
                                                                                                    if (idx === index) {
                                                                                                        return {
                                                                                                            ...item,
                                                                                                            images: item.images && item.images.filter((_, imgIdx) => imgIdx !== innerIndex),
                                                                                                            actionEdited: true
                                                                                                        };
                                                                                                    }
                                                                                                    return item;
                                                                                                }));
                                                                                                setModifyFlag(true);
                                                                                            }}
                                                                                        >
                                                                                            <X size={14} className="text-gray-700" />
                                                                                        </Button>
                                                                                        <img
                                                                                            src={innerData.preview || innerData.url}
                                                                                            alt={innerData.name}
                                                                                            className="h-full w-full object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                                                            onClick={() => handleImageClick(innerData)}
                                                                                            onError={(e) => {
                                                                                                const target = e.target as HTMLImageElement;
                                                                                                target.style.display = "none";
                                                                                                const parent = target.parentNode as HTMLElement;
                                                                                                const fallback = document.createElement("div");
                                                                                                fallback.className = "text-xs text-gray-500";
                                                                                                fallback.innerText = "No preview";
                                                                                                parent.appendChild(fallback);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <div key={innerIndex} className="h-full w-24 flex items-center justify-center border rounded">
                                                                                    <div className="text-xs text-gray-500">No preview</div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })}
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Button variant="outline" className="cursor-pointer"
                                                                                onClick={() => {
                                                                                    setOpenImageUpload(true);
                                                                                    setCurrentImageIndex(index);
                                                                                }}>
                                                                            <ImagePlus size={30} className="text-blue-500"/>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Upload Image</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                            <ScrollBar orientation="horizontal" />
                                                        </ScrollArea>
                                                    </div>
                                                    {data.errorState && data.errorState.length > 0 &&
                                                    <div className="w-full flex flex-col gap-2 p-4 w-1/2
                                                             border border-solid border-red-700 bg-red-50 rounded-lg text-red-700">
                                                        {data.errorState.map((innerData, innerIndex) =>
                                                            <div className="flex flex-row items-center gap-2">
                                                                <Asterisk size={20} className="text-red-700" />
                                                                <p className="text-xs font-semibold tracking-wide" key={innerIndex}>{innerData}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    }
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                                return (
                                    <React.Fragment key={`item-${index}`}>
                                        <TableRow>
                                            <TableCell className="p-2 text-xs">{`${data.categoryName}`}</TableCell>
                                            <TableCell className="p-2 text-xs">{`#${data.itemNumber}`}</TableCell>
                                            <TableCell className="p-2 text-xs">{`${data.itemDescription}`}</TableCell>
                                            <TableCell className="p-2 text-xs">{`${data.yarnName}`}</TableCell>
                                            <TableCell className="p-2 text-xs">{`${data.packagingName}`}</TableCell>
                                            <TableCell className="p-2 text-xs">{`${data.trimName}`}</TableCell>
                                            <TableCell className="p-2 text-xs text-center">{`${data.quantity}`}</TableCell>
                                            <TableCell className="p-2 text-xs text-center">{`${data.unitPrice.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}`}</TableCell>
                                            <TableCell className="p-2 text-xs text-center">{`${data.total.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}`}</TableCell>
                                            <TableCell className="p-2 text-xs">
                                                <Button className="cursor-pointer" variant="ghost" style={{ paddingInline: '5px' }}
                                                        onClick={() => handleEditClick(index)}
                                                >
                                                    <SquarePen size={20} className="text-blue-500" />
                                                </Button>
                                                <Button className="cursor-pointer" variant="ghost" style={{ paddingInline: '5px' }}
                                                        onClick={() => {
                                                            if (setDeletedOrdersItems) {
                                                                setDeletedOrdersItems(prevState => [...prevState, data.ordersItemsID])
                                                            }
                                                            setOrdersItems(
                                                                prevState => prevState.filter(
                                                                    (_, innerIndex) => innerIndex !== index)
                                                            );
                                                            setModifyFlag(true);
                                                        }}
                                                >
                                                    <Trash2 size={20} className="text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={10} className="min-h-[100px]">
                                                <div className="w-full">
                                                    <ScrollArea className="max-h-[150px]" style={{ width }}>
                                                        <div className="flex flex-row flex-nowrap gap-1 p-1 items-center">
                                                            {data.images && data.images.map(
                                                                (innerData, innerIndex) => {
                                                                    if (innerData.preview || innerData.url) {
                                                                        return (
                                                                            <div key={innerIndex} className="relative flex flex-col gap-y-2">
                                                                                <Badge className={`lowercase text-xs font-light absolute top-0 l-0 z-10 ${switchColor(innerData.typeImage || innerData.type)}`}>
                                                                                    {innerData.typeImage}
                                                                                </Badge>
                                                                                <div className="relative size-[70px] flex items-center justify-center border rounded-lg">
                                                                                    <img
                                                                                        src={innerData.preview || innerData.url}
                                                                                        alt={innerData.name}
                                                                                        className="h-full w-full object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                                                        onClick={() => handleImageClick(innerData)}    
                                                                                        onError={(e) => {
                                                                                            const target = e.target as HTMLImageElement;
                                                                                            target.style.display = "none";
                                                                                            const parent = target.parentNode as HTMLElement;
                                                                                            const fallback = document.createElement("div");
                                                                                            fallback.className = "text-xs text-gray-500";
                                                                                            fallback.innerText = "No preview";
                                                                                            parent.appendChild(fallback);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <div key={innerIndex} className="h-full w-24 flex items-center justify-center border rounded">
                                                                                <div className="text-xs text-gray-500">No preview</div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                })}
                                                        </div>
                                                        <ScrollBar orientation="horizontal" />
                                                    </ScrollArea>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                )
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
                                        if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
                                    }}
                                    aria-disabled={currentPage === 1}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            {generatePagination(currentPage || 0, totalPages || 0).map((page, i) => {
                                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
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
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages && onPageChange)
                                            onPageChange(currentPage + 1);
                                    }}
                                    aria-disabled={currentPage === totalPages}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>

                {openImageUpload &&
                <Dialog open={openImageUpload} onOpenChange={setOpenImageUpload}>
                    <DialogTrigger asChild>{}</DialogTrigger>
                    <DialogContent className="w-[70%]">
                        <DialogHeader>
                            <DialogTitle>Upload Image to Quote Item</DialogTitle>
                            <DialogDescription className="hidden">{`Quote Item Row ${currentImageIndex + 1}`}</DialogDescription>
                        </DialogHeader>

                        <ImageUploadDropzone
                            currentItemIndex={currentImageIndex}
                            onSaveImages={(files, index) => {
                                setOrdersItems(prevState => prevState.map((item, idx) => {
                                    if (idx === index) {
                                        return {
                                            ...item,
                                            images: [...(item.images || []), ...files]
                                        };
                                    }
                                    return item;
                                }));
                                setOpenImageUpload(false);
                            }}
                        />

                        <DialogFooter>{}</DialogFooter>
                    </DialogContent>
                </Dialog>
                }
                {/* Fullscreen Image Dialog */}
                {openFullscreenDialog && 
                    <AlertDialog open={openFullscreenDialog} onOpenChange={setOpenFullscreenDialog}>
                        <AlertDialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-none shadow-none">
                            <div className="relative w-full h-full flex items-center justify-center">
                                {fullscreenImage && (
                                    <div className="relative max-w-full max-h-full">
                                        <img src={fullscreenImage.preview || fullscreenImage.url}
                                             alt={fullscreenImage.name}
                                             className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                             onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = "none";
                                                const parent = target.parentNode as HTMLElement;
                                                const fallback = document.createElement("div");
                                                fallback.className = "text-lg text-white bg-gray-800 p-8 rounded-lg";
                                                fallback.innerText = "Image not available";
                                                parent.appendChild(fallback);
                                            }}
                                        />
                                        <div className="absolute top-4 right-4">
                                            <Button variant="ghost"
                                                    size="sm"
                                                    className="bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
                                                    onClick={() => setOpenFullscreenDialog(false)}
                                            >
                                                <X size={20} />
                                            </Button>
                                        </div>
                                        {/* {fullscreenImage.name && (
                                            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
                                                <p className="text-sm font-medium">{fullscreenImage.name}</p>
                                            </div>
                                        )} */}
                                    </div>
                                )}
                            </div>
                        </AlertDialogContent>
                    </AlertDialog>
                }
            </CardContent>
        </Card>
    );
}

export default OrdersItemsTable2;
