import pool from "../config/db.js";
import redis from "../config/redis.js";

const startTime = Date.now();

export const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "Hub&Hub API service is running.",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
};

export const readinessCheck = async (req, res) => {
  const checks = {
    database: false,
    redis: false,
  };

  try {
    const dbRes = await pool.query("SELECT 1 as alive;");
    if (dbRes.rows[0]?.alive === 1) {
      checks.database = true;
    }
  } catch (err) {
    checks.databaseError = err.message;
  }

  try {
    const redisPong = await redis.ping();
    if (redisPong === "PONG") {
      checks.redis = true;
    }
  } catch (err) {
    checks.redisError = err.message;
  }

  const isReady = checks.database && checks.redis;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    success: isReady,
    status: isReady ? "ready" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
};
