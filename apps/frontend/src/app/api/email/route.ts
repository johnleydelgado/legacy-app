// app/api/send-greeting/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  SESv2Client,
  SendEmailCommand, // still v2, but we'll use its `Raw` option
} from "@aws-sdk/client-sesv2";
import { COMPANY_INFO } from "@/constants/company-info";

/* ───────────────────────── SES client ───────────────────────── */
const region = process.env.NEXT_PUBLIC_AMPLIFY_AWS_REGION ?? "us-east-1";
const accessKeyId = process.env.NEXT_PUBLIC_AMPLIFY_AWS_ACCESS_KEY;
const secretAccessKey = process.env.NEXT_PUBLIC_AMPLIFY_AWS_SECRET_ACCESS_KEY;

// Validate AWS credentials
if (!accessKeyId || !secretAccessKey) {
  console.error(
    "Missing AWS credentials. Please check your environment variables."
  );
}

const sesClient = new SESv2Client({
  region,
  credentials: {
    accessKeyId: accessKeyId as string,
    secretAccessKey: secretAccessKey as string,
  },
  endpoint: `https://email.${region}.amazonaws.com`,
  maxAttempts: 3,
});

/* ───────────────────────── Email Templates ───────────────────────── */
const getQuoteApprovalHtml = (
  name: string,
  tokenHash: string,
  siteUrl: string,
  quoteNumber: string,
  quoteDate: string,
  email: string
) => `
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quotation – ${quoteNumber}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f2f2f2; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2;">
      <tr>
        <td align="center" style="padding:24px 0;">
          <!-- Outer container -->
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <!-- Brand / Logo -------------------------------------------------->
            <tr>
              <td align="center" style="padding:24px;">
                <img src="https://legacyknitting-app.s3.us-east-1.amazonaws.com/assets/LegacyLogo.png" alt="legacy knitting logo" width="140" style="display:block; border:0; outline:none; text-decoration:none;" />
              </td>
            </tr>

            <!-- Introduction ------------------------------------------------->
            <tr>
              <td style="padding:0 40px 24px; font-size:16px; color:#1f2937;">
                <p style="margin:0 0 12px;">Dear ${name},</p>
                <p style="margin:0;">Please find below the quotation <strong># ${quoteNumber}</strong> dated <strong>${quoteDate}</strong>. We kindly invite you to review the details and confirm your acceptance at your earliest convenience.</p>
              </td>
            </tr>

            <!-- Quote Summary ----------------------------------------------->
            <tr>
              <td style="padding:0 40px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef; border-radius:6px; font-size:14px; color:#495057;">
                  <tr>
                    <td style="padding:12px 20px;">Quote&nbsp;Reference</td>
                    <td style="padding:12px 20px;" align="right"><strong>${quoteNumber}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:12px 20px; background:#f7fafc;">Date</td>
                    <td style="padding:12px 20px; background:#f7fafc;" align="right">${quoteDate}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Call‑to‑Action ----------------------------------------------->
            <tr>
              <td align="center" style="padding:0 40px 32px;">
                <a href="${siteUrl}/quotes/approve?token=${tokenHash}&email=${encodeURIComponent(
  email
)}"style="display:inline-block; background:#27705c; color:#ffffff; padding:14px 28px; border-radius:6px; font-size:15px; font-weight:500; text-decoration:none;">Review and Approve Quotation</a>
              </td>
            </tr>

            <!-- Support / Closing ------------------------------------------->
            <tr>
              <td style="padding:0 40px 32px; font-size:14px; color:#6c757d;">
                <p style="margin:0;">Should you require any clarification or amendments, please do not hesitate to reply to this email or contact us on <a href="tel:${
                  COMPANY_INFO.address.phone
                }" style="color:#27705c; text-decoration:none;">${
  COMPANY_INFO.address.phone
}</a>.</p>
              </td>
            </tr>

            <!-- Footer ------------------------------------------------------->
            <tr>
              <td style="background:#f0f0f0; padding:20px 40px; font-size:12px; color:#6c757d; text-align:center;">
                © 2025 ${COMPANY_INFO.name} . All rights reserved.<br />
                ${COMPANY_INFO.address.street1} • ${
  COMPANY_INFO.address.city
} ${COMPANY_INFO.address.state} ${COMPANY_INFO.address.zip}
              </td>
            </tr>
          </table>
          <!-- /Outer container -->
        </td>
      </tr>
    </table>
  </body>
</html>`;

