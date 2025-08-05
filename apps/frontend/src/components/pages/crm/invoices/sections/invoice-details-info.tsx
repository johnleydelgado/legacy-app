'use client';

import * as React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../../ui/card";
import {Separator} from "../../../../ui/separator";
import {Label} from "../../../../ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "../../../../ui/popover";
import {Button} from "../../../../ui/button";
import {Calendar as CalendarComponent} from "../../../../ui/calendar";
import {Calendar} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "../../../../ui/select";

interface ComponentsProps {
    invoiceDate: Date;
    setInvoiceDate: (params: Date) => void;
    terms: string;
    setTerms: (params: string) => void;
    dueDate: Date;
    setDueDate: (params: Date) => void;
    setModifyFlag?: React.Dispatch<React.SetStateAction<boolean>>;
}

const InvoiceDetailsInfo = (
    {
        invoiceDate,
        setInvoiceDate,
        terms,
        setTerms,
        dueDate,
        setDueDate,
        setModifyFlag,
    }: ComponentsProps) => {
    const [openInvoiceDate, setOpenInvoiceDate] = React.useState<boolean>(false);
    const [openDueDate, setOpenDueDate] = React.useState<boolean>(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Invoice Details</CardTitle>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent className="flex flex-col gap-y-4">
                <div className="flex flex-row gap-x-2 justify-between">
                    <div className="flex flex-col gap-3 w-[30%] grow">
                        <Label htmlFor="invoiceDate" className="px-1 text-sm font-light text-gray-700">Invoice Date</Label>
                        <Popover open={openInvoiceDate} onOpenChange={setOpenInvoiceDate}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="invoiceDate"
                                    className="w-full justify-between font-normal cursor-pointer text-xs"
                                >
                                    {invoiceDate ? invoiceDate.toLocaleDateString() : "Select invoice date"}
                                    <Calendar />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={invoiceDate}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setInvoiceDate(date || new Date());
                                        setOpenInvoiceDate(false);
                                        if (setModifyFlag) setModifyFlag(true);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-3 w-[30%] grow">
                        <Label htmlFor="terms" className="px-1 text-sm font-light text-gray-700">Payment Terms</Label>
                        <Select value={terms} onValueChange={(e) => {
                            if (setModifyFlag) setModifyFlag(true);
                            setTerms(e);
                        }}>
                            <SelectTrigger className="w-full text-xs" id="terms">
                                <SelectValue placeholder="Select terms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="1" className="text-xs">Due On Receipt</SelectItem>
                                    <SelectItem value="2" className="text-xs">Net 15</SelectItem>
                                    <SelectItem value="3" className="text-xs">Net 30</SelectItem>
                                    <SelectItem value="4" className="hidden text-xs">Net 45</SelectItem>
                                    <SelectItem value="5" className="hidden text-xs">Net 60</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-3 w-[30%] grow">
                        <Label htmlFor="dueDate" className="px-1 text-sm font-light text-gray-700">Due Date</Label>
                        <Popover open={openDueDate} onOpenChange={setOpenDueDate}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="dueDate"
                                    className="w-full justify-between font-normal cursor-pointer text-xs"
                                >
                                    {dueDate ? dueDate.toLocaleDateString() : "Select due date"}
                                    <Calendar />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={dueDate}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setDueDate(date || new Date());
                                        setOpenDueDate(false);
                                        if (setModifyFlag) setModifyFlag(true);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default InvoiceDetailsInfo
