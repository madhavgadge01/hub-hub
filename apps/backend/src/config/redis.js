import Redis from "ioredis";
import { env } from "./env.js";

let redisClient = null;
let isRedisConnected = false;

export function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 10) {
          console.warn("⚠️ Redis reconnect retries exceeded limit of 10. Backing off.");
          return null;
        }
        return Math.min(times * 200, 3000);
      },
      reconnectOnError(err) {
        return true;
      },
      enableOfflineQueue: true,
      lazyConnect: false,
    });

    redisClient.on("connect", () => {
      isRedisConnected = true;
      console.log("Redis connected successfully.");
    });

    redisClient.on("ready", () => {
      isRedisConnected = true;
    });

    redisClient.on("error", (err) => {
      isRedisConnected = false;
      console.warn("⚠️ Redis client connection issue:", err.message);
    });

    redisClient.on("close", () => {
      isRedisConnected = false;
    });
  }

  return redisClient;
}

export function isRedisReady() {
  return isRedisConnected;
}

export async function closeRedisClient() {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log("Redis client disconnected gracefully.");
    } catch (err) {
      console.error("Error quitting Redis client:", err.message);
    }
  }
}

export const redis = getRedisClient();
export default redis;