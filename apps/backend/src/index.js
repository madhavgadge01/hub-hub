import "dotenv/config";
import app from "./app.js";
import { env, validateEnv } from "./config/env.js";
import { testDbConnection, closeDbPool } from "./config/db.js";
import { closeRedisClient } from "./config/redis.js";

async function startServer() {
  try {
    // 1. Validate environment configuration
    validateEnv();

    // 2. Test database connection
    const dbTime = await testDbConnection();
    console.log(`✅ PostgreSQL connected successfully (DB Time: ${dbTime.now.toISOString()})`);

    // 3. Start Express server
    const server = app.listen(env.port, () => {
      console.log(`🚀 Hub&Hub backend running on http://localhost:${env.port} [${env.nodeEnv}]`);
    });

    // 4. Graceful shutdown handler
    const handleShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        console.log("HTTP server stopped accepting connections.");
        await closeDbPool();
        await closeRedisClient();
        console.log("Graceful shutdown completed.");
        process.exit(0);
      });

      // Force shutdown after 10s timeout
      setTimeout(() => {
        console.error("Forceful shutdown after timeout.");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));

  } catch (error) {
    console.error("❌ Fatal server startup error:", error.message);
    process.exit(1);
  }
}

startServer();