import { Router } from "express";
import {
  handleCreateOrder,
  handleVerifyPayment,
  handleRazorpayWebhook,
} from "../controllers/checkout.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Authenticated checkout endpoints
router.post("/orders", verifyAuth, handleCreateOrder);
router.post("/verify", verifyAuth, handleVerifyPayment);

// Webhook endpoint (verified with raw signature)
router.post("/webhook", handleRazorpayWebhook);

export default router;
