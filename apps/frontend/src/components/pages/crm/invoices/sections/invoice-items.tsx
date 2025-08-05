'use client';

import * as React from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "../../../../ui/card";
import {Separator} from "../../../../ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../../../ui/table";
import {Asterisk, Package, Plus, Save, SquareAsterisk, SquarePen, SquareX, Trash2, X} from "lucide-react";
import {Button} from "../../../../ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../../ui/select";
import {useProductsCategories} from "../../../../../hooks/useProducts2";
import InfiniteProductSelect from "../custom/InfiniteProductSelect";
import {Input} from "../../../../ui/input";
import {Label} from "../../../../ui/label";

export interface InvoiceItemsTypes {
    invoiceItemsID: number;
    categoryID: number;
    categoryName: string;
    productID: number;
    itemNumber: string;
    itemName: string;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
    actionCreate: boolean;
    actionModify: boolean;
    actionEdited: boolean;
    errorState: string[];
}

const initialItemsValue = {
    invoiceItemsID: -1,
    categoryID: -1,
    categoryName: "",
    productID: -1,
    itemNumber: "",
    itemName: "",
    itemDescription: "",
    quantity: 0,
    unitPrice: 0,
    taxRate: 0.08,
    total: 0,
    actionCreate: false,
    actionModify: false,
    actionEdited: false,
    errorState: [],
}

interface ComponentsProps {
    invoiceItems: InvoiceItemsTypes[];
    setInvoiceItems: React.Dispatch<React.SetStateAction<InvoiceItemsTypes[]>>;
    setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
    setDeletedInvoiceItems?: React.Dispatch<React.SetStateAction<number[]>>;
}

