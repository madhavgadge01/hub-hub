import jwt from "jsonwebtoken";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from "../services/auth.service.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await register({ name, email, password });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "Account registered successfully.",
    user,
    accessToken,
  });
});

export const handleLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await login({ email, password });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    user,
    accessToken,
  });
});

export const handleRefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { accessToken, user } = await refreshAccessToken(refreshToken);

  setAuthCookies(res, accessToken, null);

  res.status(200).json({
    success: true,
    message: "Access token refreshed.",
    accessToken,
    user,
  });
});

export const handleLogout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  let sessionId = null;

  if (refreshToken) {
    try {
      const decoded = jwt.decode(refreshToken);
      sessionId = decoded?.sessionId;
    } catch {
      // Ignore parse failure on logout
    }
  }

  await logout(sessionId);
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

export const handleGetMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});
