import pool from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import {
  getUserCertificateStatus,
  createCertificateOrder,
  verifyCertificatePayment,
  generateCertificatePdfStream,
  verifyCertificatePublic,
} from "../services/certificate.service.js";

/**
 * Retrieves the current authenticated user's certificate status.
 */
export async function handleGetCertificateStatus(req, res, next) {
  try {
    const status = await getUserCertificateStatus(req.user.id);
    res.status(200).json({ success: true, ...status });
  } catch (err) {
    next(err);
  }
}

/**
 * Initializes a ₹100 INR checkout order for the authenticated eligible user.
 */
export async function handleCreateCertificateOrder(req, res, next) {
  try {
    const order = await createCertificateOrder(req.user.id);
    res.status(200).json({ success: true, ...order });
  } catch (err) {
    next(err);
  }
}

/**
 * Cryptographically verifies Razorpay signature and issues the certificate.
 */
export async function handleVerifyCertificatePayment(req, res, next) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const result = await verifyCertificatePayment({
      userId: req.user.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Generates and streams the verified PDF certificate.
 * Enforces server-side authentication and payment verification on every call.
 */
export async function handleDownloadCertificatePdf(req, res, next) {
  try {
    const certificateId = req.params.id || req.params.userId || req.query.id;

    // Cross-user access check: regular users can only download their own certificate
    if (certificateId && certificateId !== req.user.id && req.user.role !== "admin") {
      const checkRes = await pool.query(
        "SELECT id FROM internship_certificates WHERE (id::text = $1 OR certificate_number = $1) AND user_id = $2",
        [certificateId, req.user.id]
      );
      if (checkRes.rows.length === 0) {
        throw new ApiError(403, "Access denied: You can only download your own certificate.");
      }
    }

    const { doc, filename } = await generateCertificatePdfStream(certificateId, req.user.id, req.user.role);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");

    doc.pipe(res);
  } catch (err) {
    next(err);
  }
}

/**
 * Public certificate verification endpoint (minimal disclosure).
 */
export async function handleVerifyCertificatePublic(req, res, next) {
  try {
    const { code } = req.params;
    const result = await verifyCertificatePublic(code);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
