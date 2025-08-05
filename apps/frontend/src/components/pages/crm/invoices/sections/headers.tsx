"use client";

import * as React from "react";

import {
    ArrowLeft,
    Check,
    Download,
    Mail,
    Printer,
    Save,
    Trash,
    Loader2, FileText, Package, CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import InfiniteStatusSelect from "../../../../custom/select/status-select";
import {StatusItem} from "../../../../../services/status/types";

export interface ComponentsProps {
    status: number;
    add?: boolean;
    setStatus: React.Dispatch<React.SetStateAction<number>>;
    setStatusChange?: (tick: boolean) => void;
    setStatusText?: React.Dispatch<React.SetStateAction<string>>;
    modifyFlag?: boolean;
    setModifyFlag?: React.Dispatch<React.SetStateAction<boolean>>;
    handleDeleteOrder?: () => void;
    handleUpdateClick: () => void;
    isSaving?: boolean;
    disableSave?: boolean;
}

const InvoiceDetailsHeaders = (
    {
        status: invoiceStatus,
        setStatus: setInvoiceStatus,
        setStatusChange,
        setStatusText,
        modifyFlag,
        setModifyFlag,
        add,
        handleDeleteOrder,
        handleUpdateClick,
        isSaving = false,
        disableSave = false,
    }: ComponentsProps) => {
    const router = useRouter();

    const handleStatusSelect = (statusId: number, statusText?: string) => {
        if (setModifyFlag) {
            setModifyFlag(true);
        }
        setInvoiceStatus(statusId);

        if (setStatusChange) setStatusChange(true);
        if (statusText && setStatusText) setStatusText(statusText);
    };

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-end pb-6 pt-6">
            {/* Left side: Back button and title */}
            <div className="flex items-center gap-3 hidden">
                <Button variant="ghost" className="!p-0" onClick={() => router.back()}>
                    <ArrowLeft className="!h-6 !w-6" />
                </Button>
                {add ? (
                    <h1 className="text-xl font-semibold">New Invoice</h1>
                ) : (
                    <h1 className="text-xl font-semibold">Invoice Details</h1>
                )}
            </div>

            {/* Right side: Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Mobile Actions Menu */}
                <div className="md:hidden w-full">
                    {/*<InfiniteStatusSelect*/}
                    {/*    value={`${invoiceStatus}`}*/}
                    {/*    placeholder="Select project status..."*/}
                    {/*    onSelect={handleStatusSelect}*/}
                    {/*    itemsPerPage={15}*/}
                    {/*    className="w-full md:w-auto gap-2 h-9 px-4 text-white"*/}
                    {/*/>*/}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50"
                    >
                        <Mail className="h-4 w-4" />
                        Email
                    </Button>

                    <Button
                        variant="outline"
                        className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>

                    <Button
                        variant="outline"
                        className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </Button>

                    {!add && (
                        <Button
                            onClick={handleDeleteOrder}
                            variant="outline"
                            className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50"
                        >
                            <Trash className="h-4 w-4" />
                            Delete
                        </Button>
                    )}
                </div>

                {/* Save Button - Always visible */}
                { add || modifyFlag ? (
                    <Button
                        variant="default"
                        onClick={handleUpdateClick}
                        disabled={isSaving || disableSave}
                        className="w-full md:w-auto gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Change
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        disabled={true}
                        className="w-full md:w-auto gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Check className="h-4 w-4" />
                        Saved
                    </Button>
                )}

                {!add && (
                    <div className="flex flex-row" style={{ columnGap: "10px" }}>
                        <Button
                            variant="default"
                            className="w-full md:w-auto gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CircleDollarSign className="h-4 w-4" />
                            <span className="hidden md:inline">Record Payment</span>
                        </Button>
                    </div>
                )}

                {/* region Status Dropdown - Always visible */}
                <InfiniteStatusSelect
                    onStatusSelect={handleStatusSelect}
                    selectedStatusId={invoiceStatus}
                    placeholder="Select status..."
                />
                {/* endregion */}
            </div>
        </div>
    );
};

export default InvoiceDetailsHeaders;
