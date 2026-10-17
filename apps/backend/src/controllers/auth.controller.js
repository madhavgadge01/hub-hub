import jwt from "jsonwebtoken";
import {
  initiateRegistration,
  verifyRegistrationOtp,
  resendOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from "../services/auth.service.js";
import {
  getGoogleAuthorizationUrl,
  processGoogleCallback,
  completeGoogleRegistrationWithName,
  isGoogleOAuthConfigured,
} from "../services/googleAuth.service.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

/**
 * Initiates registration and dispatches 6-digit verification code.
 */
export const handleRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await initiateRegistration({ name, email, password });

  res.status(200).json(result);
});

/**
 * Verifies email with registration OTP, activates account, and establishes session.
 */
export const handleVerifyRegistrationOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user, accessToken, refreshToken } = await verifyRegistrationOtp({ email, otp });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "Email verified and account activated successfully.",
    user,
    accessToken,
  });
});

/**
 * Resends active OTP for registration or password recovery.
 */
export const handleResendOtp = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;
  const result = await resendOtp({ email, purpose });

  res.status(200).json(result);
});

/**
 * Authenticates user credentials with CAPTCHA validation.
 */
export const handleLogin = asyncHandler(async (req, res) => {
  const { email, password, turnstileToken } = req.body;
  const clientIp = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";

  const { user, accessToken, refreshToken } = await login({
    email,
    password,
    turnstileToken,
    clientIp,
  });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    user,
    accessToken,
  });
});

/**
 * Initiates password recovery.
 */
export const handleForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await forgotPassword({ email });

  res.status(200).json(result);
});

/**
 * Verifies password-reset OTP and grants a single-use reset authorization token.
 */
export const handleVerifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyResetOtp({ email, otp });

  res.status(200).json(result);
});

/**
 * Resets user password using single-use authorization token and revokes active sessions.
 */
export const handleResetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const result = await resetPassword({ resetToken, newPassword });

  res.status(200).json(result);
});

/**
 * Initiates Google OAuth 2.0 authorization code flow.
 */
export const handleGoogleAuth = asyncHandler(async (req, res) => {
  const returnTo = req.query.returnTo || "/profile";
  const authUrl = await getGoogleAuthorizationUrl(returnTo);

  res.redirect(authUrl);
});

/**
 * Google OAuth 2.0 callback endpoint.
 */
export const handleGoogleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  const result = await processGoogleCallback({ code, state, error });

  if (result.error || result.cancelled) {
    const errorParam = encodeURIComponent(result.error || result.reason || "Google authentication failed.");
    return res.redirect(`${env.frontendUrl}/login?error=${errorParam}`);
  }

  if (result.requiresLinking) {
    const emailParam = encodeURIComponent(result.email);
    return res.redirect(
      `${env.frontendUrl}/login?error=account_exists_link_required&email=${emailParam}`
    );
  }

  if (result.requiresNameChoice) {
    const tokenParam = encodeURIComponent(result.setupToken);
    const emailParam = encodeURIComponent(result.email);
    const suggestedParam = encodeURIComponent(result.suggestedName || "");
    return res.redirect(
      `${env.frontendUrl}/login?setup_name=true&token=${tokenParam}&email=${emailParam}&suggestedName=${suggestedParam}`
    );
  }

  if (result.success && result.accessToken) {
    setAuthCookies(res, result.accessToken, result.refreshToken);
    const targetUrl = result.redirectDestination
      ? `${env.frontendUrl}${result.redirectDestination.startsWith("/") ? result.redirectDestination : `/${result.redirectDestination}`}`
      : `${env.frontendUrl}/profile`;
    return res.redirect(targetUrl);
  }

  res.redirect(`${env.frontendUrl}/login?error=Unexpected+Google+OAuth+state`);
});

/**
 * Completes Google registration when imported name exceeded 25 characters.
 */
export const handleCompleteGoogleSignup = asyncHandler(async (req, res) => {
  const { setupToken, name } = req.body;
  const { user, accessToken, refreshToken } = await completeGoogleRegistrationWithName({
    setupToken,
    name,
  });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "Google account setup complete.",
    user,
    accessToken,
  });
});

/**
 * Returns OAuth availability status.
 */
export const handleOAuthStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    googleConfigured: isGoogleOAuthConfigured(),
  });
});

/**
 * Refreshes access token using HttpOnly refresh token cookie.
 */
export const handleRefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { accessToken, user } = await refreshAccessToken(refreshToken);

  setAuthCookies(res, accessToken, null);

  res.status(200).json({
    success: true,
    message: "Access token refreshed.",
    accessToken,
    user,
  });
});

/**
 * Revokes current session and clears cookies.
 */
export const handleLogout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  let sessionId = null;

  if (refreshToken) {
    try {
      const decoded = jwt.decode(refreshToken);
      sessionId = decoded?.sessionId;
    } catch {
      // Ignore parse failure on logout
    }
  }

  await logout(sessionId);
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

/**
 * Retrieves authenticated user details.
 */
export const handleGetMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});
