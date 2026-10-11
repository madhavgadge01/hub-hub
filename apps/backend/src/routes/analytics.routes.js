import { Router } from "express";
import { handleGetUsageAnalytics } from "../controllers/analytics.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyAuth);
router.get("/", handleGetUsageAnalytics);

export default router;
