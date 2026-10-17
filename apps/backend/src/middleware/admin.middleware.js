import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";
import pool from "../config/db.js";
import { verifyAccessToken } from "../utils/token.js";

/**
 * Strict server-side admin authorization middleware.
 * Verifies that the authenticated user possesses an explicit 'admin' role in PostgreSQL.
 * Rejects regular users, unauthenticated requests, and suspended accounts.
 */
export async function requireAdmin(req, res, next) {
  try {
    // 1. Check for configured master API key header (server-to-server programmatic access)
    const apiKeyHeader = req.headers["x-api-key"];
    if (apiKeyHeader && env.masterApiKey && apiKeyHeader === env.masterApiKey) {
      req.isAdmin = true;
      req.user = req.user || { id: "system_master", email: "system@kruu.online", role: "admin" };
      return next();
    }

    // 2. Resolve authenticated user if verifyAuth wasn't previously called
    let userId = req.user?.id;
    if (!userId) {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace(/^Bearer\s+/i, "");

      if (!token) {
        throw new ApiError(401, "Authentication required to access administrator functions.");
      }

      let decoded;
      try {
        decoded = verifyAccessToken(token);
        userId = decoded.userId;
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          throw new ApiError(401, "Admin session has expired. Please sign in again.");
        }
        throw new ApiError(401, "Invalid administrative access token.");
      }
    }

    // 3. Query authoritative user record from PostgreSQL
    const result = await pool.query(
      "SELECT id, name, email, role, status FROM users WHERE id = $1 LIMIT 1;",
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      throw new ApiError(401, "Administrator record not found.");
    }

    // 4. Enforce explicit 'admin' role
    if (user.role !== "admin") {
      throw new ApiError(403, "Access denied. Administrator privileges are required.");
    }

    // 5. Verify admin account is not suspended
    if (user.status === "suspended") {
      throw new ApiError(403, "Administrator account has been suspended.");
    }

    req.user = user;
    req.isAdmin = true;
    next();
  } catch (err) {
    next(err);
  }
}

export default requireAdmin;
