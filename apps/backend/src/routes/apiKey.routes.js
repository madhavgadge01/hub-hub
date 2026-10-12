import { Router } from "express";
import {
  handleCreateApiKey,
  handleListApiKeys,
  handleRevokeApiKey,
  handleRotateApiKey,
} from "../controllers/apiKey.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";

const router = Router();

// All API key management routes require authenticated user session
router.use(verifyAuth);

router.get("/", handleListApiKeys);
router.post("/", handleCreateApiKey);
router.delete("/:id", handleRevokeApiKey);
router.post("/:id/rotate", handleRotateApiKey);

// Legacy backward-compatibility routes
router.post("/createApiKey", handleCreateApiKey);

export default router;
