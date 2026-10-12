import {
  createCheckoutOrder,
  verifyPaymentAndActivateEntitlement,
  processRazorpayWebhook,
} from "../services/checkout.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleCreateOrder = asyncHandler(async (req, res) => {
  const { productId, planId } = req.body;
  const result = await createCheckoutOrder({
    userId: req.user.id,
    userEmail: req.user.email,
    productId,
    planId,
  });

  res.status(result.configMissing ? 503 : 200).json({
    success: !result.configMissing,
    ...result,
  });
});

export const handleVerifyPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  const result = await verifyPaymentAndActivateEntitlement({
    userId: req.user.id,
    userEmail: req.user.email,
    userName: req.user.name,
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  // Raw body might be buffer if raw parser is used, or stringified req.body
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const result = await processRazorpayWebhook({
    rawBody,
    signatureHeader: signature,
    eventPayload: req.body,
  });

  res.status(200).json({
    status: "ok",
    ...result,
  });
});
