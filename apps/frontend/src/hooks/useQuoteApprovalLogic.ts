import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  useQuoteApprovalByToken,
  useUpdateQuoteApproval,
} from "@/hooks/useQuoteApproval";
import { useSendEmail } from "@/hooks/useSendEmail";
import { getActiveEmailNotificationAddresses } from "@/utils/email-notifications";
import type { Customer } from "@/services/customers/types";
import type { QuoteItem } from "@/services/quote-items/types";

interface UseQuoteApprovalLogicProps {
  token: string;
  recipientEmail: string;
  customer?: Customer;
  quoteItemsData?: { items: QuoteItem[] };
  total: number;
  createOrderFromQuote: () => Promise<void>;
  payload: any;
}

interface EmailAndName {
  email: string;
  name: string;
}

export const useQuoteApprovalLogic = ({
  token,
  recipientEmail,
  customer,
  quoteItemsData,
  total,
  createOrderFromQuote,
  payload,
}: UseQuoteApprovalLogicProps) => {
  const {
    data: quoteApproval,
    isLoading: isApprovalLoading,
    error: approvalError,
  } = useQuoteApprovalByToken(token, !!token);

  const { mutate: updateQuote } = useUpdateQuoteApproval();
  const { sendEmail } = useSendEmail();

  // Local state
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);
  const [isProcessingRejection, setIsProcessingRejection] = useState(false);

  const getEmailAndName = useCallback((): EmailAndName => {
    if (!customer) return { email: "", name: "" };

    const primaryContact =
      customer.contacts?.find((c) => c.contact_type === "PRIMARY") ||
      customer.contacts?.[0];

    return {
      email: primaryContact?.email || "",
      name: primaryContact
        ? `${primaryContact.first_name} ${primaryContact.last_name}`.trim()
        : customer.name || "",
    };
  }, [customer]);

  const sendNotificationEmails = useCallback(
    async (status: "ACCEPTED" | "DECLINED", reason?: string) => {
      const emailAndName = getEmailAndName();
      const quoteNumber = `Q-${quoteApproval?.quoteId || "Unknown"}`;

      try {
        // Send customer notification
        await sendEmail({
          to: payload.recipientEmails,
          name: emailAndName.name,
          emailType: "customer-quote-status",
          quoteNumber,
          status,
          ...(reason && { reason }),
        });

        // Send team notification
        const teamEmailType =
          status === "ACCEPTED" ? "quote-accepted" : "quote-declined";

        // Get active email notifications dynamically
        const teamEmailAddresses = await getActiveEmailNotificationAddresses();

        const teamEmailData: any = {
          to: teamEmailAddresses,
          name: emailAndName.name,
          emailType: teamEmailType,
          quoteNumber,
          ...(reason && { reason }),
        };

        if (status === "ACCEPTED") {
          teamEmailData.quoteDetails = {
            total: total.toFixed(2),
            items:
              quoteItemsData?.items?.map((item) => ({
                name: item.item_name || "Unknown Item",
                quantity: item.quantity || 0,
                price: (
                  Number(item.unit_price || 0) * (item.quantity || 0)
                ).toFixed(2),
              })) || [],
          };
        }
        await sendEmail(teamEmailData);
      } catch (emailError) {
        console.error(
          `Failed to send ${status.toLowerCase()} email:`,
          emailError
        );
        // Don't block the success flow if email fails
      }
    },
    [sendEmail, getEmailAndName, quoteApproval?.quoteId, total, quoteItemsData]
  );

  const createPayload = useCallback(
    async (status: "APPROVED" | "REJECTED", reason?: string) => {
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipResponse.json();

        return {
          ...(quoteApproval?.payload || {}),
          ipAddress: ip,
          timestamp: new Date().toISOString(),
          customerName: customer?.name || "",
          reviewerEmail: recipientEmail || "unknown",
          status,
          ...(reason && { reason }),
        };
      } catch (error) {
        console.error("Failed to get IP address:", error);
        return {
          ...(quoteApproval?.payload || {}),
          timestamp: new Date().toISOString(),
          customerName: customer?.name || "",
          reviewerEmail: recipientEmail || "unknown",
          status,
          ...(reason && { reason }),
        };
      }
    },
    [quoteApproval, customer, recipientEmail]
  );

  const handleApprove = useCallback(async () => {
    if (!quoteApproval) return;

    setActionType("approve");
    setIsProcessingApproval(true);

    try {
      const payload = await createPayload("APPROVED");

      updateQuote(
        {
          id: quoteApproval.id,
          data: { status: "APPROVED", payload },
        },
        {
          onSuccess: async () => {
            try {
              await createOrderFromQuote();
              await sendNotificationEmails("ACCEPTED");

              setApproved(true);
              setActionType(null);
              setIsProcessingApproval(false);
              toast("Quote approved successfully", { position: "top-right" });
            } catch (error) {
              console.error("Failed in post-approval operations:", error);
              setActionType(null);
              setIsProcessingApproval(false);
              toast("Quote approved but some operations failed", {
                position: "top-right",
                className: "text-orange-600",
              });
            }
          },
          onError: () => {
            setActionType(null);
            setIsProcessingApproval(false);
            toast("Failed to approve quote", {
              position: "top-right",
              className: "text-red-600",
            });
          },
        }
      );
    } catch (error) {
      console.error("Failed to approve quote:", error);
      setActionType(null);
      setIsProcessingApproval(false);
      toast("Something went wrong while approving", {
        position: "top-right",
        className: "text-red-600",
      });
    }
  }, [
    quoteApproval,
    createPayload,
    updateQuote,
    createOrderFromQuote,
    sendNotificationEmails,
  ]);

  const handleReject = useCallback(
    async (reason: string) => {
      if (!quoteApproval) return;

      setActionType("reject");
      setIsProcessingRejection(true);

      try {
        const payload = await createPayload("REJECTED", reason);

        updateQuote(
          {
            id: quoteApproval.id,
            data: { status: "REJECTED", reason, payload },
          },
          {
            onSuccess: async () => {
              try {
                await sendNotificationEmails("DECLINED", reason);

                setRejected(true);
                setActionType(null);
                setIsProcessingRejection(false);
                toast("Quote declined", { position: "top-right" });
              } catch (error) {
                console.error("Failed in post-rejection operations:", error);
                setActionType(null);
                setIsProcessingRejection(false);
                toast("Quote declined but some operations failed", {
                  position: "top-right",
                  className: "text-orange-600",
                });
              }
            },
            onError: () => {
              setActionType(null);
              setIsProcessingRejection(false);
              toast("Failed to decline quote", {
                position: "top-right",
                className: "text-red-600",
              });
            },
          }
        );
      } catch (error) {
        console.error("Failed to decline quote:", error);
        setActionType(null);
        setIsProcessingRejection(false);
        toast("Something went wrong while declining", {
          position: "top-right",
          className: "text-red-600",
        });
      }
    },
    [quoteApproval, createPayload, updateQuote, sendNotificationEmails]
  );

  const isApprovedState = quoteApproval?.status === "APPROVED" || approved;
  const isRejectedState = quoteApproval?.status === "REJECTED" || rejected;

  return {
    // Data
    quoteApproval,
    isApprovalLoading,
    approvalError,

    // State
    approved,
    rejected,
    actionType,
    isProcessingApproval,
    isProcessingRejection,
    isApprovedState,
    isRejectedState,

    // Actions
    handleApprove,
    handleReject,
  };
};
