import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load from current working directory, apps/backend/.env, and repo root .env
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

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
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || "support@kruu.online",
  brevoSenderName: process.env.BREVO_SENDER_NAME || "Kruu",

  // Cloudflare Turnstile CAPTCHA Integration
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || null,

  // Google OAuth 2.0 Integration
  googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ||
    (process.env.BACKEND_URL
      ? `${process.env.BACKEND_URL}/api/auth/google/callback`
      : "http://localhost:8000/api/auth/google/callback"),

  // Application URLs
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

