export interface SendEmailDto {
  to: string | string[]; // Support both single email and array of emails
  name: string;
  emailType:
    | "quote-approval"
    | "quote-declined"
    | "quote-accepted"
    | "customer-quote-status";
  tokenHash?: string; // Required for quote-approval
  quoteNumber?: string; // Required for quote-declined, quote-accepted, and customer-quote-status
  quoteDate?: string; // Required for quote-approval (display date in email)
  reason?: string; // Optional for quote-declined and customer-quote-status
  status?: "ACCEPTED" | "DECLINED"; // Required for customer-quote-status
  quoteDetails?: {
    total?: string;
    items?: Array<{
      name: string;
      quantity: number;
      price: string;
    }>;
  }; // Optional for quote-accepted
}

export interface SendEmailResponse {
  success: boolean;
  message?: string;
  messageId?: string; // For backward compatibility with single email
  results?: Array<{ email: string; messageId: string }>; // For multiple emails
  totalSent?: number;
}

/**
 * Send an email via the internal Next.js route.
 *
 * @example
 * // Quote approval (single email)
 * await sendEmail({
 *   to: "customer@example.com",
 *   name: "John",
 *   emailType: "quote-approval",
 *   tokenHash: "abc123",
 *   quoteDate: "05/31/2025",
 * });
 *
 * // Quote approval (multiple emails)
 * await sendEmail({
 *   to: ["customer@example.com", "manager@example.com"],
 *   name: "John",
 *   emailType: "quote-approval",
 *   tokenHash: "abc123",
 *   quoteDate: "05/31/2025",
 * });
 *
 * // Quote declined
 * await sendEmail({
 *   to: "team@company.com",
 *   name: "John",
 *   emailType: "quote-declined",
 *   quoteNumber: "Q-12345",
 *   reason: "Price too high"
 * });
 *
 * // Quote accepted
 * await sendEmail({
 *   to: "team@company.com",
 *   name: "John",
 *   emailType: "quote-accepted",
 *   quoteNumber: "Q-12345",
 *   quoteDetails: { total: "1500.00" }
 * });
 *
 * // Customer quote status notification
 * await sendEmail({
 *   to: "customer@example.com",
 *   name: "John",
 *   emailType: "customer-quote-status",
 *   quoteNumber: "Q-12345",
 *   status: "ACCEPTED",
 *   reason: "Optional reason for declined quotes"
 * });
 */
export const sendEmail = async (
  data: SendEmailDto
): Promise<SendEmailResponse> => {
  const response = await fetch("/api/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Try to parse error returned by the API
    let errorMessage = "Failed to send email";
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.error ?? errorMessage;
    } catch {
      /* ignore */
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as SendEmailResponse;
};
