import crypto from "crypto";
import Razorpay from "razorpay";
import PDFDocument from "pdfkit";
import pool from "../config/db.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { recordAuditLog } from "./audit.service.js";

/**
 * Initializes Razorpay client if credentials are configured.
 */
function getRazorpayInstance() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return null;
  }
  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
}

/**
 * Retrieves the authenticated user's internship certificate eligibility, payment, and certificate status.
 */
export async function getUserCertificateStatus(userId) {
  const query = `
    SELECT
      ce.id AS eligibility_id,
      ce.program_title,
      ce.organization,
      ce.start_date,
      ce.completion_date,
      ce.status AS eligibility_status,
      ce.notified,
      ce.created_at AS granted_at,
      u.name AS user_name,
      u.email AS user_email,
      ic.id AS certificate_id,
      ic.certificate_number,
      ic.issue_date,
      ic.verification_code,
      ic.download_count,
      cpo.id AS payment_order_id,
      cpo.order_reference,
      cpo.status AS payment_status,
      cpo.amount AS payment_amount,
      cpo.razorpay_payment_id
    FROM internship_certificate_eligibility ce
    JOIN users u ON ce.user_id = u.id
    LEFT JOIN internship_certificates ic ON ce.id = ic.eligibility_id
    LEFT JOIN certificate_payment_orders cpo ON ce.id = cpo.eligibility_id AND cpo.status = 'paid'
    WHERE ce.user_id = $1 AND ce.status != 'revoked'
    ORDER BY (CASE WHEN ce.status IN ('eligible', 'paid', 'issued') THEN 1 ELSE 2 END), ce.created_at DESC
    LIMIT 1;
  `;

  const res = await pool.query(query, [userId]);
  if (!res.rows[0]) {
    return {
      eligible: false,
      eligibilityStatus: "not_eligible",
      message: "No active internship certificate eligibility record found.",
    };
  }

  const row = res.rows[0];
  const hasCertificate = Boolean(row.certificate_id);
  const isPaid = row.payment_status === "paid" || (hasCertificate && row.eligibility_status === "issued");

  let effectiveStatus = row.eligibility_status;
  if (hasCertificate && isPaid) {
    effectiveStatus = "issued";
  } else if (isPaid) {
    effectiveStatus = "paid";
  } else if (row.eligibility_status === "issued" && !isPaid) {
    effectiveStatus = "eligible";
  }

  return {
    eligible: true,
    eligibilityStatus: effectiveStatus,
    programTitle: row.program_title,
    organization: row.organization,
    amountInr: 100,
    eligibility: {
      id: row.eligibility_id,
      programTitle: row.program_title,
      organization: row.organization,
      startDate: row.start_date,
      completionDate: row.completion_date,
      status: effectiveStatus,
      grantedAt: row.granted_at,
      notified: row.notified,
    },
    user: {
      name: row.user_name,
      email: row.user_email,
    },
    payment: {
      isPaid,
      amountInr: 100, // Strictly ₹100 INR
      orderReference: row.order_reference,
      paymentReference: row.razorpay_payment_id,
    },
    certificate: hasCertificate && isPaid
      ? {
          id: row.certificate_id,
          certificateNumber: row.certificate_number,
          issueDate: row.issue_date,
          verificationCode: row.verification_code,
          downloadCount: parseInt(row.download_count || 0, 10),
        }
      : null,
  };
}

/**
 * Creates an authoritative ₹100 INR payment order for an eligible user's certificate.
 * Authoritative price is locked at ₹100 (10,000 paise).
 */
