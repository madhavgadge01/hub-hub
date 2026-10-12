import pool from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { generateApiKey, verifyApiKeyHash } from "../utils/crypto.js";

/**
 * Creates a new API key for the authenticated user, optionally linked to a purchased API product or entitlement.
 * Returns the raw key ONLY ONCE. Subsequent listings only return prefix and masked key.
 */
export async function createApiKeyForUser(
  userId,
  name,
  optionsOrProductId = {},
  maybeEntitlementId = null
) {
  let apiProductId = null;
  let entitlementId = null;

  if (typeof optionsOrProductId === "object" && optionsOrProductId !== null) {
    apiProductId = optionsOrProductId.apiProductId || null;
    entitlementId = optionsOrProductId.entitlementId || null;
  } else if (typeof optionsOrProductId === "string") {
    apiProductId = optionsOrProductId;
    entitlementId = maybeEntitlementId;
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ApiError(400, "API key name is required.");
  }

  const sanitizedName = name.trim().slice(0, 100);

  // If entitlementId provided, verify it belongs to this user and is active
  if (entitlementId) {
    const entRes = await pool.query(
      `
      SELECT id, api_product_id, status
      FROM user_api_entitlements
      WHERE id = $1 AND user_id = $2
      LIMIT 1;
      `,
      [entitlementId, userId]
    );

    const entitlement = entRes.rows[0];
    if (!entitlement) {
      throw new ApiError(404, "Specified API entitlement not found or does not belong to you.");
    }
    if (entitlement.status !== "active") {
      throw new ApiError(400, `Cannot bind API key to an ${entitlement.status} entitlement.`);
    }

    if (!apiProductId) {
      apiProductId = entitlement.api_product_id;
    }
  }

  const { rawKey, keyPrefix, keyHash, algorithm } = generateApiKey();

  const insertRes = await pool.query(
    `
    INSERT INTO api_keys (
      user_id,
      name,
      key_prefix,
      key_hash,
      hash_algorithm,
      api_product_id,
      entitlement_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, key_prefix, hash_algorithm, api_product_id, entitlement_id, created_at;
    `,
    [userId, sanitizedName, keyPrefix, keyHash, algorithm, apiProductId, entitlementId]
  );

  const record = insertRes.rows[0];

  return {
    id: record.id,
    name: record.name,
    keyPrefix: record.key_prefix,
    apiProductId: record.api_product_id,
    entitlementId: record.entitlement_id,
    rawKey, // Returned ONLY on initial creation!
    createdAt: record.created_at,
  };
}

/**
 * Retrieves all API keys belonging to the authenticated user.
 * Joins associated API products and entitlements to show quota, usage, and status.
 * Never includes raw keys or password/key hashes.
 */
