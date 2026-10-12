import pool from "../config/db.js";
import { env } from "../config/env.js";

/**
 * Generates modern, responsive HTML content for purchase confirmation email.
 */
export function buildPurchaseConfirmationHtml({
  customerName = "Developer",
  productName,
  planName,
  amountPaidFormatted,
  currency,
  purchaseReference,
  purchaseDate,
  dashboardUrl,
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hub&Hub Purchase Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0c0c; color: #ededed; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden; }
    .header { padding: 32px 32px 24px; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #262626; }
    .badge { display: inline-block; padding: 4px 10px; background-color: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 600; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.05em; }
    .title { font-size: 24px; font-weight: 700; color: #ffffff; margin: 12px 0 6px; }
    .subtitle { font-size: 14px; color: #a1a1aa; margin: 0; }
    .content { padding: 32px; }
    .receipt-box { background-color: #1c1c1c; border: 1px solid #2e2e2e; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #262626; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #a1a1aa; }
    .value { font-weight: 600; color: #ffffff; text-align: right; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
    .footer { padding: 24px 32px; background-color: #0f0f0f; border-top: 1px solid #222222; font-size: 12px; color: #71717a; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Payment Verified</div>
      <h1 class="title">Purchase Confirmed</h1>
      <p class="subtitle">Your access entitlement for ${productName} is now active.</p>
    </div>
    <div class="content">
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>Thank you for purchasing an API plan on Hub&Hub. Your payment has been processed and your developer entitlement has been provisioned.</p>
      
      <div class="receipt-box">
        <div class="row">
          <span class="label">API Product</span>
          <span class="value">${productName}</span>
        </div>
        <div class="row">
          <span class="label">Selected Plan</span>
          <span class="value">${planName}</span>
        </div>
        <div class="row">
          <span class="label">Amount Paid</span>
          <span class="value">${amountPaidFormatted} ${currency}</span>
        </div>
        <div class="row">
          <span class="label">Order Reference</span>
          <span class="value" style="font-family: monospace;">${purchaseReference}</span>
        </div>
        <div class="row">
          <span class="label">Date</span>
          <span class="value">${purchaseDate}</span>
        </div>
        <div class="row">
          <span class="label">Entitlement Status</span>
          <span class="value" style="color: #34d399;">Active (Ready to Use)</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #a1a1aa;">
        You can now generate product-scoped API keys and test requests directly in your dashboard:
      </p>

      <center>
        <a href="${dashboardUrl}" class="btn">Open Developer Dashboard</a>
      </center>
    </div>
    <div class="footer">
      <p>Hub&Hub Developer Platform • Edge Gateway & Microservice Directory</p>
      <p>For your security, raw API keys are never transmitted via email. View and rotate your keys securely inside your account.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Enqueues a purchase confirmation email into PostgreSQL outbox.
 * Prevents duplicates via UNIQUE (reference_id, template_type) index.
 */
export async function queuePurchaseConfirmationEmail({
  recipientEmail,
  recipientName,
  productName,
  planName,
  amountPaid, // Minor units
  amountPaidFormatted,
  currency,
  purchaseReference,
}) {
  const formattedAmount =
    amountPaidFormatted ||
    (amountPaid !== undefined && amountPaid !== null ? (amountPaid / 100).toFixed(2) : "0.00");
  const purchaseDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const dashboardUrl = `${env.frontendUrl}/#my-apis`;

  const subject = `Purchase Confirmation: ${productName} (${planName}) - Hub&Hub`;
  const htmlContent = buildPurchaseConfirmationHtml({
    customerName: recipientName || "Developer",
    productName,
    planName,
    amountPaidFormatted: formattedAmount,
    currency,
    purchaseReference,
    purchaseDate,
    dashboardUrl,
  });

  try {
    const insertRes = await pool.query(
      `
      INSERT INTO email_outbox (
        recipient_email,
        recipient_name,
        template_type,
        subject,
        html_content,
        reference_id,
        status
      )
      VALUES ($1, $2, 'purchase_confirmation', $3, $4, $5, 'pending')
      ON CONFLICT (reference_id, template_type) DO NOTHING
      RETURNING id, status, recipient_email, template_type, reference_id;
      `,
      [recipientEmail, recipientName, subject, htmlContent, purchaseReference]
    );

    let record = insertRes.rows[0];
    if (record) {
      // Asynchronously process the outbox item without blocking HTTP response
      dispatchOutboxEmailAsync(record.id);
    } else {
      // Conflict: fetch existing record
      const existing = await pool.query(
        "SELECT id, status, recipient_email, template_type, reference_id FROM email_outbox WHERE reference_id = $1 AND template_type = 'purchase_confirmation' LIMIT 1;",
        [purchaseReference]
      );
      record = existing.rows[0];
    }

    return {
      queued: true,
      id: record?.id,
      outboxId: record?.id,
      status: record?.status || "pending",
      recipientEmail,
      templateType: "purchase_confirmation",
      referenceId: purchaseReference,
    };
  } catch (err) {
    console.error("Non-fatal: could not enqueue email into outbox:", err.message);
    return { queued: false, error: err.message };
  }
}

/**
 * Dispatches an email from the outbox using Brevo REST API.
 * Handles missing configuration honestly without claiming fake delivery.
 */
export async function dispatchOutboxEmailAsync(outboxId) {
  try {
    const res = await pool.query(
      "SELECT * FROM email_outbox WHERE id = $1 LIMIT 1;",
      [outboxId]
    );
    const email = res.rows[0];
    if (!email || email.status === "sent") return;

    // Check Brevo credentials
    if (!env.brevoApiKey) {
      console.warn(`[Brevo Email] BREVO_API_KEY is not configured. Email to ${email.recipient_email} marked as 'config_missing'.`);
      await pool.query(
        `
        UPDATE email_outbox
        SET status = 'config_missing',
            last_error = 'BREVO_API_KEY environment variable is not configured on this server.',
            updated_at = NOW()
        WHERE id = $1;
        `,
        [outboxId]
      );
      return;
    }

    // Call Brevo transactional email endpoint
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: env.brevoSenderName || "Hub&Hub Platform",
          email: env.brevoSenderEmail,
        },
        to: [
          {
            email: email.recipient_email,
            name: email.recipient_name || "Developer",
          },
        ],
        subject: email.subject,
        htmlContent: email.html_content,
      }),
    });

    if (response.ok) {
      await pool.query(
        `
        UPDATE email_outbox
        SET status = 'sent',
            sent_at = NOW(),
            last_error = NULL,
            updated_at = NOW()
        WHERE id = $1;
        `,
        [outboxId]
      );
      console.log(`[Brevo Email] Successfully sent confirmation email to ${email.recipient_email}.`);
    } else {
      const errText = await response.text();
      await pool.query(
        `
        UPDATE email_outbox
        SET status = 'failed',
            retry_count = retry_count + 1,
            last_error = $2,
            updated_at = NOW()
        WHERE id = $1;
        `,
        [outboxId, `Brevo API error ${response.status}: ${errText.slice(0, 500)}`]
      );
      console.warn(`[Brevo Email] Provider rejected delivery (${response.status}): ${errText}`);
    }
  } catch (err) {
    console.warn(`[Brevo Email] Network error dispatching outbox ID ${outboxId}:`, err.message);
    await pool.query(
      `
      UPDATE email_outbox
      SET status = 'failed',
          retry_count = retry_count + 1,
          last_error = $2,
          updated_at = NOW()
      WHERE id = $1;
      `,
      [outboxId, err.message]
    ).catch(() => {});
  }
}

/**
 * Retrieves the current status of an email in the outbox.
 */
export async function getEmailOutboxStatus(referenceId, templateType = "purchase_confirmation") {
  const res = await pool.query(
    "SELECT * FROM email_outbox WHERE reference_id = $1 AND template_type = $2 LIMIT 1;",
    [referenceId, templateType]
  );
  if (!res.rows[0]) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    recipientEmail: row.recipient_email,
    templateType: row.template_type,
    referenceId: row.reference_id,
    status: row.status,
    sentAt: row.sent_at,
    lastError: row.last_error,
  };
}