const getQuoteDeclinedHtml = (
  name: string,
  quoteNumber: string,
  reason?: string
) => `
  <body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:20px 0">

    <!-- Brand header -->
    <div style="text-align:center;padding-bottom:30px">
      <!-- Logo (optional) -->
      <img
        src="https://legacyknitting-app.s3.us-east-1.amazonaws.com/assets/LegacyLogo.png"       
        alt="Legacy Knitting Logo"
        style="width:120px;height:auto;display:block;margin:0 auto 12px"
      />
    </div>

    <!-- Card -->
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
      <!-- Banner -->
      <div style="background:linear-gradient(135deg, #dc3545 0%, #c82333 100%);padding:30px;text-align:center">
        <h2 style="color:#fff;font-size:28px;margin:0 0 10px 0;font-weight:600">Quote Declined</h2>
        <p style="color:#f8d7da;font-size:16px;margin:0">${name} has declined the quote.</p>
      </div>

      <!-- Body -->
      <div style="padding:30px">
        <!-- Quote details -->
        <div style="border-left:4px solid #dc3545;padding-left:20px;margin-bottom:25px">
          <h3 style="color:#dc3545;font-size:18px;margin:0 0 5px 0">Quote #${quoteNumber}</h3>
          <p style="color:#6c757d;font-size:14px;margin:0">Declined on ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Customer information -->
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:25px">
          <h4 style="color:#495057;font-size:16px;margin:0 0 15px 0">Customer Information</h4>
          <div style="padding:10px 0;border-bottom:1px solid #e9ecef">
            <span style="color:#495057;font-weight:600">Customer:</span>
            <span style="color:#6c757d;margin-left:10px">${name}</span>
          </div>
          <div style="padding:10px 0">
            <span style="color:#495057;font-weight:600">Status:</span>
            <span style="color:#dc3545;margin-left:10px;font-weight:600">DECLINED</span>
          </div>

          <!-- Decline reason (optional) -->
          ${
            reason
              ? `
          <div style="padding:10px 0">
            <span style="color:#495057;font-weight:600">Reason:</span>
            <div style="color:#6c757d;margin-top:5px;padding:10px;background:#fff;border-radius:4px;border-left:3px solid #dc3545">${reason}</div>
          </div>`
              : ""
          }
        </div>

        <!-- Follow-up note -->
        <div style="background:#fff3cd;border-radius:8px;padding:15px;text-align:center;border-left:4px solid #ffc107">
          <p style="color:#856404;font-size:14px;margin:0;font-weight:500">
            Please consider contacting the customer to discuss their concerns and explore potential revisions.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0;font-size:12px;color:#6c757d">
      © 2025 Legacy Knitting. All rights reserved.
    </div>
  </div>
</body>`;

const getQuoteAcceptedHtml = (
  name: string,
  quoteNumber: string,
  quoteDetails?: any
) => `
   <body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:20px 0">
    <!-- Brand header -->
    <div style="text-align:center;padding-bottom:30px">
      <!-- Logo (optional) -->
      <img
        src="https://legacyknitting-app.s3.us-east-1.amazonaws.com/assets/LegacyLogo.png" 
        alt="Legacy Knitting Logo"
        style="width:120px;height:auto;display:block;margin:0 auto 12px"
      />
    </div>

    <!-- Card -->
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
      <!-- Banner -->
      <div style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);padding:30px;text-align:center">
        <h2 style="color:#fff;font-size:28px;margin:0 0 10px 0;font-weight:600">Quote Accepted</h2>
        <p style="color:#d4edda;font-size:16px;margin:0">${name} has accepted the quote.</p>
      </div>

      <!-- Body -->
      <div style="padding:30px">
        <!-- Quote details -->
        <div style="border-left:4px solid #28a745;padding-left:20px;margin-bottom:25px">
          <h3 style="color:#28a745;font-size:18px;margin:0 0 5px 0">Quote #${quoteNumber}</h3>
          <p style="color:#6c757d;font-size:14px;margin:0">Accepted on ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Customer information -->
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:25px">
          <h4 style="color:#495057;font-size:16px;margin:0 0 15px 0">Customer Information</h4>
          <div style="padding:10px 0;border-bottom:1px solid #e9ecef">
            <span style="color:#495057;font-weight:600">Customer:</span>
            <span style="color:#6c757d;margin-left:10px">${name}</span>
          </div>
          <div style="padding:10px 0">
            <span style="color:#495057;font-weight:600">Status:</span>
            <span style="color:#28a745;margin-left:10px;font-weight:600">ACCEPTED</span>
          </div>
        </div>

        <!-- Notifications -->
        <div style="text-align:center">
          <div style="background:#d1ecf1;border-radius:8px;padding:15px;margin-bottom:20px;border-left:4px solid #17a2b8">
            <p style="color:#0c5460;font-size:14px;margin:0;font-weight:500">
              Next Steps: The quote has been converted to an order. You may begin production planning and scheduling.
            </p>
          </div>
          <div style="background:#d4edda;border-radius:8px;padding:15px;margin-bottom:20px;border-left:4px solid #28a745">
            <p style="color:#155724;font-size:14px;margin:0;font-weight:500">
              Action Required: Please contact the customer to confirm the delivery timeline and any final details.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0;font-size:12px;color:#6c757d">
      © 2025 Legacy Knitting. All rights reserved.
    </div>
  </div>
</body>
`;

