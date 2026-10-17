import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare official test secret keys for local dev / testing
const TEST_SECRET_ALWAYS_PASSES = "1x0000000000000000000000000000000AA";

/**
 * Verifies a Cloudflare Turnstile token from the backend.
 *
 * @param {string} token - The cf-turnstile-response token submitted by the user
 * @param {string} [clientIp] - Client IP address for additional validation
 * @returns {Promise<boolean>}
 */
export async function verifyTurnstileToken(token, clientIp = null) {
  // 1. In production, CAPTCHA is strictly mandatory
  if (!token || typeof token !== "string" || !token.trim()) {
    throw new ApiError(400, "Please complete the CAPTCHA verification to proceed.");
  }

  // 2. Determine secret key
  const secretKey = env.turnstileSecretKey;

  if (!secretKey) {
    if (env.isProduction) {
      console.error("[Turnstile] TURNSTILE_SECRET_KEY is missing in production environment.");
      throw new ApiError(503, "CAPTCHA verification service is temporarily unavailable.");
    }

    // In local development without configured Turnstile keys, use Cloudflare's always-passing test key
    console.warn("[Turnstile] TURNSTILE_SECRET_KEY not set. Using Cloudflare test secret key in development.");
  }

  const effectiveSecret = secretKey || TEST_SECRET_ALWAYS_PASSES;

  try {
    const formData = new URLSearchParams();
    formData.append("secret", effectiveSecret);
    formData.append("response", token.trim());
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Turnstile] Provider verification returned HTTP ${response.status}`);
      throw new ApiError(400, "CAPTCHA verification provider could not validate response. Please try again.");
    }

    const data = await response.json();

    if (!data.success) {
      const errorCodes = Array.isArray(data["error-codes"]) ? data["error-codes"].join(", ") : "invalid-input";
      console.warn(`[Turnstile] Verification failed: ${errorCodes}`);
      throw new ApiError(400, "CAPTCHA verification failed. Please try again.");
    }

    return true;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("[Turnstile] Verification network or unexpected error:", err.message);
    throw new ApiError(503, "CAPTCHA verification service is temporarily unreachable. Please try again.");
  }
}
