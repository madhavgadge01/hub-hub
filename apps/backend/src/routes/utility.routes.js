import { Router } from "express";
import {
  handleQrCode,
  handleUrlMetadata,
  handleJsonValidator,
  handleJsonFormatter,
  handleCardValidator,
  handlePasswordGenerator,
  handlePasswordChecker,
} from "../controllers/utility.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Browser utilities can be used directly from frontend without embedding API keys
router.use(optionalAuth);

// 4 Core Utilities
router.post("/qr", handleQrCode);
router.post("/url-metadata", handleUrlMetadata);
router.post("/json-validator", handleJsonValidator);
router.post("/json-formatter", handleJsonFormatter);

// Additional Developer Utilities
router.post("/card-validator", handleCardValidator);
router.post("/password", handlePasswordGenerator);
router.post("/passwordchecker", handlePasswordChecker);

export default router;
