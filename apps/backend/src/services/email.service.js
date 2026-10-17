import pool from "../config/db.js";
import { env } from "../config/env.js";

/**
 * Standard CSS styles for branded Kruu transactional emails.
 */
const EMAIL_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0c0c; color: #ededed; margin: 0; padding: 24px; }
  .container { max-width: 580px; margin: 0 auto; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden; }
  .header { padding: 32px 32px 24px; background: linear-gradient(135deg, #18181b 0%, #09090b 100%); border-bottom: 1px solid #262626; text-align: left; }
  .brand { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .brand-name { font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
  .badge { display: inline-block; padding: 4px 10px; background-color: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 600; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge-purple { background-color: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.3); color: #c084fc; }
  .badge-emerald { background-color: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); color: #34d399; }
  .title { font-size: 22px; font-weight: 700; color: #ffffff; margin: 12px 0 6px; letter-spacing: -0.01em; }
  .subtitle { font-size: 13px; color: #a1a1aa; margin: 0; line-height: 1.5; }
  .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #d4d4d8; }
  .otp-box { background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
  .otp-code { font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.3em; color: #60a5fa; margin: 8px 0; display: inline-block; }
  .otp-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #71717a; letter-spacing: 0.08em; }
  .notice { font-size: 12px; color: #a1a1aa; margin-top: 16px; line-height: 1.5; }
  .btn { display: inline-block; padding: 12px 28px; background-color: #ffffff; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; margin: 20px 0; }
  .receipt-box { background-color: #1c1c1c; border: 1px solid #2e2e2e; border-radius: 12px; padding: 20px; margin: 24px 0; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #262626; font-size: 13px; }
  .row:last-child { border-bottom: none; }
  .label { color: #a1a1aa; }
  .value { font-weight: 600; color: #ffffff; text-align: right; }
  .footer { padding: 24px 32px; background-color: #0a0a0a; border-top: 1px solid #222222; font-size: 11px; color: #71717a; text-align: center; line-height: 1.6; }
`;

/**
 * Generates branded HTML and plain-text content for registration OTP verification.
 */
export function buildRegistrationOtpEmail({
  recipientName = "Developer",
  otpCode,
  expiryMinutes = 5,
}) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Kruu account</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <span class="brand-name">Kruu</span>
        <span class="badge">Registration Verification</span>
      </div>
      <h1 class="title">Verify your email address</h1>
      <p class="subtitle">Complete your developer registration to access APIs and tool discovery.</p>
    </div>
    <div class="content">
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>Thank you for creating an account on Kruu. Enter the one-time verification code below to verify your email and activate your account:</p>
      
      <div class="otp-box">
        <div class="otp-label">One-Time Verification Code</div>
        <div class="otp-code">${otpCode}</div>
        <div class="notice">Expires in <strong>${expiryMinutes} minutes</strong> • Single use only</div>
      </div>

      <p class="notice">
        If you didn't attempt to sign up for Kruu, please ignore this email. Never share this code with anyone.
      </p>
    </div>
    <div class="footer">
      <p>Kruu Developer Platform • Edge Gateway & Software Directory</p>
      <p>Automated security notification. For help, contact support@kruu.online.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hello ${recipientName},

Thank you for creating an account on Kruu.

Your one-time verification code is: ${otpCode}

This code will expire in ${expiryMinutes} minutes and can only be used once.

If you didn't create a Kruu account, you can safely ignore this email. Never share this code with anyone.

--
Kruu Developer Platform
https://kruu.online
  `.trim();

  return { html, text };
}

/**
 * Generates branded HTML and plain-text content for password reset OTP.
 */
export function buildPasswordResetOtpEmail({
  recipientName = "Developer",
  otpCode,
  expiryMinutes = 5,
}) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Kruu password</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <span class="brand-name">Kruu</span>
        <span class="badge badge-purple">Password Recovery</span>
      </div>
      <h1 class="title">Password Reset Request</h1>
      <p class="subtitle">Use the verification code below to reset your Kruu password.</p>
    </div>
    <div class="content">
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>We received a request to reset the password for your Kruu developer account. Enter this verification code to proceed:</p>
      
      <div class="otp-box">
        <div class="otp-label">Password Reset Code</div>
        <div class="otp-code">${otpCode}</div>
        <div class="notice">Expires in <strong>${expiryMinutes} minutes</strong> • Single use only</div>
      </div>

      <p class="notice">
        <strong>Security Notice:</strong> If you did not request a password reset, your password has not been changed. You can safely disregard this email or check your active sessions if you suspect unauthorized activity.
      </p>
    </div>
    <div class="footer">
      <p>Kruu Developer Platform • Edge Gateway & Software Directory</p>
      <p>Automated security notification. For help, contact support@kruu.online.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hello ${recipientName},

We received a request to reset the password for your Kruu developer account.

Your password reset verification code is: ${otpCode}

This code will expire in ${expiryMinutes} minutes and can only be used once.

Security Notice: If you did not request a password reset, please ignore this email. Your current password remains unchanged.

--
Kruu Developer Platform
https://kruu.online
  `.trim();

  return { html, text };
}

/**
 * Generates branded HTML and plain-text content for the welcome email.
 */
export function buildWelcomeEmail({
  recipientName = "Developer",
  dashboardUrl,
}) {
  const targetDashboardUrl = dashboardUrl || `${env.frontendUrl}/profile`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kruu</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <span class="brand-name">Kruu</span>
        <span class="badge badge-emerald">Account Activated</span>
      </div>
      <h1 class="title">Welcome to Kruu</h1>
      <p class="subtitle">Your developer workspace is ready for action.</p>
    </div>
    <div class="content">
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>Your Kruu account has been successfully verified! You now have full access to our curated software discovery directory, verified API marketplace, and developer tooling.</p>
      
      <div class="receipt-box">
        <div class="row">
          <span class="label">Developer Profile</span>
          <span class="value">${recipientName}</span>
        </div>
        <div class="row">
          <span class="label">API Key Provisioning</span>
          <span class="value" style="color: #34d399;">Enabled</span>
        </div>
        <div class="row">
          <span class="label">Marketplace Entitlements</span>
          <span class="value" style="color: #60a5fa;">Available</span>
        </div>
      </div>

      <p>Here's what you can do right now:</p>
      <ul style="padding-left: 20px; line-height: 1.8; color: #a1a1aa;">
        <li>Generate scoped API keys with rate-limiting analytics</li>
        <li>Explore and rent high-performance developer APIs</li>
        <li>Compare microservices and developer productivity tools</li>
      </ul>

      <center>
        <a href="${targetDashboardUrl}" class="btn">Open Developer Dashboard</a>
      </center>
    </div>
    <div class="footer">
      <p>Kruu Developer Platform • Edge Gateway & Software Directory</p>
      <p>© ${new Date().getFullYear()} Kruu. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Welcome to Kruu, ${recipientName}!

Your Kruu developer account is now active and verified.

You can now:
- Generate scoped API keys with granular rate limits
- Discover and test curated developer tools
- Rent APIs and manage marketplace entitlements

Open your dashboard: ${targetDashboardUrl}

--
Kruu Developer Platform
https://kruu.online
  `.trim();

  return { html, text };
}

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
  <title>Kruu Purchase Confirmation</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <span class="brand-name">Kruu</span>
        <span class="badge">Payment Verified</span>
      </div>
      <h1 class="title">Purchase Confirmed</h1>
      <p class="subtitle">Your access entitlement for ${productName} is now active.</p>
    </div>
    <div class="content">
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>Thank you for purchasing an API plan on Kruu. Your payment has been processed and your developer entitlement has been provisioned.</p>
      
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
      <p>Kruu Developer Platform • Edge Gateway & Microservice Directory</p>
      <p>For your security, raw API keys are never transmitted via email. View and rotate your keys securely inside your account.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Enqueues a registration OTP verification email into PostgreSQL outbox.
 */
export async function queueRegistrationOtpEmail({
  recipientEmail,
  recipientName = "Developer",
  otpCode,
  otpId,
}) {
  const referenceId = `reg_otp_${otpId || Date.now()}`;
  const subject = `Your Kruu Verification Code: ${otpCode}`;
  const { html, text } = buildRegistrationOtpEmail({
    recipientName,
    otpCode,
    expiryMinutes: 5,
  });

  return await enqueueAndDispatchOutbox({
    recipientEmail,
    recipientName,
    templateType: "registration_otp",
    subject,
    htmlContent: html,
    textContent: text,
    referenceId,
  });
}

/**
 * Enqueues a password-reset OTP verification email into PostgreSQL outbox.
 */
export async function queuePasswordResetOtpEmail({
  recipientEmail,
  recipientName = "Developer",
  otpCode,
  otpId,
}) {
  const referenceId = `pwd_otp_${otpId || Date.now()}`;
  const subject = `Your Kruu Password Reset Code: ${otpCode}`;
  const { html, text } = buildPasswordResetOtpEmail({
    recipientName,
    otpCode,
    expiryMinutes: 5,
  });

  return await enqueueAndDispatchOutbox({
    recipientEmail,
    recipientName,
    templateType: "password_reset_otp",
    subject,
    htmlContent: html,
    textContent: text,
    referenceId,
  });
}

/**
 * Enqueues an account activation welcome email into PostgreSQL outbox.
 */
export async function queueWelcomeEmail({
  recipientEmail,
  recipientName = "Developer",
  userId,
}) {
  const referenceId = `welcome_${userId || Date.now()}`;
  const subject = `Welcome to Kruu — Developer Platform & API Marketplace`;
  const { html, text } = buildWelcomeEmail({
    recipientName,
    dashboardUrl: `${env.frontendUrl}/profile`,
  });

  return await enqueueAndDispatchOutbox({
    recipientEmail,
    recipientName,
    templateType: "welcome",
    subject,
    htmlContent: html,
    textContent: text,
    referenceId,
  });
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

  const subject = `Purchase Confirmation: ${productName} (${planName}) - Kruu`;
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

  const textContent = `
Thank you for your purchase on Kruu!
Product: ${productName} (${planName})
Amount: ${formattedAmount} ${currency}
Reference: ${purchaseReference}
Date: ${purchaseDate}

Access your dashboard: ${dashboardUrl}
  `.trim();

  return await enqueueAndDispatchOutbox({
    recipientEmail,
    recipientName,
    templateType: "purchase_confirmation",
    subject,
    htmlContent,
    textContent,
    referenceId: purchaseReference,
  });
}

/**
 * Shared helper to insert into email_outbox and trigger async dispatch.
 */
async function enqueueAndDispatchOutbox({
  recipientEmail,
  recipientName,
  templateType,
  subject,
  htmlContent,
  textContent,
  referenceId,
}) {
  try {
    const insertRes = await pool.query(
      `
      INSERT INTO email_outbox (
        recipient_email,
        recipient_name,
        template_type,
        subject,
        html_content,
        text_content,
        reference_id,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      ON CONFLICT (reference_id, template_type) DO NOTHING
      RETURNING id, status, recipient_email, template_type, reference_id;
      `,
      [recipientEmail, recipientName, templateType, subject, htmlContent, textContent, referenceId]
    );

    let record = insertRes.rows[0];
    if (!record) {
      // Conflict: fetch existing record for idempotency
      const existing = await pool.query(
        "SELECT id, status, recipient_email, template_type, reference_id FROM email_outbox WHERE reference_id = $1 AND template_type = $2 LIMIT 1;",
        [referenceId, templateType]
      );
      record = existing.rows[0];
    }

    let dispatchResult = { success: false, status: record?.status || "pending" };
    if (record && record.status !== "sent") {
      dispatchResult = await dispatchOutboxEmailAsync(record.id);
    }

    return {
      queued: true,
      id: record?.id,
      outboxId: record?.id,
      status: dispatchResult.status || record?.status || "pending",
      recipientEmail,
      templateType,
      referenceId,
      dispatched: dispatchResult.success,
      deliveryError: dispatchResult.error,
    };
  } catch (err) {
    console.error(`Non-fatal: could not enqueue email (${templateType}):`, err.message);
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
    if (!email) return { success: false, status: "not_found", error: "Outbox item not found" };
    if (email.status === "sent") return { success: true, status: "sent" };
  
    // Check Brevo credentials
    if (!env.brevoApiKey) {
      const errMsg = "BREVO_API_KEY environment variable is not configured on this server.";
      console.warn(`[Brevo Email] BREVO_API_KEY is not configured. Email to ${email.recipient_email} marked as 'config_missing'.`);
      await pool.query(
        `
        UPDATE email_outbox
        SET status = 'config_missing',
            last_error = $2,
            updated_at = NOW()
        WHERE id = $1;
        `,
        [outboxId, errMsg]
      );
      return { success: false, status: "config_missing", error: errMsg };
    }

    // Call Brevo transactional email endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "api-key": env.brevoApiKey,
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: env.brevoSenderName || "Kruu",
            email: env.brevoSenderEmail || "support@kruu.online",
          },
          to: [
            {
              email: email.recipient_email,
              name: email.recipient_name || "Developer",
            },
          ],
          subject: email.subject,
          htmlContent: email.html_content,
          textContent: email.text_content || undefined,
        }),
      });

      clearTimeout(timeoutId);

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
        console.log(`[Brevo Email] Successfully accepted by Brevo for delivery to ${email.recipient_email} (${email.template_type}).`);
        return { success: true, status: "sent" };
      } else {
        const errText = await response.text();
        let parsedMessage = errText;
        try {
          const parsed = JSON.parse(errText);
          parsedMessage = parsed.message || errText;
        } catch {}

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
        return {
          success: false,
          status: "failed",
          statusCode: response.status,
          error: parsedMessage,
        };
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      throw fetchErr;
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
    return { success: false, status: "failed", error: err.message };
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
