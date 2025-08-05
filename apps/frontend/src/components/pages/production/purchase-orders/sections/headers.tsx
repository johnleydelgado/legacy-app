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
import { EmailSendDialog } from "./email-send-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
    purchaseOrderNumber?: string;
    customerName?: string;
    customerEmail?: string;
}

const PurchaseOrderDetailsHeaders = (
    {
        status: purchaseOrderStatus,
        setStatus: setPurchaseOrderStatus,
        setStatusChange,
        setStatusText,
        modifyFlag,
        setModifyFlag,
        add,
        handleDeleteOrder,
        handleUpdateClick,
        isSaving = false,
        disableSave = false,
        purchaseOrderNumber,
        customerName,
        customerEmail,
    }: ComponentsProps) => {
    const router = useRouter();

    const [openEmail, setOpenEmail] = React.useState(false);
    const [openPrint, setOpenPrint] = React.useState(false);

    // Memoize the email sent handler to prevent re-renders
    const handleEmailSent = React.useCallback((result: any) => {
        console.log('Email sent successfully:', result);
    }, []);

    const handleStatusSelect = (statusId: number, statusText?: string) => {
        if (setModifyFlag) {
            setModifyFlag(true);
        }
        setPurchaseOrderStatus(statusId);

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
                    <h1 className="text-xl font-semibold">New Purchase Order</h1>
                ) : (
                    <h1 className="text-xl font-semibold">Purchase Order Details</h1>
                )}
            </div>

            {/* Right side: Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 h-10 px-4 border-gray-200 hover:bg-gray-50 cursor-pointer rounded-xl"
                        onClick={() => setOpenEmail(true)}
                    >
                        <Mail className="h-4 w-4" />
                        Email
                    </Button>

                    <Button
                        variant="outline"
                        className="gap-2 h-10 px-4 border-gray-200 hover:bg-gray-50 cursor-pointer rounded-xl"
                        onClick={() => setOpenPrint(true)}
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>

                    {!add && (
                        <Button
                            onClick={handleDeleteOrder}
                            variant="outline"
                            className="gap-2 h-10 px-4 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-xl"
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
                        className="w-full md:w-auto gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm"
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
                        className="w-full md:w-auto gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm"
                    >
                        <Check className="h-4 w-4" />
                        Saved
                    </Button>
                )}

                {/* region Status Dropdown - Always visible */}
                <InfiniteStatusSelect
                    onStatusSelect={handleStatusSelect}
                    selectedStatusId={purchaseOrderStatus}
                    placeholder="Select status..."
                />
                {/* endregion */}
            </div>

            {/* Email Dialog with proper props */}
            <EmailSendDialog 
                open={openEmail}
                onOpenChange={setOpenEmail}
                onEmailSent={handleEmailSent}
                purchaseOrderNumber={purchaseOrderNumber}
                recipientName={customerName || 'Customer'}
                defaultRecipients={customerEmail ? [customerEmail] : []}
                contextTitle="Send Purchase Order Email"
                contextSubtitle={purchaseOrderNumber ? `Send email regarding PO #${purchaseOrderNumber}` : undefined}
                emailType="customer-quote-status"
            />

            { openPrint && (
                <AlertDialog open={openPrint} onOpenChange={setOpenPrint}>
                <AlertDialogTrigger className="hidden">Print</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Print Purchase Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      This Feature is not available yet.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction>Okay</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
    );
};

export default PurchaseOrderDetailsHeaders;
