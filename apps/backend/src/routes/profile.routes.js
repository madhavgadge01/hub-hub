import { Router } from "express";
import {
  handleGetProfile,
  handleUpdateProfile,
  handleGetPurchases,
  handleGetPayments,
  handleGetEntitlements,
  handleGetUsage,
  handleGetRecentUsage,
  handleGetProfileApiKeys,
  handleCreateProfileApiKey,
  handleRevokeProfileApiKey,
  handleRotateProfileApiKey,
} from "../controllers/profile.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";

const router = Router();

// All profile endpoints require active user authentication
router.use(verifyAuth);

router.get("/", handleGetProfile);
router.patch("/", handleUpdateProfile);

router.get("/purchases", handleGetPurchases);
router.get("/payments", handleGetPayments);
router.get("/entitlements", handleGetEntitlements);

router.get("/usage", handleGetUsage);
router.get("/usage/recent", handleGetRecentUsage);

router.get("/api-keys", handleGetProfileApiKeys);
router.post("/api-keys", handleCreateProfileApiKey);
router.delete("/api-keys/:id", handleRevokeProfileApiKey);
router.post("/api-keys/:id/rotate", handleRotateProfileApiKey);

export default router;
