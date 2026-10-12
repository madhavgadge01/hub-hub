import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { healthCheck, readinessCheck } from "./controllers/health.controller.js";
import authRoutes from "./routes/auth.routes.js";
import apiKeyRoutes from "./routes/apiKey.routes.js";
import utilityRoutes from "./routes/utility.routes.js";
import developerRoutes from "./routes/developer.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import toolsRoutes from "./routes/tools.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import { handleRazorpayWebhook } from "./controllers/checkout.controller.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: env.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration supporting credentials and custom headers
const allowedOrigins = env.corsOrigin
  ? env.corsOrigin.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, or specific origin
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
      "Retry-After",
    ],
  })
);

// Request body parsers with sensible limits and raw body preservation for webhook signature checks
app.use(
  express.json({
    limit: "2mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Root health & readiness endpoints
app.get("/health", healthCheck);
app.get("/ready", readinessCheck);

// Dedicated Razorpay Webhook endpoint
app.post("/api/webhooks/razorpay", handleRazorpayWebhook);

// Browser-facing Application API routes
app.use("/api/auth", authRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/utilities", utilityRoutes);
app.use("/api/tools", toolsRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/profile", profileRoutes);

// Protected Developer API endpoints (v1)
app.use("/api/v1", developerRoutes);

// Legacy backward-compatibility alias routes for user operations
app.use("/api/v1/user", authRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
