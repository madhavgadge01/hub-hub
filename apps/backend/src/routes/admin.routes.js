import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  handleGetDashboardOverview,
  handleListUsers,
  handleGetUserDetail,
  handleSuspendUser,
  handleReactivateUser,
  handleToggleUserStatus,
  handleRevokeUserKey,
  handleGrantCertificateEligibility,
  handleRevokeCertificateEligibility,
  handleListApiCatalog,
  handleUpdateApiProduct,
  handleUpdateApiProductStatus,
  handleListPayments,
  handleListCertificates,
  handleListAuditLogs,
  handleExportReportCsv,
  handleAdminAuthMe,
} from "../controllers/admin.controller.js";

const router = Router();

// Rate limiter for admin operations to protect against brute-force or abuse
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many administrative requests. Please try again later." },
});

router.use(adminLimiter);

// Enforce strict server-side admin authorization on EVERY admin endpoint
router.use(requireAdmin);

// Admin Identity Verification
router.get("/auth/me", handleAdminAuthMe);

// 1. Dashboard Overview Analytics
router.get("/analytics/overview", handleGetDashboardOverview);
router.get("/dashboard", handleGetDashboardOverview);

// 2. User Management
router.get("/users", handleListUsers);
router.get("/users/:id", handleGetUserDetail);
router.post("/users/:id/status", handleToggleUserStatus);
router.post("/users/:id/suspend", handleSuspendUser);
router.post("/users/:id/reactivate", handleReactivateUser);
router.post("/users/:id/revoke-key/:keyId", handleRevokeUserKey);
router.post("/users/:id/keys/:keyId/revoke", handleRevokeUserKey);
router.post("/users/:id/certificate-eligibility", handleGrantCertificateEligibility);
router.delete("/users/:id/certificate-eligibility/:eligibilityId", handleRevokeCertificateEligibility);
router.post("/users/:id/certificate-eligibility/revoke", handleRevokeCertificateEligibility);

// 3. API & Catalogue Management
router.get("/catalog/products", handleListApiCatalog);
router.get("/apis", handleListApiCatalog);
router.patch("/catalog/products/:id/status", handleUpdateApiProductStatus);
router.put("/apis/:id", handleUpdateApiProduct);

// 4. Payment Management
router.get("/payments", handleListPayments);

// 5. Internship Certificate Management
router.get("/certificates", handleListCertificates);

// 6. Audit Trail
router.get("/audit-logs", handleListAuditLogs);

// 7. Reports & CSV Exports
router.get("/reports/export/:reportType", handleExportReportCsv);
router.get("/export/:reportType", handleExportReportCsv);

export default router;