/**
 * Build a customer-notification email for Quote status updates.
 *
 * @param name        Customer’s display name
 * @param quoteNumber Internal quote reference
 * @param status      "ACCEPTED" | "DECLINED"
 * @param reason      (optional) reason text – shown only if status is DECLINED
 */
const getCustomerQuoteStatusHtml = (
  name: string,
  quoteNumber: string,
  status: "ACCEPTED" | "DECLINED",
  reason?: string
) => {
  /* ── Colour / copy variations ─────────────────────────────────────────── */
  const isAccepted = status === "ACCEPTED";

  const bannerGradient = isAccepted
    ? "linear-gradient(135deg, #28a745 0%, #20c997 100%)"
    : "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";

  const bannerHeading = isAccepted ? "Quote Approved" : "Quote Declined";
  const statusColour = isAccepted ? "#28a745" : "#dc3545";
  const bodyIntro = isAccepted
    ? `Dear ${name},<br><br>Thank you for approving Quote #${quoteNumber}. We’re excited to move forward with your order. Our production team will now begin planning, and you’ll receive a detailed schedule and shipment information shortly.`
    : `Dear ${name},<br><br>We understand Quote #${quoteNumber} did not meet your needs. We value your feedback and would appreciate the opportunity to discuss any changes that could better suit your requirements.`;

  return `
  <body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:20px 0">

      <!-- Brand header -->
      <div style="text-align:center;padding-bottom:30px">
        <img
          src="https://legacyknitting-app.s3.us-east-1.amazonaws.com/assets/LegacyLogo.png"
          alt="Legacy Knitting Logo"
          style="width:120px;height:auto;display:block;margin:0 auto 12px"
        />
      </div>

      <!-- Card -->
      <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">

        <!-- Banner -->
        <div style="background:${bannerGradient};padding:30px;text-align:center">
          <h2 style="color:#fff;font-size:28px;margin:0 0 10px 0;font-weight:600">${bannerHeading}</h2>
          <p style="color:${
            isAccepted ? "#d4edda" : "#f8d7da"
          };font-size:16px;margin:0">
            Quote #${quoteNumber}
          </p>
        </div>

        <!-- Body -->
        <div style="padding:30px;line-height:1.55;font-size:15px;color:#495057">
          ${bodyIntro}

          ${
            !isAccepted && reason
              ? `<br><br><strong>Reason provided:</strong><br>
               <div style="margin-top:6px;padding:12px;background:#f8f9fa;border-left:3px solid #dc3545;border-radius:4px;color:#6c757d">
                 ${reason}
               </div>`
              : ""
          }

          <br><br>
          If you have any questions, please contact your sales representative directly.
          <br><br>

          <!-- Signature (simple) -->
          Kind regards,<br>
          <strong>The Legacy Knitting Team</strong>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:20px 0;font-size:12px;color:#6c757d">
        © 2025 Legacy Knitting. All rights reserved.
      </div>
    </div>
  </body>`;
};

