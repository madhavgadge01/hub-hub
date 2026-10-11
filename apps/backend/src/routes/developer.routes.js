import { Router } from "express";
import { verifyApiKey } from "../middleware/apiKey.middleware.js";
import { apiKeyRateLimiter } from "../middleware/rateLimit.middleware.js";
import {
  handleQrCode,
  handleUrlMetadata,
  handleJsonValidator,
  handleJsonFormatter,
  handleCardValidator,
  handlePasswordGenerator,
  handlePasswordChecker,
} from "../controllers/utility.controller.js";

const router = Router();

// Developer API routes require valid API key and apply Redis rate limiting
router.use(verifyApiKey);
router.use(apiKeyRateLimiter);

// Ping test endpoint
router.get("/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API key successfully verified.",
    apiKey: {
      id: req.apiKey.id,
      name: req.apiKey.name,
      keyPrefix: req.apiKey.keyPrefix,
    },
  });
});

// 4 Core Developer Utilities
router.post("/qr", handleQrCode);
router.post("/QRcode", handleQrCode); // Legacy alias

router.post("/url-metadata", handleUrlMetadata);
router.post("/json-validator", handleJsonValidator);
router.post("/json-formatter", handleJsonFormatter);

// Additional Utilities
router.post("/card-validator", handleCardValidator);
router.post("/password", handlePasswordGenerator);
router.post("/passwordchecker", handlePasswordChecker);

export default router;
