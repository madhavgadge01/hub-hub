import redis, { isRedisReady } from "../config/redis.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 60;

// Atomic Lua script to increment counter and set expiry on first hit
const LUA_RATE_LIMIT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[1]))
end
local ttl = redis.call("TTL", KEYS[1])
return { current, ttl }
`;

/**
 * Developer API rate limiter using atomic Redis Lua scripts.
 * 60 requests per 60-second window per API key.
 */
export async function apiKeyRateLimiter(req, res, next) {
  const apiKeyId = req.apiKey?.id;
  if (!apiKeyId) {
    return next(new ApiError(500, "API key rate limiter invoked without verified API key context."));
  }

  const redisKey = `ratelimit:apikey:${apiKeyId}`;

  try {
    const [count, ttl] = await redis.eval(
      LUA_RATE_LIMIT,
      1,
      redisKey,
      RATE_LIMIT_WINDOW_SECONDS,
      RATE_LIMIT_MAX_REQUESTS
    );

    const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - count);
    const resetTime = Math.max(0, ttl);

    // Set standard rate limit headers
    res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTime);

    if (count > RATE_LIMIT_MAX_REQUESTS) {
      res.setHeader("Retry-After", resetTime);
      return next(
        new ApiError(
          429,
          `Rate limit exceeded. Quota is ${RATE_LIMIT_MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW_SECONDS} seconds. Retry in ${resetTime}s.`
        )
      );
    }

    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);

    console.error("❌ Redis rate limiter error:", err.message);

    if (env.isProduction) {
      // In production, never silently disable rate limiting
      return next(
        new ApiError(
          503,
          "Rate limiting service is temporarily unreachable. Please retry your request shortly."
        )
      );
    }

    // In local development, warn and allow degraded request with warning header
    res.setHeader("X-RateLimit-Warning", "Redis offline, rate limiting degraded");
    next();
  }
}

/**
 * Authentication login brute-force limiter (5 requests per 15 minutes per IP).
 */
export async function authRateLimiter(req, res, next) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
  const redisKey = `ratelimit:auth:${ip}`;
  const AUTH_WINDOW = 15 * 60; // 15 mins
  const AUTH_MAX = 10; // 10 attempts

  try {
    if (isRedisReady()) {
      const [count, ttl] = await redis.eval(
        LUA_RATE_LIMIT,
        1,
        redisKey,
        AUTH_WINDOW,
        AUTH_MAX
      );

      if (count > AUTH_MAX) {
        res.setHeader("Retry-After", ttl);
        return next(
          new ApiError(
            429,
            `Too many authentication attempts. Please try again in ${Math.ceil(ttl / 60)} minutes.`
          )
        );
      }
    }
    next();
  } catch (err) {
    // Non-fatal for auth attempt if Redis has glitch, continue
    next();
  }
}
