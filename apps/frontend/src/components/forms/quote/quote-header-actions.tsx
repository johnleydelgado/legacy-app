"use client";

import * as React from "react";
import {
  ArrowLeft,
  Mail,
  Printer,
  Download,
  ChevronDown,
  Save,
  Send,
  ShoppingCart,
  Check,
  FileText,
  Plus,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  quoteNumber: string;
  onBack: () => void;
  onSubmit?: () => Promise<void>;
  onEmail?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onSaveQuote?: () => Promise<void>;
  onSendForApproval?: () => Promise<void>;
  onConvertToOrder?: () => Promise<void>;
  onAddPayment?: () => void;
  onStatusChange?: (status: string) => void;
  currentStatus?: string;
  isSaved?: boolean;
}

const QUOTE_STATUSES = [
  "APPROVAL SENT TO CUSTOMER",
  "APPROVAL SENT TO CUSTOMER - IN HOUSE",
  "APPROVED - IN HOUSE",
  "SENT TO BE DIGITIZED",
  "ISSUE - IN HOUSE",
  "RECEIVED IN HOUSE",
  "COMPLETE - NOT BEING INVOICED",
  "CUSTOMER APPROVED ARTWORK",
  "FEEDBACK REQUEST",
  "IN PRODUCTION",
  "IN PRODUCTION - IN HOUSE",
  "INVENTORY ISSUE",
  "INVOICE NEEDED DOWNLOAD",
  "NEED SEW OUT - IN HOUSE",
  "ORDER",
  "ORDER CHECKED AND APPROVED - IN HOUSE",
  "ORDER ON HOLD (ISSUE)",
  "ORDER SENT TO PRODUCTION",
  "PRODUCTION UPLOADED",
  "PRODUCTS ORDERED",
  "PRODUCTS ORDERED ON BACKORDER",
  "QC CHECK COMPLETED",
  "QUOTE",
  "QUOTE APPROVAL SENT",
  "QUOTE APPROVED",
  "QUOTE APPROVED - BACK ORDER",
  "QUOTE NOT APPROVED - CANCELED",
  "READY FOR SAMPLE DROP OFF",
  "READY TO PACK - IN HOUSE",
  "REPLACEMENTS - PRODUCTION ISSUE",
  "SAMPLE/ CATALOGS ORDERED",
  "SAMPLE ORDERED",
  "SAMPLES RETURNED",
  "SENT TO PRODUCTION - PATCH APPLICATION - IN HOUSE",
];

export function QuoteHeaderActions({
  quoteNumber,
  onBack,
  onSubmit,
  onEmail,
  onPrint,
  onDownload,
  onSaveQuote,
  onSendForApproval,
  onConvertToOrder,
  onAddPayment,
  onStatusChange,
  currentStatus = "QUOTE",
  isSaved = false,
}: Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSendingForApproval, setIsSendingForApproval] = React.useState(false);
  const [isConvertingToOrder, setIsConvertingToOrder] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [status, setStatus] = React.useState(currentStatus);

  const handleSubmit = async () => {
    if (!onSubmit) return;
    try {
      setIsSubmitting(true);
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendForApproval = async () => {
    if (!onSendForApproval) return;
    try {
      setIsSendingForApproval(true);
      await onSendForApproval();
    } finally {
      setIsSendingForApproval(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!onConvertToOrder) return;
    try {
      setIsConvertingToOrder(true);
      await onConvertToOrder();
    } finally {
      setIsConvertingToOrder(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="flex items-center justify-between border-b pb-6">
      {/* Left side: Back button and title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-9 w-9 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">{quoteNumber}</h1>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onEmail}
          className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50"
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>

        <Button
          variant="outline"
          onClick={onPrint}
          className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>

        <Button
          variant="outline"
          onClick={onDownload}
          className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>

        <Button
          variant="default"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-4 w-4" />
          {isSaved ? "Saved" : isSubmitting ? "Saving..." : "Save Quote"}
        </Button>

        <Button
          variant="default"
          onClick={handleSendForApproval}
          disabled={isSendingForApproval}
          className="gap-2 h-9 px-4 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Send className="h-4 w-4" />
          {isSendingForApproval ? "Sending..." : "Send for Approval"}
        </Button>

        <Button
          variant="default"
          onClick={handleConvertToOrder}
          disabled={isConvertingToOrder}
          className="gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white"
        >
          <FileText className="h-4 w-4" />
          {isConvertingToOrder ? "Converting..." : "Convert to Order"}
        </Button>

        <Button
          variant="default"
          onClick={onAddPayment}
          className="gap-2 h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Payment
        </Button>

        <DropdownMenu onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className="gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {status}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 max-h-96 overflow-y-auto"
          >
            <div className="border-t my-1" />
            {QUOTE_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                className="text-sm"
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
