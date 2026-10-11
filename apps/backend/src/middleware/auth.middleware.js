import { verifyAccessToken } from "../utils/token.js";
import pool from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Authentication middleware for browser sessions and JWT bearer requests.
 */
export async function verifyAuth(req, res, next) {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      throw new ApiError(401, "Authentication required. Please sign in.");
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(401, "Access token has expired. Please refresh your session.");
      }
      throw new ApiError(401, "Invalid access token.");
    }

    const result = await pool.query(
      `
      SELECT id, name, email, created_at
      FROM users
      WHERE id = $1
      LIMIT 1;
      `,
      [decoded.userId]
    );

    const user = result.rows[0];
    if (!user) {
      throw new ApiError(401, "User associated with this token no longer exists.");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication middleware: populates req.user if present,
 * but allows unauthenticated requests to proceed.
 */
export async function optionalAuth(req, res, next) {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace(/^Bearer\s+/i, "");

    if (token) {
      const decoded = verifyAccessToken(token);
      const result = await pool.query(
        "SELECT id, name, email FROM users WHERE id = $1 LIMIT 1;",
        [decoded.userId]
      );
      if (result.rows[0]) {
        req.user = result.rows[0];
      }
    }
  } catch {
    // Ignore error for optional authentication
  }
  next();
}