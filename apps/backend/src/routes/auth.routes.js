import { Router } from "express";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleGetMe,
} from "../controllers/auth.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, handleRegister);
router.post("/login", authRateLimiter, handleLogin);
router.post("/refresh-token", handleRefreshToken);
router.post("/logout", handleLogout);
router.get("/me", verifyAuth, handleGetMe);

export default router;
