"use client";

import * as React from "react";

import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  Mail,
  Printer,
  Save,
  Send,
  Trash,
  Loader2,
  Files,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import InfiniteStatusSelect from "../../../../custom/select/status-select";
import { StatusItem } from "../../../../../services/status/types";
import { useSendEmail } from "@/hooks/useSendEmail";
import {
  useCreateQuoteApproval,
  useQuoteApproval,
} from "@/hooks/useQuoteApproval";
import { toast } from "sonner";
import { SerialEncoder } from "@/services/quotes/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { EmailSelectionDialog } from "@/components/dialogs/email-selection-dialog";

export interface ComponentsProps {
  status: number;
  add?: boolean;
  setStatusChange?: (tick: boolean) => void;
  setStatus: React.Dispatch<React.SetStateAction<number>>;
  setStatusText?: React.Dispatch<React.SetStateAction<string>>;
  modifyFlag: boolean;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateClick: () => void;
  handleDeleteClick?: () => void;
  handleConvertToOrderClick?: () => void;
  handleDuplicateQuote?: () => void;
  isSaving?: boolean;
  disableSave?: boolean;
  quoteId?: number;
  customerEmail?: string;
  customerName?: string;
  customerId?: number;
  serialEncoderData?: SerialEncoder;
}

const QuotesDetailsHeaders = ({
  status: quoteStatus,
  add,
  setStatusChange,
  setStatus: setQuoteStatus,
  setStatusText,
  modifyFlag,
  setModifyFlag,
  handleUpdateClick,
  handleDeleteClick,
  handleConvertToOrderClick,
  handleDuplicateQuote,
  isSaving = false,
  disableSave,
  quoteId,
  customerEmail,
  customerName,
  customerId,
  serialEncoderData,
}: ComponentsProps) => {
  const router = useRouter();
  const [isSendingApproval, setIsSendingApproval] = React.useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const { sendEmail } = useSendEmail();
  const { mutateAsync: createQuoteApproval } = useCreateQuoteApproval();
  const { data: quoteApprovalData, isLoading: isLoadingQuoteApproval } =
    useQuoteApproval(quoteId ?? 0, !!quoteId);

  const handleStatusSelect = (statusID: number, statusText?: string) => {
    if (statusID) {
      setQuoteStatus(statusID);
      setModifyFlag(true);

      if (setStatusChange) setStatusChange(true);
      if (statusText && setStatusText) setStatusText(statusText);
    }
  };

  const handleSendForApproval = () => {
    if (!quoteId || !customerEmail || !customerName || !customerId) {
      toast.error("Missing required information to Request Approval");
      return;
    }

    // Open the email selection dialog
    setEmailDialogOpen(true);
  };

  const handleSendEmails = async (emails: string[]) => {
    if (!quoteId || !customerName || !customerId) {
      toast.error("Missing required information to Request Approval");
      return;
    }

    try {
      setIsSendingApproval(true);

      // Create a unique token hash for this approval request
      const tokenHash =
        Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Create quote approval record
      await createQuoteApproval({
        quoteId,
        customerId,
        tokenHash,
        payload: {
          status: "PENDING",
          sentAt: new Date().toISOString(),
          recipientEmails: emails,
        },
      });

      // Send email to all selected recipients in a single API call
      const result = await sendEmail({
        to: emails,
        name: customerName,
        emailType: "quote-approval",
        tokenHash,
        quoteNumber: `Q-${quoteId}`,
        quoteDate: new Date().toLocaleDateString(),
      });

      toast.success(
        `Quote sent for approval successfully to ${
          result.totalSent || emails.length
        } recipient(s)`
      );
      setEmailDialogOpen(false);
    } catch (error) {
      console.error("Error sending quote for approval:", error);
      toast.error("Failed to send quote for approval");
    } finally {
      setIsSendingApproval(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-end pb-6 pt-6">
      {/* Left side: Back button and title */}
      <div className="flex items-center gap-3 hidden">
        <Button
          variant="ghost"
          className="!p-0 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="!h-6 !w-6" />
        </Button>
        {add ? (
          <h1 className="text-xl font-semibold">New Quotes</h1>
        ) : (
          <h1 className="text-xl font-semibold">Quotes Details</h1>
        )}
      </div>

      {/* Right side: Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Mobile Actions Menu */}
        <div className="md:hidden w-full">
          {/*<InfiniteStatusSelect*/}
          {/*    selectedStatusId={quoteStatus}*/}
          {/*    onStatusSelect={handleStatusSelect}*/}
          {/*    placeholder="Select status..."*/}
          {/*/>*/}
        </div>

        {/* region Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>

          <Button
            variant="outline"
            className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>

          <Button
            variant="outline"
            className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>

          {!add && (
            <Button
              onClick={handleDeleteClick}
              variant="outline"
              className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        {/* endregion */}

        {/* region Duplicate Quote */}
        {!add && handleDuplicateQuote && (
          <Button
            variant="outline"
            className="gap-2 h-9 px-4 border-gray-300 hover:bg-gray-50 cursor-pointer"
            onClick={handleDuplicateQuote}
          >
            <Files className="h-4 w-4" />
            <p className="text-sm">Duplicate this Quote</p>
          </Button>
        )}
        {/* endregion */}

        {/* region Save Button - Always visible */}
        {modifyFlag || add ? (
          <Button
            variant="default"
            onClick={handleUpdateClick}
            disabled={isSaving || disableSave}
            className="w-full md:w-auto gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
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
            className="w-full md:w-auto gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          >
            <Check className="h-4 w-4" />
            Saved
          </Button>
        )}
        {/* endregion */}

        {/* region Primary Actions */}
        <Button
          disabled={
            modifyFlag ||
            add ||
            isSendingApproval ||
            isLoadingQuoteApproval ||
            (!!quoteApprovalData && quoteApprovalData.status !== "REJECTED")
          }
          variant="default"
          onClick={handleSendForApproval}
          className="w-full md:w-auto gap-2 h-9 px-4 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
        >
          {isSendingApproval ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden md:inline">Sending...</span>
              <span className="md:hidden">Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="hidden md:inline">
                {quoteApprovalData && quoteApprovalData.status !== "REJECTED"
                  ? quoteApprovalData.status === "APPROVED"
                    ? "Already Approved"
                    : "Already Sent for Approval"
                  : "Request Approval"}
              </span>
              <span className="md:hidden">
                {quoteApprovalData && quoteApprovalData.status !== "REJECTED"
                  ? quoteApprovalData.status === "APPROVED"
                    ? "Approved"
                    : "Already Sent"
                  : "Approve"}
              </span>
            </>
          )}
        </Button>
        {/* endregion */}

        {/* region Convert to Order */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              onClick={handleConvertToOrderClick}
              disabled={
                modifyFlag || add || serialEncoderData?.serial_order_id !== -1
              }
              variant="default"
              className="w-full md:w-auto gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Convert to Order</span>
              <span className="md:hidden">Order</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={5}
            className={`${
              (serialEncoderData?.serial_order_id || -1) > 0 ? "" : "hidden"
            }`}
          >
            <p>This Quote is Already Converted to Order</p>
          </TooltipContent>
        </Tooltip>
        {/* endregion */}

        {/* region Status Dropdown - Always visible */}
        <InfiniteStatusSelect
          selectedStatusId={quoteStatus}
          onStatusSelect={handleStatusSelect}
          placeholder="Select status..."
        />
        {/* endregion */}
      </div>

      {/* Email Selection Dialog */}
      <EmailSelectionDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        onSendEmails={handleSendEmails}
        customerEmail={customerEmail}
        customerName={customerName}
        quoteNumber={quoteId ? `Q-${quoteId}` : undefined}
        isLoading={isSendingApproval}
      />
    </div>
  );
};

export default QuotesDetailsHeaders;
