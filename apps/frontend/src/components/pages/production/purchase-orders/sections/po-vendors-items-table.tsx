"use client";

import * as React from "react";

import {Card, CardContent, CardHeader, CardTitle} from "../../../../ui/card";
import {Button} from "../../../../ui/button";
import {
    Asterisk,
    EllipsisVertical,
    ImagePlus,
    Package,
    Plus,
    Save,
    SquarePen,
    SquareX,
    Trash2,
    X,
} from "lucide-react";
import {Separator} from "../../../../ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../../../ui/table";
import {Label} from "../../../../ui/label";
import {useProductsCategories} from "../../../../../hooks/useProducts2";
import {Input} from "../../../../ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../../../ui/dialog";
import {ScrollArea, ScrollBar} from "../../../../ui/scroll-area";
import {Tooltip, TooltipContent, TooltipTrigger} from "../../../../ui/tooltip";
import {switchColor} from "../../../../custom/select/image-gallery-select";
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
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import ImageUploadDropzone, { ExtendedFile } from "../sections/image-upload-dropzone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InfiniteProductSelect from "@/components/pages/crm/invoices/custom/InfiniteProductSelect";
import { Textarea } from "@/components/ui/textarea";
import { useImageGalleryByItemEndpoint } from "@/hooks/useImageGallery";

export interface ItemSpecification {
    key: string;
    value: string;
}

export interface TablePOVendorsItems {
    purchaseOrderItemID: number;
    orderItemID?: number;
    purchaseOrderID: number;
    categoryID: number;
    categoryName: string;
    productID: number;
    itemNumber: string;
    itemSku: string;
    itemName: string;
    itemDescription: string;
    itemSpecifications?: ItemSpecification[];
    itemNotes: string;
    packagingInstructions: string;
    quantity: number;
    unitPrice: number;
    total: number;
    rate: number;
    images: ExtendedFile[];
    actionCreate: boolean;
    actionModify: boolean;
    actionEdited: boolean;
    errorState: string[];
    modifyList?: string[];
    imagesLoaded?: boolean;
}

const initialItemValue = {
    purchaseOrderItemID: 0,
    purchaseOrderID: 0,
    categoryID: -1,
    categoryName: "",
    productID: -1,
    itemNumber: "",
    itemSku: "",
    itemName: "",
    itemDescription: "",
    itemSpecifications: [],
    itemNotes: "",
    packagingInstructions: "",
    quantity: 0,
    unitPrice: 0,
    total: 0,
    rate: 0,
    images: [],
    actionCreate: false,
    actionModify: false,
    actionEdited: false,
    errorState: [],
    modifyList: [],
}

