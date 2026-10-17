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
import {
  queueRegistrationOtpEmail,
  queuePasswordResetOtpEmail,
  queueWelcomeEmail,
} from "./email.service.js";
import { verifyTurnstileToken } from "./captcha.service.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

/**
 * Validates registration input fields respecting Kruu length and format constraints.
 */
export function validateRegistrationInput(name, email, password) {
  if (!name || typeof name !== "string") {
    throw new ApiError(400, "Full name is required.");
  }
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters long.");
  }
  if (trimmedName.length > 25) {
    throw new ApiError(400, "Name cannot exceed 25 characters.");
  }

  if (!email || typeof email !== "string") {
    throw new ApiError(400, "Email address is required.");
  }
  const trimmedEmail = email.trim();
  if (trimmedEmail.length > 254 || !EMAIL_REGEX.test(trimmedEmail)) {
    throw new ApiError(400, "Please provide a valid email address.");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password is required.");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }
  if (password.length > 25) {
    throw new ApiError(400, "Password cannot exceed 25 characters.");
  }
}

/**
 * Validates new password input for resets.
 */
export function validatePasswordInput(password) {
  if (!password || typeof password !== "string") {
    throw new ApiError(400, "New password is required.");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }
  if (password.length > 25) {
    throw new ApiError(400, "Password cannot exceed 25 characters.");
  }
}

/**
 * Hashes a 6-digit OTP code using SHA-256 for secure storage.
 */
export function hashOtp(otpCode) {
  return crypto.createHash("sha256").update(String(otpCode).trim()).digest("hex");
}

/**
 * Timing-safe comparison of computed hash and stored hash.
 */
