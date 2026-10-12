import "dotenv/config";

/**
 * Validates critical environment variables at startup.
 * Throws descriptive errors if required variables are missing or misconfigured.
 */
export function validateEnv() {
  const required = [
    "PORT",
    "DB_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET"
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Startup fatal: Missing required environment variable(s): ${missing.join(", ")}`);
  }

  // Ensure secrets have adequate length for cryptographic security
  if (process.env.ACCESS_TOKEN_SECRET.length < 12) {
    throw new Error("Startup fatal: ACCESS_TOKEN_SECRET must be at least 12 characters long.");
  }
  if (process.env.REFRESH_TOKEN_SECRET.length < 12) {
    throw new Error("Startup fatal: REFRESH_TOKEN_SECRET must be at least 12 characters long.");
  }
}

export const env = {
  port: parseInt(process.env.PORT || "8000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  dbUrl: process.env.DB_URL,
  dbSsl: process.env.DB_SSL === "true" || (process.env.DB_URL && process.env.DB_URL.includes("sslmode=require")),
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  masterApiKey: process.env.MASTER_API_KEY || null,

  // Razorpay Integration
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || null,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || null,

  // Brevo Transactional Email Integration
  brevoApiKey: process.env.BREVO_API_KEY || null,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || "support@hubhub.dev",
  brevoSenderName: process.env.BREVO_SENDER_NAME || "Hub&Hub Platform",

  // Application URLs
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

