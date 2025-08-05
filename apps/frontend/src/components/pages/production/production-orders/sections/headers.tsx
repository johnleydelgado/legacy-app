"use client";

import * as React from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Check,
  Download,
  Mail,
  Printer,
  Save,
  Loader2,
  Eye,
  Factory,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import InfiniteStatusSelect from "../../../../custom/select/status-select";
import { FactoryEmailDialog } from "@/components/dialogs/factory-email-dialog";
import { toast } from "sonner";
import { useSendEmail } from "@/hooks/useSendEmail";

export interface ProductionOrderHeadersProps {
  status: number;
  add?: boolean;
  setStatus: React.Dispatch<React.SetStateAction<number>>;
  setStatusChange?: (tick: boolean) => void;
  setStatusText?: React.Dispatch<React.SetStateAction<string>>;
  modifyFlag: boolean;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateClick: () => void;
  isSaving?: boolean;
  disableSave?: boolean;
  onPreviewClick?: () => void;
  productionOrderId?: string;
  customerName?: string;
}

const ProductionOrderHeaders = ({
  status: orderStatus,
  setStatus: setOrderStatus,
  setStatusChange,
  setStatusText,
  add,
  modifyFlag,
  setModifyFlag,
  handleUpdateClick,
  isSaving = false,
  disableSave = false,
  onPreviewClick,
  productionOrderId,
  customerName,
}: ProductionOrderHeadersProps) => {
  const router = useRouter();
  const { sendEmail } = useSendEmail();
  const [factoryEmailDialogOpen, setFactoryEmailDialogOpen] = React.useState(false);
  const [isSendingToFactory, setIsSendingToFactory] = React.useState(false);

  const handleStatusSelect = (statusID: number, statusText?: string) => {
    if (statusID) {
      setOrderStatus(statusID);
      setModifyFlag(true);

      if (setStatusChange) setStatusChange(true);
      if (statusText && setStatusText) setStatusText(statusText);
    }
  };

  const handleEmailClick = () => {
    // TODO: Implement email functionality
    console.log("Email production order");
  };

  const handlePrintClick = () => {
    // TODO: Implement print functionality
    console.log("Print production order");
  };

  const handleDownloadClick = () => {
    // TODO: Implement download functionality
    console.log("Download production order");
  };

  const handleSendToFactory = () => {
    if (!productionOrderId || !customerName) {
      toast.error("Missing required information to send to factory");
      return;
    }

    setFactoryEmailDialogOpen(true);
  };

  const handleSendFactoryEmails = async (emails: string[]) => {
    if (!productionOrderId || !customerName) {
      toast.error("Missing required information to send to factory");
      return;
    }

    try {
      setIsSendingToFactory(true);

      // TODO: Implement production order email sending
      // Send email to all selected factory recipients
      // const result = await sendEmail({
      //   to: emails,
      //   name: customerName,
      //   emailType: "production-order", // Need to add this to SendEmailDto
      //   productionOrderNumber: `PO-${productionOrderId}`,
      //   productionOrderDate: new Date().toLocaleDateString(),
      // });
      
      // Mock success for now
      const result = { totalSent: emails.length };

      toast.success(
        `Production order sent to factory successfully to ${
          result.totalSent || emails.length
        } recipient(s)`
      );
      setFactoryEmailDialogOpen(false);
    } catch (error) {
      console.error("Error sending production order to factory:", error);
      toast.error("Failed to send production order to factory");
    } finally {
      setIsSendingToFactory(false);
    }
  };

  return (
    <div className="flex items-center justify-between pb-6 pt-6" style={{
      backgroundColor: "#FFFFFF",
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Left side: Back button and title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="!p-0" onClick={() => router.back()}>
          <ArrowLeft className="!h-6 !w-6" />
        </Button>
        <h1 className="font-semibold" style={{
          fontSize: "24px",
          color: "#000000",
          lineHeight: "1",
          margin: "0",
        }}>
          {add ? "New Production Order" : "Production Order Details"}
        </h1>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-3">
        {/* Desktop Actions */}
        <Button
          variant="outline"
          className="cursor-pointer border-gray-200 hover:bg-gray-50"
          style={{
            height: "36px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
          }}
          onClick={handleEmailClick}
        >
          <Mail className="w-4 h-4 mr-1" />
          Email
        </Button>

        <Button
          variant="outline"
          className="cursor-pointer border-gray-200 hover:bg-gray-50"
          style={{
            height: "36px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
          }}
          onClick={handlePrintClick}
        >
          <Printer className="w-4 h-4 mr-1" />
          Print
        </Button>

        <Button
          variant="outline"
          className="cursor-pointer border-gray-200 hover:bg-gray-50"
          style={{
            height: "36px",
            borderRadius: "10px",  
            fontSize: "14px",
            fontWeight: "500",
          }}
          onClick={handleDownloadClick}
        >
          <Download className="w-4 h-4 mr-1" />
          Download
        </Button>

        {onPreviewClick && (
          <Button
            variant="outline"
            className="cursor-pointer border-gray-200 hover:bg-gray-50"
            style={{
              height: "36px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
            }}
            onClick={onPreviewClick}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        )}

        {/* Send to Factory Button */}
        {!add && (
          <Button
            variant="outline"
            className="cursor-pointer border-gray-200 hover:bg-gray-50"
            style={{
              height: "36px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
            }}
            onClick={handleSendToFactory}
            disabled={isSendingToFactory}
          >
            {isSendingToFactory ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                Send to Factory
              </>
            )}
          </Button>
        )}

        {/* Save Button */}
        {modifyFlag || add ? (
          <Button
            onClick={handleUpdateClick}
            disabled={isSaving || disableSave}
            className="cursor-pointer text-white"
            style={{
              backgroundColor: "#67A3F0",
              height: "36px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #67A3F0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(103, 163, 240, 0.81)";
              e.currentTarget.style.borderColor = "rgba(103, 163, 240, 0.81)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#67A3F0";
              e.currentTarget.style.borderColor = "#67A3F0";
            }}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save Change
              </>
            )}
          </Button>
        ) : (
          <Button
            disabled={true}
            className="cursor-pointer text-white"
            style={{
              backgroundColor: "#10b981",
              height: "36px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #10b981",
            }}
          >
            <Check className="w-4 h-4 mr-1" />
            Saved
          </Button>
        )}

        {/* Status Dropdown */}
        <InfiniteStatusSelect
          selectedStatusId={orderStatus}
          onStatusSelect={handleStatusSelect}
          placeholder="Select status..."
        />
      </div>

      {/* Factory Email Dialog */}
      <FactoryEmailDialog
        open={factoryEmailDialogOpen}
        onOpenChange={setFactoryEmailDialogOpen}
        onSendEmails={handleSendFactoryEmails}
        customerName={customerName}
        productionOrderNumber={productionOrderId ? `PO-${productionOrderId}` : undefined}
        isLoading={isSendingToFactory}
      />
    </div>
  );
};

export default ProductionOrderHeaders;