import pool from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { generateApiKey, verifyApiKeyHash } from "../utils/crypto.js";

/**
 * Creates a new API key for the authenticated user.
 * Returns the raw key ONLY ONCE. Subsequent listings only return prefix and metadata.
 */
export async function createApiKeyForUser(userId, name) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ApiError(400, "API key name is required.");
  }

  const sanitizedName = name.trim().slice(0, 100);
  const { rawKey, keyPrefix, keyHash, algorithm } = generateApiKey();

  const insertRes = await pool.query(
    `
    INSERT INTO api_keys (
      user_id,
      name,
      key_prefix,
      key_hash,
      hash_algorithm
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, key_prefix, hash_algorithm, created_at;
    `,
    [userId, sanitizedName, keyPrefix, keyHash, algorithm]
  );

  const record = insertRes.rows[0];

  return {
    id: record.id,
    name: record.name,
    keyPrefix: record.key_prefix,
    rawKey, // Returned ONLY on initial creation!
    createdAt: record.created_at,
  };
}

/**
 * Retrieves all API keys belonging to the authenticated user.
 * Never includes raw keys or password/key hashes.
 */
export async function listApiKeysForUser(userId) {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      key_prefix,
      created_at,
      last_used_at,
      revoked_at,
      CASE WHEN revoked_at IS NULL THEN 'active' ELSE 'revoked' END AS status
    FROM api_keys
    WHERE user_id = $1
    ORDER BY created_at DESC;
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    maskedKey: `${row.key_prefix}••••••••••••••••••••••••`,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
    status: row.status,
  }));
}

/**
 * Revokes an API key owned by the authenticated user.
 * Enforces ownership check on the backend.
 */
export async function revokeApiKeyForUser(userId, keyId) {
  if (!keyId) {
    throw new ApiError(400, "API key ID is required.");
  }

  const result = await pool.query(
    `
    UPDATE api_keys
    SET revoked_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, name, key_prefix, revoked_at;
    `,
    [keyId, userId]
  );

  const revokedRecord = result.rows[0];
  if (!revokedRecord) {
    throw new ApiError(404, "API key not found or you do not have permission to revoke it.");
  }

  return {
    id: revokedRecord.id,
    name: revokedRecord.name,
    revokedAt: revokedRecord.revoked_at,
  };
}

/**
 * Validates a developer's API key from incoming request header.
 * Verifies searchable prefix and checks hash against database.
 * Supports backward-compatible bcrypt check as well as modern SHA-256.
 */
export async function validateDeveloperApiKey(rawKey) {
  if (!rawKey || typeof rawKey !== "string" || !rawKey.startsWith("dh_live_")) {
    throw new ApiError(401, "Invalid or malformed API key format.");
  }

  const keyPrefix = rawKey.slice(0, 16);

  const queryRes = await pool.query(
    `
    SELECT
      id,
      user_id,
      name,
      key_prefix,
      key_hash,
      hash_algorithm,
      revoked_at
    FROM api_keys
    WHERE key_prefix = $1
    LIMIT 1;
    `,
    [keyPrefix]
  );

  const record = queryRes.rows[0];
  if (!record) {
    throw new ApiError(401, "API key is not recognized or does not exist.");
  }

  if (record.revoked_at) {
    throw new ApiError(401, "API key has been revoked and can no longer be used.");
  }

  const isValid = await verifyApiKeyHash(
    rawKey,
    record.key_hash,
    record.hash_algorithm || "bcrypt"
  );

  if (!isValid) {
    throw new ApiError(401, "API key validation failed. Invalid secret token.");
  }

  return {
    id: record.id,
    userId: record.user_id,
    name: record.name,
    keyPrefix: record.key_prefix,
  };
}

/**
 * Updates `last_used_at` asynchronously without blocking HTTP response.
 */
export function touchApiKeyLastUsed(apiKeyId) {
  pool
    .query("UPDATE api_keys SET last_used_at = NOW() WHERE id = $1;", [apiKeyId])
    .catch((err) => {
      // Do not crash, log non-fatal error
      console.warn("Non-fatal: could not update last_used_at:", err.message);
    });
}

/**
 * Records API usage asynchronously without blocking HTTP response.
 * If usage recording fails, it will NOT fail the utility response.
 */
export function recordApiUsageAsync({ apiKeyId, userId, endpoint, method, statusCode, responseTimeMs }) {
  pool
    .query(
      `
      INSERT INTO api_usage (
        api_key_id,
        user_id,
        endpoint,
        method,
        status_code,
        response_time_ms
      )
      VALUES ($1, $2, $3, $4, $5, $6);
      `,
      [apiKeyId, userId, endpoint, method, statusCode || 200, responseTimeMs || 0]
    )
    .catch((err) => {
      console.warn("Non-fatal: could not log api_usage record:", err.message);
    });
}
