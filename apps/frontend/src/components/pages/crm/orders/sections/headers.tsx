"use client";

import * as React from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  FileText,
  Info,
  Mail,
  Plus,
  Printer,
  Save,
  Send,
  Trash,
  Loader2,
  MoreVertical,
  Package,
  Truck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStatuses } from "@/hooks/useStatus";
import { useRouter } from "next/navigation";
import { StatusItem } from "../../../../../services/status/types";
import InfiniteStatusSelect from "../../../../custom/select/status-select";

export interface ComponentsProps {
  status: number;
  add?: boolean;
  setStatus: React.Dispatch<React.SetStateAction<number>>;
  setStatusChange?: (tick: boolean) => void;
  setStatusText?: React.Dispatch<React.SetStateAction<string>>;
  modifyFlag: boolean;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteOrder?: () => void;
  handleUpdateClick: () => void;
  handleConvertInvoice?: () => void;
  handleConvertPurchaseOrder?: () => void;
  handleConvertShipping?: () => void;
  isSaving?: boolean;
  disableSave?: boolean;
}

const OrdersDetailsHeaders = ({
  status: orderStatus,
  setStatus: setOrderStatus,
  setStatusChange,
  setStatusText,
  add,
  modifyFlag,
  setModifyFlag,
  handleDeleteOrder,
  handleUpdateClick,
  handleConvertInvoice,
  handleConvertPurchaseOrder,
  handleConvertShipping,
  isSaving = false,
  disableSave = false,
}: ComponentsProps) => {
  const router = useRouter();

  const handleStatusSelect = (statusID: number, statusText?: string) => {
    if (statusID) {
      setOrderStatus(statusID);
      setModifyFlag(true);

      if (setStatusChange) setStatusChange(true);
      if (statusText && setStatusText) setStatusText(statusText);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-end pb-6 pt-6">
      {/* Left side: Back button and title */}
      <div className="flex items-center gap-3 hidden">
        <Button variant="ghost" className="!p-0" onClick={() => router.back()}>
          <ArrowLeft className="!h-6 !w-6" />
        </Button>
        {add ? (
          <h1 className="text-xl font-semibold">New Order</h1>
        ) : (
          <h1 className="text-xl font-semibold">Orders Details</h1>
        )}
      </div>

      {/* Right side: Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Mobile Actions Menu */}
        <div className="md:hidden w-full">
          <InfiniteStatusSelect
            selectedStatusId={orderStatus}
            onStatusSelect={handleStatusSelect}
            placeholder="Select status..."
          />
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
        {modifyFlag || add ? (
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

        {/* Primary Actions */}
        {!add && (
          <div className="flex flex-row" style={{ columnGap: "10px" }}>
            <Button
              onClick={handleConvertInvoice}
              variant="default"
              className="w-full md:w-auto gap-2 h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={modifyFlag || isSaving}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Create Invoice</span>
            </Button>
            <Button
              onClick={handleConvertPurchaseOrder}
              variant="default"
              className="w-full md:w-auto gap-2 h-9 px-4 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={modifyFlag || isSaving}
            >
              <Store className="h-4 w-4" />
              <span className="hidden md:inline">Create Purchase Order</span>
            </Button>
            <Button
              onClick={handleConvertShipping}
              variant="default"
              className="w-full md:w-auto gap-2 h-9 px-4 bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={modifyFlag || isSaving}
            >
              <Truck className="h-4 w-4" />
              <span className="hidden md:inline">Convert to Shipping</span>
              <span className="md:hidden">Shipping</span>
            </Button>
            <Button
              variant="default"
              className="hidden w-full md:w-auto gap-2 h-9 px-4 bg-indigo-600 hover:bg-green-700 text-white"
              disabled={modifyFlag || isSaving}
            >
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Create Purchase Order</span>
            </Button>
          </div>
        )}

        <Button
          disabled={add || modifyFlag || isSaving}
          variant="default"
          className="w-full md:w-auto gap-2 h-9 px-4 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Truck className="h-4 w-4" />
          <span className="hidden md:inline">Send to Production</span>
          <span className="md:hidden">Production</span>
        </Button>

        <Button
          variant="default"
          className="w-full md:w-auto gap-2 h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Payment</span>
          <span className="md:hidden">Pay</span>
        </Button>

        {/* Status Dropdown - Always visible */}
        <InfiniteStatusSelect
          selectedStatusId={orderStatus}
          onStatusSelect={handleStatusSelect}
          placeholder="Select status..."
        />
      </div>
    </div>
  );
};

export default OrdersDetailsHeaders;
