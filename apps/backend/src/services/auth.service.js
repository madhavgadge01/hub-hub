import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { hashPassword, comparePassword } from "../utils/crypto.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and normalizes registration inputs.
 */
function validateRegistrationInput(name, email, password) {
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters long.");
  }
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(400, "Please provide a valid email address.");
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }
}

/**
 * Register a new user account and initialize their session.
 */
export async function register({ name, email, password }) {
  validateRegistrationInput(name, email, password);

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check for existing account BEFORE expensive hashing
  const existingRes = await pool.query(
    "SELECT id FROM users WHERE email = $1 LIMIT 1;",
    [normalizedEmail]
  );

  if (existingRes.rows.length > 0) {
    throw new ApiError(409, "An account with this email address already exists.");
  }

  // 2. Hash password securely
  const passwordHash = await hashPassword(password);

  // 3. Create user record
  const userRes = await pool.query(
    `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at;
    `,
    [normalizedName, normalizedEmail, passwordHash]
  );

  const user = userRes.rows[0];

  // 4. Create active session
  const sessionId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, sessionId);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await pool.query(
    `
    INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
    VALUES ($1, $2, $3, NOW() + INTERVAL '7 days');
    `,
    [sessionId, user.id, refreshTokenHash]
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticate user credentials and establish a new session.
 */
export async function login({ email, password }) {
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    throw new ApiError(400, "Email and password are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find user by normalized email
  const userRes = await pool.query(
    `
    SELECT id, name, email, password_hash
    FROM users
    WHERE email = $1
    LIMIT 1;
    `,
    [normalizedEmail]
  );

  const user = userRes.rows[0];
  if (!user) {
    // Avoid user enumeration
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Create session
  const sessionId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, sessionId);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await pool.query(
    `
    INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
    VALUES ($1, $2, $3, NOW() + INTERVAL '7 days');
    `,
    [sessionId, user.id, refreshTokenHash]
  );

  // Update last login asynchronously without blocking
  pool.query(
    "UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1;",
    [user.id]
  ).catch(() => {});

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh access token using a valid refresh token cookie.
 */
export async function refreshAccessToken(refreshTokenString) {
  if (!refreshTokenString) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenString);
  } catch (err) {
    throw new ApiError(401, "Refresh token is invalid or expired.");
  }

  const sessionRes = await pool.query(
    `
    SELECT id, user_id, refresh_token_hash, expires_at, revoked_at
    FROM sessions
    WHERE id = $1 AND user_id = $2
    LIMIT 1;
    `,
    [decoded.sessionId, decoded.userId]
  );

  const session = sessionRes.rows[0];
  if (!session) {
    throw new ApiError(401, "Session not found.");
  }
  if (session.revoked_at) {
    throw new ApiError(401, "Session has been revoked. Please sign in again.");
  }
  if (new Date(session.expires_at) < new Date()) {
    throw new ApiError(401, "Session has expired. Please sign in again.");
  }

  const isValid = await bcrypt.compare(refreshTokenString, session.refresh_token_hash);
  if (!isValid) {
    throw new ApiError(401, "Invalid session credentials.");
  }

  const userRes = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1 LIMIT 1;",
    [decoded.userId]
  );

  const user = userRes.rows[0];
  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  const newAccessToken = generateAccessToken(user);

  return {
    accessToken: newAccessToken,
    user,
  };
}

/**
 * Logout and invalidate session.
 */
export async function logout(sessionId) {
  if (sessionId) {
    await pool.query(
      "UPDATE sessions SET revoked_at = NOW() WHERE id = $1;",
      [sessionId]
    );
  }
  return { success: true };
}

/**
 * Retrieve current user profile by user ID.
 */
export async function getCurrentUser(userId) {
  const userRes = await pool.query(
    `
    SELECT id, name, email, created_at, last_login_at
    FROM users
    WHERE id = $1
    LIMIT 1;
    `,
    [userId]
  );

  const user = userRes.rows[0];
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
}