interface ComponentsProps {
    poVendorsItems: TablePOVendorsItems[];
    setPoVendorsItems: React.Dispatch<React.SetStateAction<TablePOVendorsItems[]>>;
    setModifyFlag: (tick: boolean) => void;
    setDeletedPoItems?: React.Dispatch<React.SetStateAction<number[]>>;
    totalItems?: number;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

const POVendorsItemsTable = (
    {
        poVendorsItems,
        setPoVendorsItems,
        setModifyFlag,
        setDeletedPoItems,
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

    const handleAddingItems = () => {
        setPoVendorsItems(prevState => [
            ...prevState,
            {
                ...initialItemValue,
                actionCreate: true,
                actionModify: true
            }
        ]);
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
            "itemSku",
            "itemSpecifications",
            "itemNotes",
            "total",
        ].includes(label)) {
            setPoVendorsItems(prevState => prevState.map((data, innerIndex) => {
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
                setPoVendorsItems(prevState => prevState.map((data, innerIndex) => {
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
        } else if(label === "quantity") {
            // region Change Quantity
            const quantityValue = typeof value === 'number' ? value :
                (typeof value === 'string' ? parseInt(value, 10) || 0 : 0);

            setPoVendorsItems(prevState => prevState.map((data, innerIndex) => {
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

            setPoVendorsItems(prevState => prevState.map((data, innerIndex) => {
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

            setPoVendorsItems(prevState => prevState.map((data, innerIndex) => {
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

    const handleSaveClick = (index: number, data: TablePOVendorsItems) => {
        setPoVendorsItems(prevState => prevState.map(
            (innerData, innerIndex) => {
                if (innerIndex === index) {
                    let errorState = [];

                    if(data.categoryID === -1) errorState.push("Selecting Category is required");
                    if(data.productID === -1) errorState.push("Selecting Product is required");
                    if(data.itemDescription.length <= 0) errorState.push("Entering Item Description is required");
                    if(data.quantity <= 0) errorState.push("Entering Quantity is required");
                    if(data.unitPrice <= 0) errorState.push("Entering Unit Price is required");
                    
                    if (errorState.length > 0)
                        return { ...innerData, errorState }

                    // return { ...innerData, errorState, actionModify: false, actionCreate: false }
                    return { ...innerData, errorState, actionModify: false }
                }

                return innerData;
            }));
    }

    const handleEditClick = (index: number) => {
        setPoVendorsItems(prevState => prevState.map(
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

    const handleKeyValueChange = (itemIndex: number, kvIndex: number, field: 'key' | 'value', value: string) => {
        setPoVendorsItems(prevState => prevState.map((item, idx) => {
            if (idx === itemIndex) {
                if (!item.itemSpecifications) {
                    item.itemSpecifications = [];
                }
                item.itemSpecifications[kvIndex] = {
                    ...item.itemSpecifications[kvIndex],
                    [field]: value
                };
            }
            return item;
        }));
    };

    const addKeyValuePair = (itemIndex: number) => {
        setPoVendorsItems(prevState => prevState.map((item, idx) => {
            if (idx === itemIndex) {
                return {
                    ...item,
                    itemSpecifications: [...(item.itemSpecifications || []), { key: '', value: '' }]
                };
            }
            return item;
        }));
    };

    const removeKeyValuePair = (itemIndex: number, kvIndex: number) => {
        setPoVendorsItems(prevState => prevState.map((item, idx) => {
            if (idx === itemIndex && item.itemSpecifications) {
                item.itemSpecifications =
                    item.itemSpecifications.filter((_, i) => i !== kvIndex);
            }
            return item;
        }));
    };

    return (
        <Card className="w-full p-2" style={{gap: '5px'}}>
            <CardHeader className="py-2 flex flex-row justify-between items-center w-full">
                <CardTitle className="text-sm font-semibold text-gray-700">Purchase Orders Items</CardTitle>
                <Button
                    className="flex flex-row gap-x-2 cursor-pointer bg-blue-500 hover:bg-blue-600 rounded-lg text-xs"
                    onClick={handleAddingItems}
                >
                    <Plus /> Add Purchase Orders Item
                </Button>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent className="px-0">
                <Table ref={tableRef}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-1 text-xs">Category</TableHead>
                            <TableHead className="p-1 text-xs">Item # / SKU</TableHead>
                            <TableHead className="p-1 text-xs">Item Name</TableHead>
                            <TableHead className="p-1 text-xs">Item Specifications</TableHead>
                            <TableHead className="p-1 text-xs">Item Notes</TableHead>
                            <TableHead className="p-1 text-xs text-center">Quantity</TableHead>
                            <TableHead className="p-1 text-xs text-center">Unit Price</TableHead>
                            <TableHead className="p-1 text-xs text-center">Total</TableHead>
                            <TableHead className="p-1 text-xs">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        { poVendorsItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-[300px]">
                                    <div className="w-full h-full flex flex-col gap-y-4 justify-center items-center">
                                        <Package size={40} color='gray' />
                                        <p>No Items added to this orders yet</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : ( poVendorsItems.map((data, index) => {
                                if (data.actionModify) {
                                    return (
                                        <TableRow key={`edit-${index}`}>
                                            <TableCell colSpan={10} className="min-h-[100px]">
                                                <div className="w-full flex flex-row flex-wrap gap-2 p-1 w-full">
                                                    <div className="flex flex-row flex-wrap gap-1 w-full">
                                                        {/* region Select Category */}
                                                        <div className="flex flex-col gap-1 w-[10%] max-w-[150px] grow">
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
                                                                    handleOnchangeText(index, "itemSku", "");
                                                                    handleOnchangeText(index, "total", 0);
                                                                    handleOnchangeText(index, "unitPrice", 0);
                                                                    handleOnchangeText(index, "quantity", 0);
                                                                    handleOnchangeText(index, "itemDescription", "");
                                                                }}
                                                            >
                                                                <SelectTrigger className="text-xs w-full [&_svg]:bg-transparent [&_svg]:text-gray-500">
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
                                                        </div>
                                                        {/* endregion */}
                                                        {/* region Select Product */}
                                                        <div className="flex flex-col gap-1 w-[30%] grow max-w-[320px]">
                                                            <Label className="text-xs font-light">
                                                                Select Item Product:
                                                            </Label>
                                                            <InfiniteProductSelect
                                                                categoryId={data.categoryID || -1}
                                                                value={{
                                                                    id: data.productID,
                                                                    name: data.itemName,
                                                                    index: index,
                                                                    sku: data.itemSku,
                                                                }}
                                                                index={index}
                                                                onValueChange={(value) => {
                                                                    handleOnchangeText(value.index, "productID", value.id);
                                                                    handleOnchangeText(value.index, "itemNumber", `#${index}-${value.id}`);
                                                                    handleOnchangeText(value.index, "itemName", value.name);
                                                                    handleOnchangeText(value.index, "itemSku", value?.sku || "");
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
                                                        </div>
                                                        {/* endregion */}
                                                        {/* region Edit Product SKU */}
                                                        <div className="flex flex-col gap-1 w-[30%] grow max-w-[320px]">
                                                            <Label className="text-xs font-light">
                                                                Item SKU:
                                                            </Label>
                                                            <Input
                                                                value={data.itemSku}
                                                                style={{ fontSize: '12px' }}
                                                                placeholder=""
                                                                onChange={(e) =>
                                                                    handleOnchangeText(index, 'itemSku', e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                        {/* endregion */}        
                                                        {/* region Edit Item Name */}
                                                        <div className="flex flex-col gap-1 w-[30%] grow max-w-[320px]">
                                                            <Label
                                                                className="text-xs font-light"
                                                            >
                                                                Item Name:
                                                            </Label>
                                                            <Input
                                                                value={data.itemName}
                                                                style={{ fontSize: '12px' }}
                                                                placeholder=""
                                                                onChange={(e) =>{
                                                                    handleOnchangeText(index, 'itemName', e.target.value);
                                                                    handleOnchangeText(index, 'itemDescription', e.target.value);
                                                                }}
                                                            />
                                                        </div>
                                                        {/* endregion */}
                                                        {/* region Edit Specifications */}
                                                        <div className="flex flex-col gap-1 w-[30%] grow max-w-[300px]">
                                                            <Label className="text-xs font-light">Specifications:</Label>
                                                            <div className="space-y-1 border border-gray-200 rounded-lg p-2 bg-gray-50 min-height-[64px]">
                                                                {(data.itemSpecifications || [{ key: '', value: '' }]).map((kvPair, kvIndex) => (
                                                                    <div key={kvIndex} className="flex gap-1 items-center">
                                                                        <Input
                                                                            value={kvPair.key}
                                                                            style={{ fontSize: '12px', paddingLeft: '5px' }}
                                                                            placeholder="Attribute"
                                                                            className="flex-1"
                                                                            onChange={(e) => handleKeyValueChange(index, kvIndex, 'key', e.target.value)}
                                                                        />
                                                                        <EllipsisVertical className="h-4 w-4" />
                                                                        <Input
                                                                            value={kvPair.value}
                                                                            style={{ fontSize: '12px', paddingLeft: '2px' }}
                                                                            placeholder="Value/Options"
                                                                            className="flex-1"
                                                                            onChange={(e) => handleKeyValueChange(index, kvIndex, 'value', e.target.value)}
                                                                        />
                                                                        {(data.itemSpecifications || []).length > 0 && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="px-2 cursor-pointer"
                                                                                onClick={() => removeKeyValuePair(index, kvIndex)}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                <div className="flex flex-row gap-1 items-center justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="cursor-pointer ml-auto"
                                                                        onClick={() => addKeyValuePair(index)}
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* endregion */}
                                                        {/* region Edit Notes */}
                                                        <div className="flex flex-col gap-1 w-[30%] grow max-w-[300px]">
                                                            <Label
                                                                className="text-xs font-light"
                                                            >
                                                                Items Notes:
                                                            </Label>
                                                            <Textarea
                                                                value={data.itemNotes}
                                                                style={{ fontSize: '12px' }}
                                                                placeholder=""
                                                                rows={3}
                                                                onChange={(e) =>
                                                                    handleOnchangeText(index, 'itemNotes', e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                        {/* endregion */}
                                                        {/* region Enter Quantity */}
                                                        <div className="flex flex-col gap-1 w-[10%] max-w-[100px]">
                                                            <Label className="text-xs font-light">Quantity:</Label>
                                                            <Input type="number" 
                                                                value={data.quantity}
                                                                style={{ fontSize: '12px' }}  
                                                                placeholder="" 
                                                                onChange={(e) => {
                                                                    handleOnchangeText(index, 'quantity', parseInt(e.target.value, 10))
                                                                    handleOnchangeText(
                                                                        index,  
                                                                        'total', 
                                                                        calculateTotal(
                                                                        data.unitPrice, 
                                                                        parseInt(e.target.value, 10), 
                                                                        0.08
                                                                        )
                                                                    )
                                                                }}
                                                            />
                                                        </div>
                                                        {/* endregion */}
                                                        {/* region Enter Unit Price */}
                                                        <div className="flex flex-col gap-1 w-[10%] max-w-[100px]">
                                                            <Label className="text-xs font-light">Unit Price:</Label>
                                                            <Input type="number" 
                                                                   value={data.unitPrice}
                                                                   style={{ fontSize: '12px' }} 
                                                                   placeholder=""
                                                                   onChange={(e) => {
                                                                     handleOnchangeText(  
                                                                       index, 
                                                                       'unitPrice', 
                                                                       parseFloat(e.target.value)
                                                                     )
                                                                     handleOnchangeText(
                                                                       index, 
                                                                       'total',
                                                                       calculateTotal(
                                                                         parseFloat(e.target.value), 
                                                                         data.quantity, 
                                                                         0.08
                                                                       )
                                                                    )
                                                                   }}
                                                            />
                                                        </div>
                                                        {/* endregion */}
                                                        {/* region Display Total */}
                                                        <div className="flex flex-row gap-1 border border-solid py-2 px-4 bg-gray-300 rounded-lg mr-2 h-[38px] mt-5">
                                                            <p className="text-sm font-light">Total:</p>
                                                            <p className="text-sm font-semibold">{`$${ data.total ? data.total.toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                                }) : 0}`}
                                                            </p>
                                                        </div>
                                                        {/* endregion */}
                                                        {/* region Action Buttons */}
                                                        <div className="flex flex-row justify-end gap-1 p-1 w-[20%] grow">
                                                            <Button className="bg-green-500 text-white cursor-pointer text-sm w-[100px]"
                                                                    onClick={() => handleSaveClick(index, data)}
                                                            ><Save />Save</Button>
                                                            <Button className="bg-red-500 text-white cursor-pointer text-sm w-[100px]"
                                                                    onClick={() => {
                                                                        if (data.actionCreate && data.actionModify) {
                                                                            setPoVendorsItems(
                                                                                prevState => prevState.filter(
                                                                                    (_, innerIndex) => innerIndex !== index)
                                                                            )
                                                                        } else if (!data.actionCreate && data.actionModify) {
                                                                            setPoVendorsItems(
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
                                                        {/* endregion */}
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
                                                                                                setPoVendorsItems(prevState => prevState.map((item, idx) => {
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
                                            <TableCell className="p-1 text-xs w-[100px] whitespace-break-spaces">{`${data.categoryName}`}</TableCell>
                                            <TableCell className="p-1 text-xs w-[200px] whitespace-break-spaces">{`${data.itemSku}`}</TableCell>
                                            <TableCell className="p-1 text-xs w-[200px] whitespace-break-spaces">{`${data.itemName}`}</TableCell>
                                            <TableCell className="p-1 min-w-[50px] space-y-0">
                                                {data.itemSpecifications ? (
                                                    data.itemSpecifications.map((spec, index) => (
                                                        <div key={index}>
                                                            <p className="text-xs">{`${spec.key}: ${spec.value}`}</p>
                                                        </div>
                                                    ))
                                                ) : <p className="text-xs">No Item Specifications</p>
                                                }
                                            </TableCell>
                                            <TableCell className="p-1 text-xs w-[200px] whitespace-break-spaces">{`${data.itemNotes}`}</TableCell>
                                            <TableCell className="p-1 text-xs text-center">{`${data.quantity}`}</TableCell>
                                            <TableCell className="p-1 text-xs text-center">{`${data.unitPrice.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}`}</TableCell>
                                            <TableCell className="p-1 text-xs text-center">{`${data.total.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}`}</TableCell>
                                            <TableCell className="p-1 text-xs">
                                                <Button className="cursor-pointer" variant="ghost" style={{ paddingInline: '5px' }}
                                                        onClick={() => handleEditClick(index)}
                                                >
                                                    <SquarePen size={20} className="text-blue-500" />
                                                </Button>
                                                <Button className="cursor-pointer" variant="ghost" style={{ paddingInline: '5px' }}
                                                        onClick={() => {
                                                            if (setDeletedPoItems) {
                                                                setDeletedPoItems(prevState => [...prevState, data.purchaseOrderItemID])
                                                            }
                                                            setPoVendorsItems(
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
                                setPoVendorsItems(prevState => prevState.map((item, idx) => {
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

export default POVendorsItemsTable;   
