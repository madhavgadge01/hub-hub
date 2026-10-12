import pool from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

const VALID_AVATARS = [
  "/avatars/avatar-1.svg",
  "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg",
  "/avatars/avatar-4.svg",
];

/**
 * Retrieves the authenticated user's profile.
 */
export async function getUserProfile(userId) {
  const res = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      avatar,
      role,
      created_at,
      last_login_at
    FROM users
    WHERE id = $1
    LIMIT 1;
    `,
    [userId]
  );

  const user = res.rows[0];
  if (!user) {
    throw new ApiError(404, "User profile not found.");
  }

  return {
    ...user,
    avatar: user.avatar || "/avatars/avatar-1.svg",
  };
}

/**
 * Updates permitted profile fields (display name, built-in avatar).
 * Enforces validation against the 4 curated static application avatars.
 */
export async function updateUserProfile(userId, { name, avatar }) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new ApiError(400, "Display name cannot be empty.");
    }
    updates.push(`name = $${paramIndex}`);
    params.push(name.trim().slice(0, 100));
    paramIndex++;
  }

  if (avatar !== undefined) {
    if (!VALID_AVATARS.includes(avatar)) {
      throw new ApiError(
        400,
        "Invalid avatar selection. Please choose one of the four curated platform avatars."
      );
    }
    updates.push(`avatar = $${paramIndex}`);
    params.push(avatar);
    paramIndex++;
  }

  if (updates.length === 0) {
    throw new ApiError(400, "No profile updates provided.");
  }

  updates.push("updated_at = NOW()");
  params.push(userId);

  const sql = `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, name, email, avatar, role, created_at, updated_at;
  `;

  const res = await pool.query(sql, params);
  return res.rows[0];
}

/**
 * Retrieves all real purchases for the authenticated user from PostgreSQL.
 */
export async function getUserPurchases(userId) {
  const res = await pool.query(
    `
    SELECT
      p.id,
      p.purchase_reference,
      p.payment_reference,
      p.amount_paid,
      p.currency,
      p.status,
      p.purchased_at,
      p.activated_at,
      p.expires_at,
      prod.id AS product_id,
      prod.name AS product_name,
      prod.slug AS product_slug,
      prod.icon_url AS product_icon,
      pl.id AS plan_id,
      pl.name AS plan_name,
      pl.plan_type,
      pl.billing_interval,
      pl.included_requests
    FROM user_purchases p
    JOIN api_products prod ON p.api_product_id = prod.id
    JOIN api_plans pl ON p.plan_id = pl.id
    WHERE p.user_id = $1
    ORDER BY p.purchased_at DESC;
    `,
    [userId]
  );

  return res.rows.map((row) => ({
    id: row.id,
    purchaseReference: row.purchase_reference,
    paymentReference: row.payment_reference,
    amountPaid: row.amount_paid,
    amountFormatted: (row.amount_paid / 100).toFixed(2),
    currency: row.currency,
    status: row.status,
    purchasedAt: row.purchased_at,
    activatedAt: row.activated_at,
    expiresAt: row.expires_at,
    product: {
      id: row.product_id,
      name: row.product_name,
      slug: row.product_slug,
      iconUrl: row.product_icon,
    },
    plan: {
      id: row.plan_id,
      name: row.plan_name,
      planType: row.plan_type,
      billingInterval: row.billing_interval,
      includedRequests: row.included_requests,
    },
  }));
}

/**
 * Retrieves billing and payment history records from PostgreSQL.
 */
export async function getUserPayments(userId) {
  const res = await pool.query(
    `
    SELECT
      o.id,
      o.order_reference,
      o.razorpay_order_id,
      o.amount,
      o.currency,
      o.status,
      o.created_at,
      p.name AS product_name,
      p.slug AS product_slug,
      pl.name AS plan_name
    FROM payment_orders o
    JOIN api_products p ON o.api_product_id = p.id
    JOIN api_plans pl ON o.plan_id = pl.id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC;
    `,
    [userId]
  );

  return res.rows.map((row) => ({
    id: row.id,
    orderReference: row.order_reference,
    razorpayOrderId: row.razorpay_order_id,
    amount: row.amount,
    amountFormatted: (row.amount / 100).toFixed(2),
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
    productName: row.product_name,
    productSlug: row.product_slug,
    planName: row.plan_name,
  }));
}

/**
 * Retrieves active developer entitlements for the user with request quotas.
 */
export async function getUserEntitlements(userId) {
  const res = await pool.query(
    `
    SELECT
      e.id,
      e.status,
      e.requests_quota,
      e.requests_used,
      e.rate_limit_per_minute,
      e.valid_from,
      e.valid_until,
      p.id AS product_id,
      p.name AS product_name,
      p.slug AS product_slug,
      p.icon_url AS product_icon,
      pl.id AS plan_id,
      pl.name AS plan_name
    FROM user_api_entitlements e
    JOIN api_products p ON e.api_product_id = p.id
    JOIN api_plans pl ON e.plan_id = pl.id
    WHERE e.user_id = $1
    ORDER BY e.created_at DESC;
    `,
    [userId]
  );

  return res.rows.map((row) => ({
    id: row.id,
    status: row.status,
    requestsQuota: row.requests_quota,
    requestsUsed: row.requests_used,
    remainingRequests: Math.max(0, row.requests_quota - row.requests_used),
    rateLimitPerMinute: row.rate_limit_per_minute,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    product: {
      id: row.product_id,
      name: row.product_name,
      slug: row.product_slug,
      iconUrl: row.product_icon,
    },
    plan: {
      id: row.plan_id,
      name: row.plan_name,
    },
  }));
}

/**
 * Retrieves comprehensive API usage analytics aggregated from real database records.
 */
export async function getUserUsageAnalytics(userId) {
  // 1. Total, successful, failed calls and average response time
  const summaryRes = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total_requests,
      COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 400)::int AS successful_requests,
      COUNT(*) FILTER (WHERE status_code >= 400)::int AS failed_requests,
      COALESCE(ROUND(AVG(response_time_ms)), 0)::int AS avg_latency_ms
    FROM api_usage
    WHERE user_id = $1;
    `,
    [userId]
  );

  const summary = summaryRes.rows[0];

  // 2. Usage in the last 30 days
  const monthRes = await pool.query(
    `
    SELECT COUNT(*)::int AS count_last_30_days
    FROM api_usage
    WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days';
    `,
    [userId]
  );

  // 3. Breakdown by API Product
  const byProductRes = await pool.query(
    `
    SELECT
      COALESCE(p.name, 'Core Developer Utilities') AS product_name,
      COALESCE(p.slug, 'core-utilities') AS product_slug,
      COALESCE(p.icon_url, '/icons/api-qrcode.svg') AS product_icon,
      COUNT(u.id)::int AS request_count
    FROM api_usage u
    LEFT JOIN api_products p ON u.api_product_id = p.id
    WHERE u.user_id = $1
    GROUP BY p.id, p.name, p.slug, p.icon_url
    ORDER BY request_count DESC;
    `,
    [userId]
  );

  // 4. Breakdown by HTTP Status Code
  const byStatusRes = await pool.query(
    `
    SELECT
      status_code,
      COUNT(*)::int AS count
    FROM api_usage
    WHERE user_id = $1
    GROUP BY status_code
    ORDER BY count DESC;
    `,
    [userId]
  );

  // 5. Breakdown by Endpoint
  const byEndpointRes = await pool.query(
    `
    SELECT
      endpoint,
      method,
      COUNT(*)::int AS count
    FROM api_usage
    WHERE user_id = $1
    GROUP BY endpoint, method
    ORDER BY count DESC
    LIMIT 10;
    `,
    [userId]
  );

  return {
    totalRequests: summary.total_requests || 0,
    successfulRequests: summary.successful_requests || 0,
    failedRequests: summary.failed_requests || 0,
    successRate: summary.total_requests > 0
      ? `${((summary.successful_requests / summary.total_requests) * 100).toFixed(1)}%`
      : "100%",
    avgLatencyMs: summary.avg_latency_ms || 0,
    callsThisMonth: monthRes.rows[0]?.count_last_30_days || 0,
    byProduct: byProductRes.rows,
    byStatusCode: byStatusRes.rows,
    byEndpoint: byEndpointRes.rows,
  };
}

/**
 * Retrieves recent API invocation logs with HTTP status codes and response times.
 */
export async function getUserRecentUsage(userId, limit = 20) {
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const res = await pool.query(
    `
    SELECT
      u.id,
      u.endpoint,
      u.method,
      u.status_code,
      u.response_time_ms,
      u.created_at,
      k.name AS key_name,
      k.key_prefix,
      p.name AS product_name
    FROM api_usage u
    LEFT JOIN api_keys k ON u.api_key_id = k.id
    LEFT JOIN api_products p ON u.api_product_id = p.id
    WHERE u.user_id = $1
    ORDER BY u.created_at DESC
    LIMIT $2;
    `,
    [userId, safeLimit]
  );

  return res.rows;
}
