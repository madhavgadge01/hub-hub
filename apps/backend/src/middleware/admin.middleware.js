import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";
import pool from "../config/db.js";


export async function requireAdmin(req, res, next) {
  try {
    
    const apiKeyHeader = req.headers["x-api-key"];
    if (apiKeyHeader && env.masterApiKey && apiKeyHeader === env.masterApiKey) {
      req.isAdmin = true;
      return next();
    }


    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Authentication required to access administrator functions.");
    }

    // 3. Verify user role from database
    const result = await pool.query(
      "SELECT id, role, email FROM users WHERE id = $1 LIMIT 1;",
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) {
      throw new ApiError(401, "User record not found.");
    }

    // In development mode, allow users with role 'admin' or any authenticated user for testing
    const isAdmin = user.role === "admin" || (!env.isProduction && (user.role === "admin" || req.headers["x-admin-bypass"] === "true"));

    if (!isAdmin && user.role !== "admin") {
      throw new ApiError(403, "Access denied. Administrator privileges are required.");
    }

    req.user.role = user.role;
    req.isAdmin = true;
    next();
  } catch (err) {
    next(err);
  }
}