function isOtpHashMatch(rawOtp, storedHash) {
  const computedHash = hashOtp(rawOtp);
  const bufA = Buffer.from(computedHash, "hex");
  const bufB = Buffer.from(storedHash, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Initiates user registration by creating a pending OTP record and dispatching
 * the verification email via Brevo.
 */
export async function initiateRegistration({ name, email, password }) {
  validateRegistrationInput(name, email, password);

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if verified account already exists in users table
  const existingRes = await pool.query(
    "SELECT id, email_verified FROM users WHERE email = $1 LIMIT 1;",
    [normalizedEmail]
  );

  if (existingRes.rows.length > 0 && existingRes.rows[0].email_verified) {
    throw new ApiError(409, "An account with this email address already exists.");
  }

  // 2. Hash password securely with bcrypt (12 rounds)
  const passwordHash = await hashPassword(password);

  // 3. Generate cryptographically secure random 6-digit OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = hashOtp(rawOtp);

  // 4. Invalidate any previous pending registration OTPs for this email
  await pool.query(
    `
    UPDATE verification_otps 
    SET is_used = TRUE, updated_at = NOW()
    WHERE email = $1 AND purpose = 'registration' AND is_used = FALSE;
    `,
    [normalizedEmail]
  );

  // 5. Store new OTP in verification_otps table
  const insertOtpRes = await pool.query(
    `
    INSERT INTO verification_otps (
      email,
      otp_hash,
      purpose,
      metadata,
      expires_at,
      resend_available_at
    )
    VALUES (
      $1,
      $2,
      'registration',
      $3,
      NOW() + INTERVAL '5 minutes',
      NOW() + INTERVAL '60 seconds'
    )
    RETURNING id, expires_at, resend_available_at;
    `,
    [
      normalizedEmail,
      otpHash,
      JSON.stringify({ name: normalizedName, passwordHash }),
    ]
  );

  const otpRecord = insertOtpRes.rows[0];

  // 6. Send OTP to supplied email through Brevo
  const emailResult = await queueRegistrationOtpEmail({
    recipientEmail: normalizedEmail,
    recipientName: normalizedName,
    otpCode: rawOtp,
    otpId: otpRecord.id,
  });

  if (emailResult && emailResult.status === "failed") {
    let friendlyError = emailResult.deliveryError || "Email delivery failed.";
    if (friendlyError.includes("unrecognised IP address") || friendlyError.includes("authorised_ips")) {
      friendlyError = `Brevo rejected sending email: your current IP address is not authorized in Brevo. Please add your IP in Brevo: https://app.brevo.com/security/authorised_ips (${friendlyError})`;
    }
    throw new ApiError(502, friendlyError);
  }

  if (emailResult && emailResult.status === "config_missing") {
    throw new ApiError(503, "Email service is not configured on this server (BREVO_API_KEY is missing).");
  }

  return {
    success: true,
    message: "A verification code has been sent to your email. Please check your inbox.",
    email: normalizedEmail,
    resendCooldownSeconds: 60,
  };
}

/**
 * Verifies the 6-digit registration OTP, activates the user account,
 * creates an authenticated session, and dispatches the welcome email.
 */
export async function verifyRegistrationOtp({ email, otp }) {
  if (!email || !otp) {
    throw new ApiError(400, "Email address and 6-digit verification code are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  if (!OTP_REGEX.test(cleanOtp)) {
    throw new ApiError(400, "Verification code must be exactly 6 digits.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Fetch active registration OTP for this email
    const otpRes = await client.query(
      `
      SELECT id, otp_hash, metadata, attempts_count, max_attempts, expires_at, is_used
      FROM verification_otps
      WHERE email = $1 AND purpose = 'registration' AND is_used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE;
      `,
      [normalizedEmail]
    );

    const otpRecord = otpRes.rows[0];
    if (!otpRecord) {
      throw new ApiError(400, "Verification code has expired or is invalid. Please request a new code.");
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      await client.query("UPDATE verification_otps SET is_used = TRUE WHERE id = $1;", [otpRecord.id]);
      throw new ApiError(400, "Verification code has expired. Please request a new code.");
    }

    // Check attempt limits
    if (otpRecord.attempts_count >= otpRecord.max_attempts) {
      await client.query("UPDATE verification_otps SET is_used = TRUE WHERE id = $1;", [otpRecord.id]);
      throw new ApiError(429, "Too many incorrect verification attempts. Please request a new code.");
    }

    // Verify hash
    const isMatch = isOtpHashMatch(cleanOtp, otpRecord.otp_hash);
    if (!isMatch) {
      await client.query(
        "UPDATE verification_otps SET attempts_count = attempts_count + 1, updated_at = NOW() WHERE id = $1;",
        [otpRecord.id]
      );
      await client.query("COMMIT");
      throw new ApiError(400, "Invalid verification code. Please check your code and try again.");
    }

    // Mark OTP used immediately
    await client.query(
      "UPDATE verification_otps SET is_used = TRUE, updated_at = NOW() WHERE id = $1;",
      [otpRecord.id]
    );

    const metadata = typeof otpRecord.metadata === "string" 
      ? JSON.parse(otpRecord.metadata) 
      : otpRecord.metadata || {};

    const { name, passwordHash } = metadata;
    if (!name || !passwordHash) {
      throw new ApiError(400, "Registration metadata is corrupt. Please register again.");
    }

    // Prevent duplicate registrations / concurrent verification race
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1 FOR UPDATE;",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      throw new ApiError(409, "An account with this email address already exists.");
    }

    // Deterministically assign avatar
    const defaultAvatars = [
      "/avatars/avatar-1.svg",
      "/avatars/avatar-2.svg",
      "/avatars/avatar-3.svg",
      "/avatars/avatar-4.svg",
    ];
    const charSum = normalizedEmail.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const assignedAvatar = defaultAvatars[charSum % defaultAvatars.length];

    // 2. Activate user account in users table
    const userRes = await client.query(
      `
      INSERT INTO users (name, email, password_hash, email_verified, avatar)
      VALUES ($1, $2, $3, TRUE, $4)
      RETURNING id, name, email, avatar, role, created_at;
      `,
      [name, normalizedEmail, passwordHash, assignedAvatar]
    );

    const user = userRes.rows[0];

    // 3. Establish authenticated session
    const sessionId = crypto.randomUUID();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, sessionId);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await client.query(
      `
      INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '7 days');
      `,
      [sessionId, user.id, refreshTokenHash]
    );

    await client.query("COMMIT");

    // 4. Send welcome email through Brevo asynchronously
    await queueWelcomeEmail({
      recipientEmail: user.email,
      recipientName: user.name,
      userId: user.id,
    }).catch((err) => {
      console.warn("[Welcome Email] Non-fatal queue error:", err.message);
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || assignedAvatar,
        role: user.role || "user",
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Resends an active OTP for registration or password reset, respecting cooldown limits.
 */
export async function resendOtp({ email, purpose }) {
  if (!email || !purpose) {
    throw new ApiError(400, "Email address and purpose are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const validPurposes = ["registration", "password_reset"];
  if (!validPurposes.includes(purpose)) {
    throw new ApiError(400, "Invalid OTP purpose.");
  }

  // Find latest OTP record for this email and purpose
  const existingOtpRes = await pool.query(
    `
    SELECT id, metadata, resend_available_at
    FROM verification_otps
    WHERE email = $1 AND purpose = $2
    ORDER BY created_at DESC
    LIMIT 1;
    `,
    [normalizedEmail, purpose]
  );

  const existingOtp = existingOtpRes.rows[0];
  if (!existingOtp) {
    throw new ApiError(400, "No pending request found for this email address.");
  }

  // Check resend cooldown
  if (new Date(existingOtp.resend_available_at) > new Date()) {
    const secondsLeft = Math.ceil((new Date(existingOtp.resend_available_at) - new Date()) / 1000);
    throw new ApiError(429, `Please wait ${secondsLeft} second(s) before requesting a new code.`);
  }

  // Supersede prior OTPs
  await pool.query(
    `
    UPDATE verification_otps 
    SET is_used = TRUE, updated_at = NOW()
    WHERE email = $1 AND purpose = $2 AND is_used = FALSE;
    `,
    [normalizedEmail, purpose]
  );

  // Generate new OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = hashOtp(rawOtp);

  const insertOtpRes = await pool.query(
    `
    INSERT INTO verification_otps (
      email,
      otp_hash,
      purpose,
      metadata,
      expires_at,
      resend_available_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      NOW() + INTERVAL '5 minutes',
      NOW() + INTERVAL '60 seconds'
    )
    RETURNING id;
    `,
    [normalizedEmail, otpHash, purpose, existingOtp.metadata]
  );

  const newOtpId = insertOtpRes.rows[0].id;
  const metadata = typeof existingOtp.metadata === "string" 
    ? JSON.parse(existingOtp.metadata) 
    : existingOtp.metadata || {};

  const recipientName = metadata.name || "Developer";

  // Dispatch appropriate email via Brevo
  let emailResult;
  if (purpose === "registration") {
    emailResult = await queueRegistrationOtpEmail({
      recipientEmail: normalizedEmail,
      recipientName,
      otpCode: rawOtp,
      otpId: newOtpId,
    });
  } else if (purpose === "password_reset") {
    emailResult = await queuePasswordResetOtpEmail({
      recipientEmail: normalizedEmail,
      recipientName,
      otpCode: rawOtp,
      otpId: newOtpId,
    });
  }

  if (emailResult && emailResult.status === "failed") {
    let friendlyError = emailResult.deliveryError || "Email delivery failed.";
    if (friendlyError.includes("unrecognised IP address") || friendlyError.includes("authorised_ips")) {
      friendlyError = `Brevo rejected sending email: your current IP address is not authorized in Brevo. Please add your IP in Brevo: https://app.brevo.com/security/authorised_ips (${friendlyError})`;
    }
    throw new ApiError(502, friendlyError);
  }

  if (emailResult && emailResult.status === "config_missing") {
    throw new ApiError(503, "Email service is not configured on this server (BREVO_API_KEY is missing).");
  }

  return {
    success: true,
    message: "A new verification code has been sent to your email.",
    resendCooldownSeconds: 60,
  };
}

/**
 * Authenticates user credentials with CAPTCHA verification, password check,
 * and email verification validation.
 */
export async function login({ email, password, turnstileToken, clientIp }) {
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    throw new ApiError(400, "Email and password are required.");
  }

  // 1. Verify Cloudflare Turnstile CAPTCHA response if provided
  if (turnstileToken !== undefined) {
    await verifyTurnstileToken(turnstileToken, clientIp);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 2. Query user by normalized email
  const userRes = await pool.query(
    `
    SELECT id, name, email, avatar, role, password_hash, email_verified, status
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

  if (user.status === "suspended") {
    throw new ApiError(403, "Your account has been suspended. Please contact support.");
  }

  // If user registered purely via Google without a password
  if (!user.password_hash) {
    throw new ApiError(401, "This account uses Google Sign-In. Please click 'Continue with Google'.");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Reject unverified accounts
  if (!user.email_verified) {
    throw new ApiError(403, "Your email address is not verified. Please verify your email to log in.", {
      requiresVerification: true,
      email: user.email,
    });
  }

  // 3. Establish active session
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

  // Update last login timestamp asynchronously
  pool.query(
    "UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1;",
    [user.id]
  ).catch(() => {});

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "/avatars/avatar-1.svg",
      role: user.role || "user",
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Initiates the password recovery workflow: generates a secure 6-digit OTP,
 * stores it with a 5-minute expiry, and sends it through Brevo.
 * Returns a generic response to prevent account enumeration.
 */
export async function forgotPassword({ email }) {
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(400, "Please provide a valid email address.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const userRes = await pool.query(
    "SELECT id, name, email, status FROM users WHERE email = $1 LIMIT 1;",
    [normalizedEmail]
  );

  const user = userRes.rows[0];

  // If user exists and is active, generate and dispatch reset OTP
  if (user && user.status !== "suspended") {
    // Invalidate prior reset OTPs
    await pool.query(
      `
      UPDATE verification_otps 
      SET is_used = TRUE, updated_at = NOW()
      WHERE email = $1 AND purpose = 'password_reset' AND is_used = FALSE;
      `,
      [normalizedEmail]
    );

    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(rawOtp);

    const insertOtpRes = await pool.query(
      `
      INSERT INTO verification_otps (
        email,
        otp_hash,
        purpose,
        metadata,
        expires_at,
        resend_available_at
      )
      VALUES (
        $1,
        $2,
        'password_reset',
        $3,
        NOW() + INTERVAL '5 minutes',
        NOW() + INTERVAL '60 seconds'
      )
      RETURNING id;
      `,
      [
        normalizedEmail,
        otpHash,
        JSON.stringify({ userId: user.id, name: user.name }),
      ]
    );

    const otpId = insertOtpRes.rows[0].id;

    const emailResult = await queuePasswordResetOtpEmail({
      recipientEmail: normalizedEmail,
      recipientName: user.name,
      otpCode: rawOtp,
      otpId,
    });

    if (emailResult && emailResult.status === "failed") {
      let friendlyError = emailResult.deliveryError || "Email delivery failed.";
      if (friendlyError.includes("unrecognised IP address") || friendlyError.includes("authorised_ips")) {
        throw new ApiError(502, `Brevo rejected sending email: your current IP address is not authorized in Brevo. Please add your IP in Brevo: https://app.brevo.com/security/authorised_ips (${friendlyError})`);
      }
    }
  }

  // Always return generic confirmation to prevent user enumeration
  return {
    success: true,
    message: "If an eligible account is registered with this email, a verification code has been sent.",
    email: normalizedEmail,
    resendCooldownSeconds: 60,
  };
}

/**
 * Verifies the 6-digit password-reset OTP and grants a short-lived,
 * single-use reset authorization token.
 */
export async function verifyResetOtp({ email, otp }) {
  if (!email || !otp) {
    throw new ApiError(400, "Email address and 6-digit verification code are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  if (!OTP_REGEX.test(cleanOtp)) {
    throw new ApiError(400, "Verification code must be exactly 6 digits.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const otpRes = await client.query(
      `
      SELECT id, otp_hash, metadata, attempts_count, max_attempts, expires_at, is_used
      FROM verification_otps
      WHERE email = $1 AND purpose = 'password_reset' AND is_used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE;
      `,
      [normalizedEmail]
    );

    const otpRecord = otpRes.rows[0];
    if (!otpRecord) {
      throw new ApiError(400, "Verification code has expired or is invalid. Please request a new code.");
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      await client.query("UPDATE verification_otps SET is_used = TRUE WHERE id = $1;", [otpRecord.id]);
      throw new ApiError(400, "Verification code has expired. Please request a new code.");
    }

    if (otpRecord.attempts_count >= otpRecord.max_attempts) {
      await client.query("UPDATE verification_otps SET is_used = TRUE WHERE id = $1;", [otpRecord.id]);
      throw new ApiError(429, "Too many incorrect verification attempts. Please request a new code.");
    }

    const isMatch = isOtpHashMatch(cleanOtp, otpRecord.otp_hash);
    if (!isMatch) {
      await client.query(
        "UPDATE verification_otps SET attempts_count = attempts_count + 1, updated_at = NOW() WHERE id = $1;",
        [otpRecord.id]
      );
      await client.query("COMMIT");
      throw new ApiError(400, "Invalid verification code. Please check your code and try again.");
    }

    // Invalidate OTP immediately upon successful verification
    await client.query(
      "UPDATE verification_otps SET is_used = TRUE, updated_at = NOW() WHERE id = $1;",
      [otpRecord.id]
    );

    const metadata = typeof otpRecord.metadata === "string" 
      ? JSON.parse(otpRecord.metadata) 
      : otpRecord.metadata || {};

    const userId = metadata.userId;
    if (!userId) {
      throw new ApiError(400, "Invalid reset session. Please request a new password reset.");
    }

    // Generate secure single-use reset authorization token (32 bytes hex)
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawResetToken).digest("hex");

    await client.query(
      `
      INSERT INTO password_reset_authorizations (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, NOW() + INTERVAL '10 minutes');
      `,
      [userId, tokenHash]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Verification successful. You may now set your new password.",
      resetToken: rawResetToken,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Resets the user's password using the single-use reset authorization token,
 * hashes the new password with bcrypt, and revokes all active sessions.
 */
export async function resetPassword({ resetToken, newPassword }) {
  if (!resetToken || typeof resetToken !== "string") {
    throw new ApiError(400, "Reset authorization token is missing or invalid.");
  }

  validatePasswordInput(newPassword);

  const tokenHash = crypto.createHash("sha256").update(resetToken.trim()).digest("hex");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Look up active authorization
    const authRes = await client.query(
      `
      SELECT id, user_id, expires_at, is_used
      FROM password_reset_authorizations
      WHERE token_hash = $1 AND is_used = FALSE
      LIMIT 1
      FOR UPDATE;
      `,
      [tokenHash]
    );

    const authRecord = authRes.rows[0];
    if (!authRecord) {
      throw new ApiError(400, "Password reset authorization has expired or is invalid. Please request a new reset.");
    }

    if (new Date(authRecord.expires_at) < new Date()) {
      await client.query("UPDATE password_reset_authorizations SET is_used = TRUE WHERE id = $1;", [authRecord.id]);
      throw new ApiError(400, "Password reset authorization has expired. Please request a new reset.");
    }

    // Invalidate reset authorization (single-use)
    await client.query(
      "UPDATE password_reset_authorizations SET is_used = TRUE WHERE id = $1;",
      [authRecord.id]
    );

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in users table
    await client.query(
      `
      UPDATE users 
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2;
      `,
      [newPasswordHash, authRecord.user_id]
    );

    // Revoke all existing sessions for this user across all devices
    await client.query(
      `
      UPDATE sessions 
      SET revoked_at = NOW()
      WHERE user_id = $1 AND revoked_at IS NULL;
      `,
      [authRecord.user_id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Password changed successfully. Please sign in with your new password.",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Direct registration helper maintained for test suites and administrative bootstrapping.
 * If called directly without verification parameters, completes registration immediately.
 */
export async function register({ name, email, password, skipVerification = true }) {
  if (!skipVerification) {
    return await initiateRegistration({ name, email, password });
  }

  validateRegistrationInput(name, email, password);

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const existingRes = await pool.query(
    "SELECT id FROM users WHERE email = $1 LIMIT 1;",
    [normalizedEmail]
  );

  if (existingRes.rows.length > 0) {
    throw new ApiError(409, "An account with this email address already exists.");
  }

  const passwordHash = await hashPassword(password);

  const defaultAvatars = [
    "/avatars/avatar-1.svg",
    "/avatars/avatar-2.svg",
    "/avatars/avatar-3.svg",
    "/avatars/avatar-4.svg",
  ];
  const charSum = normalizedEmail.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const assignedAvatar = defaultAvatars[charSum % defaultAvatars.length];

  const userRes = await pool.query(
    `
    INSERT INTO users (name, email, password_hash, email_verified, avatar)
    VALUES ($1, $2, $3, TRUE, $4)
    RETURNING id, name, email, avatar, role, created_at;
    `,
    [normalizedName, normalizedEmail, passwordHash, assignedAvatar]
  );

  const user = userRes.rows[0];

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
      avatar: user.avatar || assignedAvatar,
      role: user.role || "user",
      createdAt: user.created_at,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Refreshes access token using a valid refresh token cookie.
 */
export async function refreshAccessToken(refreshTokenString) {
  if (!refreshTokenString) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenString);
  } catch {
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
    "SELECT id, name, email, avatar, role, status FROM users WHERE id = $1 LIMIT 1;",
    [decoded.userId]
  );

  const user = userRes.rows[0];
  if (!user) {
    throw new ApiError(401, "User not found.");
  }
  if (user.status === "suspended") {
    throw new ApiError(403, "Your account has been suspended. Please contact support.");
  }

  const newAccessToken = generateAccessToken(user);

  return {
    accessToken: newAccessToken,
    user,
  };
}

/**
 * Logs out user and revokes session.
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
 * Retrieves current authenticated user profile.
 */
export async function getCurrentUser(userId) {
  const userRes = await pool.query(
    `
    SELECT id, name, email, avatar, role, email_verified, google_id, created_at, last_login_at
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

  return {
    ...user,
    avatar: user.avatar || "/avatars/avatar-1.svg",
    role: user.role || "user",
    hasGoogleAuth: Boolean(user.google_id),
  };
}
