import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleGetUsageAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Total usage count
  const totalRes = await pool.query(
    "SELECT COUNT(*) as total FROM api_usage WHERE user_id = $1;",
    [userId]
  );
  const totalCalls = parseInt(totalRes.rows[0].total, 10) || 0;

  // 2. Usage in last 30 days
  const monthRes = await pool.query(
    `
    SELECT COUNT(*) as month_total
    FROM api_usage
    WHERE user_id = $1
      AND created_at >= NOW() - INTERVAL '30 days';
    `,
    [userId]
  );
  const callsThisMonth = parseInt(monthRes.rows[0].month_total, 10) || 0;

  // 3. Breakdown by endpoint
  const endpointRes = await pool.query(
    `
    SELECT endpoint, COUNT(*) as count
    FROM api_usage
    WHERE user_id = $1
    GROUP BY endpoint
    ORDER BY count DESC
    LIMIT 10;
    `,
    [userId]
  );

  // 4. Recent activity log
  const recentRes = await pool.query(
    `
    SELECT
      u.id,
      u.endpoint,
      u.method,
      u.status_code,
      u.response_time_ms,
      u.created_at,
      k.name as key_name,
      k.key_prefix
    FROM api_usage u
    JOIN api_keys k ON u.api_key_id = k.id
    WHERE u.user_id = $1
    ORDER BY u.created_at DESC
    LIMIT 20;
    `,
    [userId]
  );

  res.status(200).json({
    success: true,
    analytics: {
      totalCalls,
      callsThisMonth,
      byEndpoint: endpointRes.rows,
      recentActivity: recentRes.rows,
    },
  });
});