const InvoiceItems = (
    {
        invoiceItems,
        setInvoiceItems,
        setModifyFlag,
        setDeletedInvoiceItems,
    }: ComponentsProps) => {
    const { data: dataProductsCategory } = useProductsCategories();
    const productsCategoryOptions = dataProductsCategory?.items || [];

    const handleAddingItems = () => {
        setInvoiceItems(prevState => [
            ...prevState,
            {
                ...initialItemsValue,
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
            "itemName",
            "itemDescription",
            "quantity",
            "unitPrice",
            "total",
        ].includes(label)) {
            setInvoiceItems( prevState => prevState.map((data, innerIndex) => {
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
            const categoryData = productsCategoryOptions.filter(
                (data) => data.pk_product_category_id === parseInt(value, 10)
            );

            if (categoryData.length > 0) {
                setInvoiceItems( prevState => prevState.map((data, innerIndex) => {
                    if (index === innerIndex) {
                        return {
                            ...data,
                            categoryID: parseInt(value, 10),
                            categoryName: categoryData[0].category_name,
                            actionEdited: true,
                        }
                    }
                    return data;
                }));
            }
        }
    }

    const calculateTotal = (unitPrice: number = 0, quantity: number = 0, taxRate: number = 0) => {
        const subTotal = unitPrice * quantity

        return subTotal + (subTotal * taxRate) ;
    }

    const handleSaveClick = (index: number, data: InvoiceItemsTypes) => {
        setInvoiceItems(prevState => prevState.map(
            (innerData, innerIndex) => {
                if (innerIndex === index) {
                    let errorState = [];

                    if(data.categoryID === -1) errorState.push("Selecting Category is required");
                    if(data.productID === -1) errorState.push("Selecting Product is required");
                    if(data.quantity <= 0) errorState.push("Entering Quantity is required");
                    if(data.unitPrice <= 0) errorState.push("Entering Unit Price is required");
                    // if(data.addressID === -1) errorState.push("Selecting Address is required");

                    if (errorState.length > 0)
                        return { ...innerData, errorState: [...innerData.errorState, ...errorState] }

                    return { ...innerData, actionModify: false, actionCreate: false }
                }

                return innerData;
            }));
    }

    const handleEditClick = (index: number) => {
        setInvoiceItems(prevState => prevState.map(
            (data, innerIndex) => {
                if (innerIndex === index) {
                    return { ...data, actionModify: true }
                }

                return data;
            }));
    }

    return (
        <Card>
            <CardHeader className="py-2 px-6 flex flex-row justify-between items-center w-full">
                <CardTitle className="text-sm font-semibold text-gray-700">Invoice Items</CardTitle>
                <Button
                    className="flex flex-row gap-x-2 cursor-pointer bg-blue-500 rounded-lg"
                    onClick={handleAddingItems}
                >
                    <Plus /> Add Invoice Item
                </Button>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent>
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-2 text-xs">Item #</TableHead>
                            <TableHead className="p-2 text-xs">Description</TableHead>
                            <TableHead className="p-2 text-xs text-center">Quantity</TableHead>
                            <TableHead className="p-2 text-xs text-center">Unit Price</TableHead>
                            <TableHead className="p-2 text-xs text-center">Total</TableHead>
                            <TableHead className="p-2 text-xs">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoiceItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-[300px]">
                                    <div className="w-full h-full flex flex-col gap-y-4 justify-center items-center">
                                        <Package size={40} color='gray' />
                                        <p>No Items added to this invoice yet</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : ( invoiceItems.map((data, index) => {
                            if (data.actionCreate || data.actionModify) {
                                return (
                                    <TableRow>
                                        <TableCell colSpan={6} className="min-h-[100px]">
                                            <div className="w-full flex flex-row flex-wrap gap-2 p-4 w-full">
                                                <div className="flex flex-row flex-wrap gap-1 w-[80%] grow">
                                                    <div className="flex flex-col gap-y-1 w-[18%] max-w-[120px] grow">
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
                                                    <div className="flex flex-col gap-y-1 w-[18%] max-w-[250px] grow">
                                                        <Label className="text-xs font-light">
                                                            Select Item Product:
                                                        </Label>
                                                        <InfiniteProductSelect
                                                            categoryId={data.categoryID || -1}
                                                            value={{
                                                                id: data.productID,
                                                                name: data.itemName,
                                                                index: index,
                                                            }}
                                                            index={index}
                                                            onValueChange={(value) => {
                                                                handleOnchangeText(value.index, "productID", value.id);
                                                                handleOnchangeText(value.index, "itemName", value.name);
                                                                handleOnchangeText(
                                                                    value.index,
                                                                    "itemDescription",
                                                                    `Item #${value.id} - ${data.categoryName} - ${value.name}`
                                                                );
                                                            }}
                                                            placeholder="Product Item"
                                                            enableSearch={true}
                                                            className="text-xs w-full"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-y-1 w-[25%] grow">
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
                                                    </div>
                                                </div>
                                                <div className="flex flex-row flex-wrap gap-1 w-[15%]">
                                                    <div className="flex flex-col gap-1 w-[40%] grow">
                                                        <Label
                                                            htmlFor="categoryID"
                                                            className="text-xs font-light"
                                                        >
                                                            Quantity:
                                                        </Label>
                                                        <Input
                                                            type="number"
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
                                                                        data.taxRate
                                                                    )
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1 w-[40%] grow">
                                                        <Label
                                                            htmlFor="categoryID"
                                                            className="text-xs font-light"
                                                        >
                                                            Unit Price:
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={data.unitPrice}
                                                            style={{ fontSize: '12px' }}
                                                            placeholder=""
                                                            onChange={(e) => {
                                                                handleOnchangeText(index, 'unitPrice', parseFloat(e.target.value))
                                                                handleOnchangeText(
                                                                    index,
                                                                    'total',
                                                                    calculateTotal(parseFloat(e.target.value), data.quantity, data.taxRate)
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full flex flex-row justify-end gap-x-2 gap-y-2 p-4 w-1/2">
                                                <div className="flex flex-row gap-1 border border-solid py-2 px-4 bg-gray-300 rounded-lg mr-4">
                                                    <p className="text-sm font-light">Total:</p>
                                                    <p className="text-sm font-semibold">{`$${data.total.toFixed(2)}`}</p>
                                                </div>
                                                <Button className="bg-green-500 text-white cursor-pointer text-sm w-[100px]"
                                                        onClick={() => handleSaveClick(index, data)}
                                                >
                                                    <Save />
                                                    Save
                                                </Button>
                                                <Button className="bg-red-500 text-white cursor-pointer text-sm w-[100px]"
                                                    onClick={() => {
                                                        if (data.actionCreate && data.actionModify) {
                                                            setInvoiceItems(
                                                                prevState => prevState.filter(
                                                                    (_, innerIndex) => innerIndex !== index)
                                                            )
                                                        } else if (!data.actionCreate && data.actionModify) {
                                                            setInvoiceItems(
                                                                prevState => prevState.map((innerData, innerIndex) => {
                                                                    if (index === innerIndex)
                                                                        return { ...innerData, actionModify: false };

                                                                    return innerData;
                                                                })
                                                            )
                                                        }
                                                    }}
                                                >
                                                    <SquareX />
                                                    Cancel
                                                </Button>
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
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                                return (
                                    <TableRow>
                                        <TableCell className="p-2 text-xs">{`Item # ${data.itemNumber}`}</TableCell>
                                        <TableCell className="p-2">
                                            <p className="text-xs text-wrap max-w-[400px]">{`${data.itemDescription}`}</p>
                                        </TableCell>
                                        <TableCell className="p-2 text-xs text-center">
                                            {data.quantity}
                                        </TableCell>
                                        <TableCell className="p-2 text-xs text-center">
                                            {`$ ${data.unitPrice.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}`}
                                        </TableCell>
                                        <TableCell className="p-2 text-xs text-center">
                                            {`$ ${data.total.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}`}
                                        </TableCell>
                                        <TableCell>
                                            <Button className="cursor-pointer" variant="ghost" style={{ paddingInline: '5px' }}
                                                    onClick={() => handleEditClick(index)}
                                            >
                                                <SquarePen size={20} className="text-blue-500" />
                                            </Button>
                                            <Button className="cursor-pointer" variant="ghost" style={{ paddingInline: '5px' }}
                                                    onClick={() => {
                                                        if (setDeletedInvoiceItems) {
                                                            setDeletedInvoiceItems(prevState => [...prevState, data.invoiceItemsID])
                                                        }
                                                        setInvoiceItems(
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
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <Separator className="mb-2" />
            <CardFooter>{}</CardFooter>
        </Card>
    )
}

export default InvoiceItems;
