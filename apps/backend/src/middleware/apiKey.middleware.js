import { ApiError } from "../utils/apiError.js";
import {
  validateDeveloperApiKey,
  touchApiKeyLastUsed,
  recordApiUsageAsync,
} from "../services/apiKey.service.js";

/**
 * Developer API key verification middleware.
 * Authenticates developer requests using x-api-key header or Bearer token.
 * Triggers asynchronous non-blocking last-used updates and usage analytics.
 */
export async function verifyApiKey(req, res, next) {
  const startTime = Date.now();
  const rawApiKey =
    req.headers["x-api-key"] ||
    req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!rawApiKey) {
    return next(
      new ApiError(
        401,
        "API key missing. Please provide your API key in the 'x-api-key' request header."
      )
    );
  }

  try {
    const keyContext = await validateDeveloperApiKey(rawApiKey);

    req.apiKey = keyContext;
    req.user = { id: keyContext.userId };

    // Update last_used_at asynchronously
    touchApiKeyLastUsed(keyContext.id);

    // Record usage when response finishes without blocking request
    res.on("finish", () => {
      const responseTimeMs = Date.now() - startTime;
      recordApiUsageAsync({
        apiKeyId: keyContext.id,
        userId: keyContext.userId,
        endpoint: req.originalUrl || req.url,
        method: req.method,
        statusCode: res.statusCode,
        responseTimeMs,
      });
    });

    next();
  } catch (err) {
    next(err);
  }
}