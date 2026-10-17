import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { verifyAuth } from "../middleware/auth.middleware.js";
import {
  handleGetCertificateStatus,
  handleCreateCertificateOrder,
  handleVerifyCertificatePayment,
  handleDownloadCertificatePdf,
  handleVerifyCertificatePublic,
} from "../controllers/certificate.controller.js";

const router = Router();

// Rate limiting on sensitive certificate operations
const certLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many certificate requests. Please try again later." },
});

router.use(certLimiter);

// 1. Authenticated User Certificate Workflow
router.get("/status", verifyAuth, handleGetCertificateStatus);
router.post("/orders", verifyAuth, handleCreateCertificateOrder);
router.post("/order", verifyAuth, handleCreateCertificateOrder);
router.post("/verify", verifyAuth, handleVerifyPaymentAlias);
router.post("/verify-payment", verifyAuth, handleVerifyCertificatePayment);
router.get("/download/:id", verifyAuth, handleDownloadCertificatePdf);
router.get("/download", verifyAuth, handleDownloadCertificatePdf);
router.get("/:id/download", verifyAuth, handleDownloadCertificatePdf);

// 2. Public Verification Endpoint (No sensitive personal info disclosed)
router.get("/verify/:code", handleVerifyCertificatePublic);

function handleVerifyPaymentAlias(req, res, next) {
  return handleVerifyCertificatePayment(req, res, next);
}

export default router;