export async function createCertificateOrder(userId) {
  const eligRes = await pool.query(
    `
    SELECT id, program_title, organization, status
    FROM internship_certificate_eligibility
    WHERE user_id = $1 AND status != 'revoked'
    ORDER BY created_at DESC
    LIMIT 1;
    `,
    [userId]
  );

  const eligibility = eligRes.rows[0];
  if (!eligibility) {
    throw new ApiError(403, "You are not currently marked eligible for an internship certificate.");
  }

  // Check if certificate has already been paid and issued
  const certRes = await pool.query(
    `
    SELECT ic.id, ic.certificate_number, ic.verification_code, cpo.status AS payment_status
    FROM internship_certificates ic
    LEFT JOIN certificate_payment_orders cpo ON ic.payment_order_id = cpo.id
    WHERE ic.eligibility_id = $1
    LIMIT 1;
    `,
    [eligibility.id]
  );

  if (certRes.rows[0] && certRes.rows[0].payment_status === "paid") {
    return {
      alreadyPaid: true,
      message: "Certificate fee has already been paid and verified. You may download your certificate.",
      certificateNumber: certRes.rows[0].certificate_number,
      certificate: certRes.rows[0],
    };
  }

  // Authoritative certificate fee: exactly ₹100 INR (10,000 paise)
  const amountPaise = 10000;
  const currency = "INR";
  const orderReference = `ord_cert_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const rzp = getRazorpayInstance();
  const isMock =
    env.razorpayKeyId === "rzp_test_mock" ||
    env.nodeEnv === "test" ||
    process.env.NODE_ENV === "test";

  if (!rzp && !isMock) {
    return {
      alreadyPaid: false,
      configMissing: true,
      message:
        "Razorpay payment integration is awaiting credentials in server configuration. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.",
      amount: amountPaise,
      amountInr: 100,
      currency,
      programTitle: eligibility.program_title,
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create internal certificate order record
    const orderRes = await client.query(
      `
      INSERT INTO certificate_payment_orders (
        order_reference, user_id, eligibility_id, amount, currency, status
      )
      VALUES ($1, $2, $3, $4, $5, 'created')
      RETURNING id, order_reference;
      `,
      [orderReference, userId, eligibility.id, amountPaise, currency]
    );
    const internalOrder = orderRes.rows[0];

    let rzpOrderId;
    if (isMock) {
      rzpOrderId = `order_cert_mock_${Date.now()}`;
    } else {
      try {
        const rzpOrder = await rzp.orders.create({
          amount: amountPaise,
          currency,
          receipt: internalOrder.order_reference,
          notes: {
            userId,
            eligibilityId: eligibility.id,
            internalOrderId: internalOrder.id,
            type: "internship_certificate",
          },
        });
        rzpOrderId = rzpOrder.id;
      } catch (err) {
        await client.query("UPDATE certificate_payment_orders SET status = 'failed' WHERE id = $1;", [internalOrder.id]);
        await client.query("UPDATE internship_certificate_eligibility SET status = 'payment_failed', updated_at = NOW() WHERE id = $1;", [eligibility.id]);
        throw new ApiError(502, `Razorpay order creation failed: ${err.message}`);
      }
    }

    await client.query(
      "UPDATE certificate_payment_orders SET razorpay_order_id = $1 WHERE id = $2;",
      [rzpOrderId, internalOrder.id]
    );

    // Update eligibility status to payment_pending
    await client.query(
      "UPDATE internship_certificate_eligibility SET status = 'payment_pending', updated_at = NOW() WHERE id = $1;",
      [eligibility.id]
    );

    await client.query("COMMIT");

    return {
      alreadyPaid: false,
      configMissing: false,
      orderId: internalOrder.id,
      orderReference: internalOrder.order_reference,
      razorpayOrderId: rzpOrderId,
      amount: amountPaise,
      amountInr: 100,
      currency,
      keyId: env.razorpayKeyId,
      programTitle: eligibility.program_title,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Cryptographically verifies Razorpay payment signature and issues the certificate.
 * Idempotent against duplicate requests and race conditions.
 */
export async function verifyCertificatePayment({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Missing payment verification parameters (orderId, paymentId, signature).");
  }

  const effectiveSecret = env.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

  // Verify HMAC SHA-256 signature
  if (effectiveSecret) {
    const expectedSignature = crypto
      .createHmac("sha256", effectiveSecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw new ApiError(400, "Payment verification failed. Invalid digital signature.");
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock and retrieve order
    const orderRes = await client.query(
      `
      SELECT id, user_id, eligibility_id, amount, currency, status, order_reference, razorpay_order_id
      FROM certificate_payment_orders
      WHERE (razorpay_order_id = $1 OR id::text = $1 OR order_reference = $1)
      FOR UPDATE;
      `,
      [razorpayOrderId]
    );

    const order = orderRes.rows[0];
    if (!order) {
      throw new ApiError(404, "Certificate payment order not found.");
    }

    if (order.user_id !== userId) {
      throw new ApiError(403, "Payment order ownership mismatch.");
    }

    // Check if already paid & issued (idempotent success)
    if (order.status === "paid") {
      const existingCert = await client.query(
        "SELECT certificate_number, verification_code FROM internship_certificates WHERE eligibility_id = $1 LIMIT 1;",
        [order.eligibility_id]
      );
      await client.query("COMMIT");
      return {
        success: true,
        alreadyProcessed: true,
        message: "Payment previously verified. Certificate is active.",
        certificateNumber: existingCert.rows[0]?.certificate_number,
        verificationCode: existingCert.rows[0]?.verification_code,
      };
    }

    // Update order status
    await client.query(
      `
      UPDATE certificate_payment_orders
      SET status = 'paid', razorpay_payment_id = $1, updated_at = NOW()
      WHERE id = $2;
      `,
      [razorpayPaymentId, order.id]
    );

    // Retrieve eligibility and user records
    const eligRes = await client.query(
      `
      SELECT ce.id, ce.program_title, ce.organization, ce.start_date, ce.completion_date, u.name, u.email
      FROM internship_certificate_eligibility ce
      JOIN users u ON ce.user_id = u.id
      WHERE ce.id = $1;
      `,
      [order.eligibility_id]
    );

    const elig = eligRes.rows[0];
    if (!elig) {
      throw new ApiError(404, "Linked certificate eligibility record not found.");
    }

    // Update eligibility status
    await client.query(
      "UPDATE internship_certificate_eligibility SET status = 'issued', updated_at = NOW() WHERE id = $1;",
      [elig.id]
    );

    // Generate unique Certificate Number & Verification Code
    const year = new Date().getFullYear();
    const uniqueSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const certificateNumber = `KRUU-CERT-${year}-${uniqueSuffix}`;
    const verificationCode = `V-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    const certRes = await client.query(
      `
      INSERT INTO internship_certificates (
        certificate_number, user_id, eligibility_id, payment_order_id,
        recipient_name, program_title, organization, start_date, completion_date,
        issue_date, verification_code, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, $10, 'valid')
      RETURNING id, certificate_number, verification_code, issue_date;
      `,
      [
        certificateNumber,
        userId,
        elig.id,
        order.id,
        elig.name,
        elig.program_title,
        elig.organization,
        elig.start_date,
        elig.completion_date,
        verificationCode,
      ]
    );

    await client.query("COMMIT");

    await recordAuditLog({
      adminId: null,
      adminEmail: "system@kruu.online",
      action: "certificate_issued",
      targetType: "certificate",
      targetId: certRes.rows[0].id,
      metadata: {
        userId,
        userEmail: elig.email,
        certificateNumber,
        paymentReference: razorpayPaymentId,
      },
    });

    return {
      success: true,
      message: "Certificate fee verified. Certificate issued successfully!",
      certificateNumber: certRes.rows[0].certificate_number,
      verificationCode: certRes.rows[0].verification_code,
      issueDate: certRes.rows[0].issue_date,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Generates an elegant, print-ready vector PDF certificate using PDFKit.
 * Enforces server-side authentication and payment verification on every call.
 */
export async function generateCertificatePdfStream(certificateId, userId, userRole = "user") {
  // Query certificate with verified eligibility and payment
  const query = `
    SELECT
      c.id,
      c.certificate_number,
      c.recipient_name,
      c.program_title,
      c.organization,
      c.start_date,
      c.completion_date,
      c.issue_date,
      c.verification_code,
      c.status,
      ce.status AS eligibility_status,
      cpo.status AS payment_status
    FROM internship_certificates c
    JOIN internship_certificate_eligibility ce ON c.eligibility_id = ce.id
    LEFT JOIN certificate_payment_orders cpo ON c.payment_order_id = cpo.id
    WHERE ($1::text IS NULL OR c.id::text = $1 OR c.certificate_number = $1 OR c.user_id::text = $1)
      AND (c.user_id = $2 OR $3 = 'admin');
  `;

  const res = await pool.query(query, [certificateId || null, userId, userRole]);
  const cert = res.rows[0];

  if (!cert) {
    const eligCheck = await pool.query(
      "SELECT status FROM internship_certificate_eligibility WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1;",
      [userId]
    );
    if (!eligCheck.rows[0] || eligCheck.rows[0].status !== "eligible" && eligCheck.rows[0].status !== "issued") {
      throw new ApiError(403, "Access denied: User is not marked eligible for an internship certificate.");
    }
    const payCheck = await pool.query(
      "SELECT status FROM certificate_payment_orders WHERE user_id = $1 AND status = 'paid' LIMIT 1;",
      [userId]
    );
    if (!payCheck.rows[0]) {
      throw new ApiError(403, "Access denied: Payment required before certificate download.");
    }
    throw new ApiError(404, "Certificate record not found or access denied.");
  }

  if (cert.status !== "valid") {
    throw new ApiError(403, "This certificate has been revoked and is no longer valid.");
  }

  // Strictly enforce that certificate payment was verified
  if (cert.payment_status !== "paid") {
    throw new ApiError(403, "Certificate payment must be verified before download.");
  }

  // Increment download telemetry
  await pool.query(
    "UPDATE internship_certificates SET download_count = download_count + 1, last_downloaded_at = NOW() WHERE id = $1;",
    [cert.id]
  );

  // Initialize PDFKit Document (Landscape A4: 841.89 x 595.28 pt)
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    info: {
      Title: `Kruu Internship Certificate - ${cert.recipient_name}`,
      Author: "Kruu Platform",
      Subject: `Internship Completion: ${cert.program_title}`,
      Keywords: "Kruu, Internship, Certificate, Developer",
    },
  });

  const width = doc.page.width;
  const height = doc.page.height;

  // 1. Decorative Double Outer Border
  doc
    .rect(20, 20, width - 40, height - 40)
    .lineWidth(2)
    .strokeColor("#111827")
    .stroke();

  doc
    .rect(26, 26, width - 52, height - 52)
    .lineWidth(0.75)
    .strokeColor("#0071e3")
    .stroke();

  // Corner decorative flourishes
  const cornerSize = 16;
  doc.rect(20, 20, cornerSize, cornerSize).fillColor("#111827").fill();
  doc.rect(width - 20 - cornerSize, 20, cornerSize, cornerSize).fillColor("#111827").fill();
  doc.rect(20, height - 20 - cornerSize, cornerSize, cornerSize).fillColor("#111827").fill();
  doc.rect(width - 20 - cornerSize, height - 20 - cornerSize, cornerSize, cornerSize).fillColor("#111827").fill();

  // 2. Header Brand
  doc.moveDown(1.5);
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#000000")
    .text("K R U U", { align: "center", characterSpacing: 4 });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#4b5563")
    .text("DEVELOPER PLATFORM & API GATEWAY", { align: "center", characterSpacing: 2 });

  doc.moveDown(1);

  // 3. Certificate Title
  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#0071e3")
    .text("CERTIFICATE OF INTERNSHIP COMPLETION", { align: "center", characterSpacing: 1.5 });

  doc.moveDown(0.8);

  // 4. Salutation & Recipient
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#374151")
    .text("THIS IS TO CERTIFY THAT", { align: "center", characterSpacing: 1 });

  doc.moveDown(0.6);

  // Recipient Name
  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor("#111827")
    .text(cert.recipient_name, { align: "center" });

  // Elegant decorative underline under name
  const nameWidth = Math.min(width - 160, Math.max(300, cert.recipient_name.length * 16));
  const nameStartX = (width - nameWidth) / 2;
  const currentY = doc.y + 4;
  doc
    .moveTo(nameStartX, currentY)
    .lineTo(nameStartX + nameWidth, currentY)
    .lineWidth(1)
    .strokeColor("#0071e3")
    .stroke();

  doc.moveDown(1.2);

  // 5. Completion Narrative
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#4b5563")
    .text("has successfully completed an internship in the role of", { align: "center" });

  doc.moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#000000")
    .text(cert.program_title, { align: "center" });

  doc.moveDown(0.5);

  const completionDateStr = new Date(cert.completion_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#4b5563")
    .text(
      `at ${cert.organization}, demonstrating professional dedication, engineering competence, and valuable contributions to developer tooling and infrastructure, successfully concluding on ${completionDateStr}.`,
      { align: "center", width: width - 180, lineGap: 3 }
    );

  // 6. Footer Signatures & Metadata Block
  const footerY = height - 120;

  // Left side: Issuer & Signatory
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#111827")
    .text("Kruu Platform Engineering", 70, footerY);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#6b7280")
    .text("Authorized Platform Signatory", 70, footerY + 14)
    .text(`Issue Date: ${new Date(cert.issue_date).toISOString().split("T")[0]}`, 70, footerY + 28);

  // Right side: Certificate ID, Verification & QR info
  const rightX = width - 260;
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#111827")
    .text(`Certificate No: ${cert.certificate_number}`, rightX, footerY);

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#0071e3")
    .text(`Verification Code: ${cert.verification_code}`, rightX, footerY + 14);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#6b7280")
    .text(`Verify authentic at: https://kruu.online/verify`, rightX, footerY + 28);

  // Bottom Center Seal
  doc
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor("#9ca3af")
    .text("Authentic document generated by Kruu Developer Infrastructure", 0, height - 35, {
      align: "center",
      width,
    });

  doc.end();

  const safeFilename = `Kruu_Certificate_${cert.recipient_name.replace(/[^a-zA-Z0-9]/g, "_")}_${cert.certificate_number}.pdf`;
  return { doc, filename: safeFilename };
}

/**
 * Public certificate verification endpoint (discloses minimal verified info without exposing private account data).
 */
export async function verifyCertificatePublic(codeOrNumber) {
  if (!codeOrNumber || typeof codeOrNumber !== "string") {
    throw new ApiError(400, "Please provide a valid certificate number or verification code.");
  }

  const query = `
    SELECT
      c.certificate_number,
      c.recipient_name,
      c.program_title,
      c.organization,
      c.completion_date,
      c.issue_date,
      c.status
    FROM internship_certificates c
    WHERE c.certificate_number = $1 OR c.verification_code = $1
    LIMIT 1;
  `;

  const res = await pool.query(query, [codeOrNumber.trim()]);
  const cert = res.rows[0];

  if (!cert) {
    return {
      valid: false,
      isValid: false,
      message: "No certificate found matching the provided identifier.",
    };
  }

  const certData = {
    valid: cert.status === "valid",
    isValid: cert.status === "valid",
    status: cert.status,
    certificateNumber: cert.certificate_number,
    recipientName: cert.recipient_name,
    userName: cert.recipient_name,
    programTitle: cert.program_title,
    organization: cert.organization,
    completionDate: cert.completion_date,
    issueDate: cert.issue_date,
  };

  return {
    valid: certData.valid,
    isValid: certData.isValid,
    certificate: certData,
    ...certData,
  };
}

export default {
  getUserCertificateStatus,
  createCertificateOrder,
  verifyCertificatePayment,
  generateCertificatePdfStream,
  verifyCertificatePublic,
};
