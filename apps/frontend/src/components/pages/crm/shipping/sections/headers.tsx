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
  Tag,
  FileBarChart,
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
import ShippingLabel from "@/components/pdf/shipping-label-pdf";
import PackingSlipPDF from "@/components/pdf/packing-slip-pdf";
import PackageSelectDialog from "@/components/dialogs/package-select-dialog";
import { pdf } from "@react-pdf/renderer";
import { COMPANY_INFO } from "@/constants/company-info";
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
  handleGeneratePackingSlip?: () => void;
  isSaving?: boolean;
  disableSave?: boolean;
  // New props for package selection
  packages?: Array<{
    name: string;
    company_name?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }>;
  customerData?: {
    name: string;
    contact_primary?: {
      first_name: string;
      last_name: string;
    };
  };
  shippingOrder?: {
    po_number: string;
    due_date: string;
    shipping_order_number: string;
  };
  shippingItems?: Array<{
    item_name: string;
  }>;
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
  handleGeneratePackingSlip,
  isSaving = false,
  disableSave = false,
  packages = [],
  customerData,
  shippingOrder,
  shippingItems = [],
}: ComponentsProps) => {
  const router = useRouter();
  const [showBoxLabelDialog, setShowBoxLabelDialog] = React.useState(false);

  const handleStatusSelect = (statusID: number, statusText?: string) => {
    if (statusID) {
      setOrderStatus(statusID);
      setModifyFlag(true);

      if (setStatusChange) setStatusChange(true);
      if (statusText && setStatusText) setStatusText(statusText);
    }
  };

  const handlePrintBoxLabel = () => {
    setShowBoxLabelDialog(true);
  };

  const handleBoxLabelPackageSelect = async (packageIndex: number) => {
    const selectedPackage = packages[packageIndex];
    if (!selectedPackage) return;

    const customerName = customerData?.contact_primary 
      ? `${customerData.contact_primary.first_name} ${customerData.contact_primary.last_name}`
      : customerData?.name || "N/A";
    
    const productDescription = shippingItems.length > 0 
      ? shippingItems.map(item => item.item_name).join(", ")
      : "Products";

    const doc = (
      <ShippingLabel
        fromCompany={COMPANY_INFO.name}
        fromAddress={`${COMPANY_INFO.address.street1}, ${COMPANY_INFO.address.city} ${COMPANY_INFO.address.state} ${COMPANY_INFO.address.zip}`}
        fromEmail={COMPANY_INFO.email}
        fromPhone={COMPANY_INFO.address.phone}
        showLogo={true}
        poNumber={shippingOrder?.shipping_order_number || "N/A"}
        productDescription={productDescription}
        customerName={customerName}
        customerCompany={selectedPackage.company_name || selectedPackage.name || "N/A"}
        productionDueDate={new Date().toLocaleDateString()}
        customerDueDate={shippingOrder?.due_date ? new Date(shippingOrder.due_date).toLocaleDateString() : "N/A"}
      />
    );
    
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setShowBoxLabelDialog(false);
  };

  const handlePackingSlipClick = async () => {
    // This will be implemented in the parent component with actual data
    if (handleGeneratePackingSlip) {
      handleGeneratePackingSlip();
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
          <h1 className="text-xl font-semibold">New Shipping</h1>
        ) : (
          <h1 className="text-xl font-semibold">Shipping Details</h1>
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
              className="w-full md:w-auto gap-2 h-9 px-4 bg-purple-600 hover:bg-green-700 text-white"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Create Invoice</span>
            </Button>
            <Button
              variant="default"
              className="hidden w-full md:w-auto gap-2 h-9 px-4 bg-indigo-600 hover:bg-green-700 text-white"
            >
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Create Purchase Order</span>
            </Button>
          </div>
        )}

        {/* New buttons when not in add mode */}
        {!add && (
          <>
            <Button
              variant="default"
              className="w-full md:w-auto gap-2 h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handlePackingSlipClick}
            >
              <FileBarChart className="h-4 w-4" />
              <span className="hidden md:inline">Packing Slip</span>
              <span className="md:hidden">Packing</span>
            </Button>

            <Button
              variant="default"
              className="w-full md:w-auto gap-2 h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handlePrintBoxLabel}
            >
              <Printer className="h-4 w-4" />
              <span className="hidden md:inline">Print Box Labels</span>
              <span className="md:hidden">Box Labels</span>
            </Button>
          </>
        )}

        {/* Status Dropdown - Always visible */}
        <InfiniteStatusSelect
          selectedStatusId={orderStatus}
          onStatusSelect={handleStatusSelect}
          placeholder="Select status..."
        />
      </div>
      
      {/* Package Selection Dialog for Box Labels */}
      <PackageSelectDialog
        open={showBoxLabelDialog}
        onOpenChange={setShowBoxLabelDialog}
        packages={packages}
        onPackageSelect={handleBoxLabelPackageSelect}
      />
    </div>
  );
};

export default OrdersDetailsHeaders;