export async function POST(req: NextRequest) {
  try {
    const {
      to,
      name,
      tokenHash,
      emailType,
      orderNumber,
      orderDetails,
      quoteNumber,
      quoteDate,
      reason,
      quoteDetails,
      status,
    } = await req.json();

    if (!to || !name) {
      return NextResponse.json(
        { error: '"to" (email) and "name" are required' },
        { status: 400 }
      );
    }

    // Validate AWS credentials before attempting to send
    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        {
          error:
            "AWS credentials not configured. Please check your environment variables.",
        },
        { status: 500 }
      );
    }

    // Handle both single email and array of emails
    const emails = Array.isArray(to) ? to : [to];

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "At least one email address is required" },
        { status: 400 }
      );
    }

    /* ───────────── 1. resolve site URL (for links) ───────────── */
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    /* ───────────── 2. build MIME message based on email type ───────────── */
    const from =
      process.env.NEXT_PUBLIC_FROM_EMAIL ?? "noreply@legacyknitting.com";

    let subject: string;

    // Set subject based on email type
    switch (emailType) {
      case "customer-quote-status":
        if (!quoteNumber || !status) {
          return NextResponse.json(
            {
              error:
                '"quoteNumber" and "status" are required for customer quote status emails',
            },
            { status: 400 }
          );
        }
        subject = `Quote #${quoteNumber} ${
          status === "ACCEPTED" ? "Approved" : "Update"
        } - Legacy Knitting`;
        break;

      case "quote-declined":
        if (!quoteNumber) {
          return NextResponse.json(
            { error: '"quoteNumber" is required for quote declined emails' },
            { status: 400 }
          );
        }
        subject = `Quote #${quoteNumber} Declined - Legacy Knitting`;
        break;

      case "quote-accepted":
        if (!quoteNumber) {
          return NextResponse.json(
            { error: '"quoteNumber" is required for quote accepted emails' },
            { status: 400 }
          );
        }
        subject = `Quote #${quoteNumber} Accepted - Legacy Knitting`;
        break;

      case "quote-approval":
      default:
        if (!tokenHash) {
          return NextResponse.json(
            { error: '"tokenHash" is required for quote approval emails' },
            { status: 400 }
          );
        }
        subject = "Quote Approval Request - Legacy Knitting";
        break;
    }

    console.log("from", from, "to", emails);

    /* ───────────── 3. send via SES to multiple recipients ───────────── */
    const emailPromises = emails.map(async (email) => {
      // Generate personalized HTML for each recipient
      let html: string;

      switch (emailType) {
        case "customer-quote-status":
          html = getCustomerQuoteStatusHtml(name, quoteNumber, status, reason);
          break;
        case "quote-declined":
          html = getQuoteDeclinedHtml(name, quoteNumber, reason);
          break;
        case "quote-accepted":
          html = getQuoteAcceptedHtml(name, quoteNumber, quoteDetails);
          break;
        case "quote-approval":
        default:
          html = getQuoteApprovalHtml(
            name,
            tokenHash,
            siteUrl,
            quoteNumber ?? "N/A",
            quoteDate ?? new Date().toLocaleDateString(),
            email
          );
          break;
      }

      const raw = [
        `From: ${from}`,
        `To: ${email}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        html,
        ``,
      ].join("\r\n");

      const cmd = new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [email] },
        Content: { Raw: { Data: Buffer.from(raw) } },
      });

      const result = await sesClient.send(cmd);
      return { email, messageId: result.MessageId };
    });

    const results = await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      results,
      totalSent: results.length,
    });
  } catch (err) {
    console.error("Email sending error:", err);

    // Provide more specific error messages
    let errorMessage = "Failed to send email";
    if (err instanceof Error) {
      if (err.message.includes("ENOTFOUND")) {
        errorMessage =
          "AWS SES endpoint not found. Please check your AWS configuration and network connectivity.";
        console.error("AWS SES Configuration:", {
          region,
          accessKeyId: accessKeyId ? "SET" : "MISSING",
          secretAccessKey: secretAccessKey ? "SET" : "MISSING",
        });
      } else if (err.message.includes("credentials")) {
        errorMessage =
          "AWS credentials invalid or missing. Please check your environment variables.";
      } else if (err.message.includes("AccessDenied")) {
        errorMessage =
          "AWS SES access denied. Please check your AWS permissions.";
      } else {
        errorMessage = err.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
