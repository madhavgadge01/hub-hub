import { ApiError } from "../utils/apiError.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

/**
 * Centralized Express JSON error handler middleware.
 * Ensures consistent JSON responses and protects against credential/stack leaking.
 */
export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = "An internal server error occurred.";
  let errors = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON syntax in request body.";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired.";
  }

  // Redacted structured logging
  if (statusCode >= 500) {
    logger.error("Unhandled Server Exception", err, {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn(`Client Error [${statusCode}]: ${message}`, {
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: message,
    ...(errors.length > 0 ? { errors } : {}),
    ...(env.nodeEnv === "test" && statusCode >= 500 ? { debug: err.message } : {}),
  });
}

/**
 * 404 Route Not Found handler.
 */
export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
