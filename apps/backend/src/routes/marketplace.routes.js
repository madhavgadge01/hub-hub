import { Router } from "express";
import {
  handleGetCategories,
  handleGetApis,
  handleGetApiBySlug,
  handleGetApiPlans,
  handleGetApiDocs,
  handleAdminCreateCategory,
  handleAdminCreateProduct,
  handleAdminAddPlan,
} from "../controllers/marketplace.controller.js";
import { optionalAuth, verifyAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Public catalogue endpoints
router.get("/categories", handleGetCategories);
router.get("/apis", optionalAuth, handleGetApis);
router.get("/apis/:slug", optionalAuth, handleGetApiBySlug);
router.get("/apis/:slug/plans", handleGetApiPlans);
router.get("/apis/:slug/docs", handleGetApiDocs);

// Admin catalogue management
router.post("/admin/categories", verifyAuth, requireAdmin, handleAdminCreateCategory);
router.post("/admin/apis", verifyAuth, requireAdmin, handleAdminCreateProduct);
router.post("/admin/apis/:productId/plans", verifyAuth, requireAdmin, handleAdminAddPlan);

export default router;
