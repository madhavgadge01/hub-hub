import express from "express";
import {
  getCategories,
  getLatestTools,
  getTools,
  getFilterMetadata,
  getToolBySlug,
  getToolPricing,
  getToolFeatures,
  getToolIntegrations,
  getToolSpecifications,
  compareTools,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminCreateTool,
  adminUpdateTool,
  adminDeleteTool,
  adminAddPricingPlan,
  adminAddFeature,
  adminAddSpecification,
} from "../controllers/tools.controller.js";
import { optionalAuth, verifyAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public catalogue discovery endpoints
router.get("/categories", getCategories);
router.get("/latest", getLatestTools);
router.get("/filters", getFilterMetadata);
router.get("/compare", compareTools);
router.get("/", getTools);

// Slug-specific software detail endpoints
router.get("/:slug/pricing", getToolPricing);
router.get("/:slug/features", getToolFeatures);
router.get("/:slug/integrations", getToolIntegrations);
router.get("/:slug/specifications", getToolSpecifications);
router.get("/:slug", getToolBySlug);

// Admin endpoints (require auth & administrator role or master API key)
router.post("/admin/categories", optionalAuth, requireAdmin, adminCreateCategory);
router.put("/admin/categories/:id", optionalAuth, requireAdmin, adminUpdateCategory);
router.delete("/admin/categories/:id", optionalAuth, requireAdmin, adminDeleteCategory);

router.post("/admin/tools", optionalAuth, requireAdmin, adminCreateTool);
router.put("/admin/tools/:id", optionalAuth, requireAdmin, adminUpdateTool);
router.delete("/admin/tools/:id", optionalAuth, requireAdmin, adminDeleteTool);

router.post("/admin/tools/:id/plans", optionalAuth, requireAdmin, adminAddPricingPlan);
router.post("/admin/tools/:id/features", optionalAuth, requireAdmin, adminAddFeature);
router.post("/admin/tools/:id/specifications", optionalAuth, requireAdmin, adminAddSpecification);

export default router;