export async function listApiKeysForUser(userId) {
  const result = await pool.query(
    `
    SELECT
      k.id,
      k.name,
      k.key_prefix,
      k.created_at,
      k.last_used_at,
      k.revoked_at,
      CASE WHEN k.revoked_at IS NULL THEN 'active' ELSE 'revoked' END AS status,
      k.api_product_id,
      p.name AS product_name,
      p.slug AS product_slug,
      p.icon_url AS product_icon,
      k.entitlement_id,
      pl.name AS plan_name,
      e.requests_quota,
      e.requests_used,
      e.valid_until,
      e.status AS entitlement_status
    FROM api_keys k
    LEFT JOIN api_products p ON k.api_product_id = p.id
    LEFT JOIN user_api_entitlements e ON k.entitlement_id = e.id
    LEFT JOIN api_plans pl ON e.plan_id = pl.id
    WHERE k.user_id = $1
    ORDER BY k.created_at DESC;
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
    apiProductId: row.api_product_id,
    productName: row.product_name || "General API Key",
    productSlug: row.product_slug,
    productIcon: row.product_icon || "/icons/api-qrcode.svg",
    entitlementId: row.entitlement_id,
    planName: row.plan_name,
    requestsQuota: row.requests_quota || null,
    requestsUsed: row.requests_used || 0,
    remainingRequests: row.requests_quota ? Math.max(0, row.requests_quota - (row.requests_used || 0)) : null,
    validUntil: row.valid_until,
    entitlementStatus: row.entitlement_status,
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
 * Rotates an existing API key: revokes the previous key and issues a fresh secret
 * preserving the same name, product scope, and entitlement.
 */
export async function rotateApiKeyForUser(userId, keyId) {
  if (!keyId) {
    throw new ApiError(400, "API key ID is required.");
  }

  const existingRes = await pool.query(
    `
    SELECT id, name, api_product_id, entitlement_id
    FROM api_keys
    WHERE id = $1 AND user_id = $2
    LIMIT 1;
    `,
    [keyId, userId]
  );

  const existingKey = existingRes.rows[0];
  if (!existingKey) {
    throw new ApiError(404, "API key not found.");
  }

  // Revoke old key
  await pool.query("UPDATE api_keys SET revoked_at = NOW() WHERE id = $1;", [keyId]);

  // Create replacement key
  return createApiKeyForUser(userId, `${existingKey.name} (Rotated)`, {
    apiProductId: existingKey.api_product_id,
    entitlementId: existingKey.entitlement_id,
  });
}

/**
 * Validates a developer's API key from incoming request header.
 * Verifies searchable prefix and checks hash against database.
 * Supports backward-compatible bcrypt check as well as modern SHA-256.
 * Enforces entitlement status, expiry, and request quota limits.
 */
export async function validateDeveloperApiKey(rawKey, endpointPath = null) {
  if (!rawKey || typeof rawKey !== "string" || !rawKey.startsWith("dh_live_")) {
    throw new ApiError(401, "Invalid or malformed API key format.");
  }

  const keyPrefix = rawKey.slice(0, 16);

  const queryRes = await pool.query(
    `
    SELECT
      k.id,
      k.user_id,
      k.name,
      k.key_prefix,
      k.key_hash,
      k.hash_algorithm,
      k.revoked_at,
      k.api_product_id,
      k.entitlement_id,
      p.endpoint_path AS product_endpoint,
      e.status AS entitlement_status,
      e.requests_quota,
      e.requests_used,
      e.valid_until,
      e.rate_limit_per_minute
    FROM api_keys k
    LEFT JOIN api_products p ON k.api_product_id = p.id
    LEFT JOIN user_api_entitlements e ON k.entitlement_id = e.id
    WHERE k.key_prefix = $1
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

  // If key is scoped to a specific entitlement, enforce entitlement rules
  if (record.entitlement_id) {
    if (record.entitlement_status !== "active") {
      throw new ApiError(403, `API access entitlement is currently ${record.entitlement_status || "inactive"}.`);
    }

    if (record.valid_until && new Date(record.valid_until) < new Date()) {
      throw new ApiError(403, "API access entitlement has expired. Please renew your plan in the Marketplace.");
    }

    if (record.requests_quota && record.requests_used >= record.requests_quota) {
      throw new ApiError(
        403,
        `API request quota exhausted (${record.requests_used}/${record.requests_quota} requests used). Please upgrade your plan in the Marketplace.`
      );
    }
  }

  return {
    id: record.id,
    userId: record.user_id,
    name: record.name,
    keyPrefix: record.key_prefix,
    apiProductId: record.api_product_id,
    entitlementId: record.entitlement_id,
    rateLimitPerMinute: record.rate_limit_per_minute || 60,
  };
}

/**
 * Updates `last_used_at` asynchronously without blocking HTTP response.
 */
export function touchApiKeyLastUsed(apiKeyId) {
  pool
    .query("UPDATE api_keys SET last_used_at = NOW() WHERE id = $1;", [apiKeyId])
    .catch((err) => {
      console.warn("Non-fatal: could not update last_used_at:", err.message);
    });
}

/**
 * Records API usage asynchronously without blocking HTTP response.
 * Increments entitlement used requests when applicable.
 */
export function recordApiUsageAsync({
  apiKeyId,
  userId,
  endpoint,
  method,
  statusCode,
  responseTimeMs,
  apiProductId = null,
  entitlementId = null,
}) {
  pool
    .query(
      `
      INSERT INTO api_usage (
        api_key_id,
        user_id,
        endpoint,
        method,
        status_code,
        response_time_ms,
        api_product_id,
        entitlement_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `,
      [
        apiKeyId,
        userId,
        endpoint,
        method,
        statusCode || 200,
        responseTimeMs || 0,
        apiProductId,
        entitlementId,
      ]
    )
    .then(() => {
      // Increment entitlement requests_used count
      if (entitlementId) {
        pool.query(
          `
          UPDATE user_api_entitlements
          SET requests_used = requests_used + 1,
              updated_at = NOW()
          WHERE id = $1;
          `,
          [entitlementId]
        ).catch(() => {});
      }
    })
    .catch((err) => {
      console.warn("Non-fatal: could not log api_usage record:", err.message);
    });
}

/**
 * Synchronous/awaited wrapper for tests.
 */
export async function recordApiKeyUsage(data) {
  await pool.query(
    `
    INSERT INTO api_usage (
      api_key_id, user_id, endpoint, method, status_code, response_time_ms, api_product_id, entitlement_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `,
    [
      data.keyId || data.apiKeyId,
      data.userId,
      data.endpoint,
      data.method,
      data.statusCode || 200,
      data.responseTimeMs || 0,
      data.apiProductId || null,
      data.entitlementId || null,
    ]
  );
  if (data.entitlementId) {
    await pool.query(
      `UPDATE user_api_entitlements SET requests_used = requests_used + 1, updated_at = NOW() WHERE id = $1;`,
      [data.entitlementId]
    );
  }
}

