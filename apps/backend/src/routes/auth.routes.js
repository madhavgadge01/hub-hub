import { Router } from "express";
import {
  handleRegister,
  handleVerifyRegistrationOtp,
  handleResendOtp,
  handleLogin,
  handleForgotPassword,
  handleVerifyResetOtp,
  handleResetPassword,
  handleGoogleAuth,
  handleGoogleCallback,
  handleCompleteGoogleSignup,
  handleOAuthStatus,
  handleRefreshToken,
  handleLogout,
  handleGetMe,
} from "../controllers/auth.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// Registration & Email Verification OTP
router.post("/register", authRateLimiter, handleRegister);
router.post("/verify-registration-otp", authRateLimiter, handleVerifyRegistrationOtp);
router.post("/resend-otp", authRateLimiter, handleResendOtp);

// Standard Login with CAPTCHA
router.post("/login", authRateLimiter, handleLogin);

// Password Recovery Workflow
router.post("/forgot-password", authRateLimiter, handleForgotPassword);
router.post("/verify-reset-otp", authRateLimiter, handleVerifyResetOtp);
router.post("/reset-password", authRateLimiter, handleResetPassword);

// Google OAuth 2.0 / OpenID Connect
router.get("/google", handleGoogleAuth);
router.get("/google/callback", handleGoogleCallback);
router.post("/google/complete-signup", authRateLimiter, handleCompleteGoogleSignup);
router.get("/oauth-status", handleOAuthStatus);

// Session Management
router.post("/refresh-token", handleRefreshToken);
router.post("/logout", handleLogout);
router.get("/me", verifyAuth, handleGetMe);

export default router;
