import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { queueWelcomeEmail } from "./email.service.js";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

const ALLOWED_REDIRECT_PATHS = [
  "/profile",
  "/profile/api-keys",
  "/profile/purchases",
  "/profile/analytics",
  "/profile/billing",
  "/api-market",
  "/tools",
  "/",
];

/**
 * Checks whether Google OAuth is configured on this server.
 */
export function isGoogleOAuthConfigured() {
  return Boolean(
    env.googleClientId &&
    env.googleClientSecret &&
    !env.googleClientId.includes("YourKey") &&
    !env.googleClientId.includes("placeholder")
  );
}

/**
 * Validates and normalizes the returnTo redirect destination to prevent open redirects.
 */
export function sanitizeRedirectDestination(returnTo) {
  if (!returnTo || typeof returnTo !== "string") {
    return "/profile";
  }
  const cleanPath = returnTo.trim().split("?")[0];
  if (ALLOWED_REDIRECT_PATHS.includes(cleanPath)) {
    return returnTo.trim();
  }
  return "/profile";
}

/**
 * Generates the Google OAuth authorization URL with CSRF state protection.
 */
export async function getGoogleAuthorizationUrl(returnTo = "/profile") {
  if (!isGoogleOAuthConfigured()) {
    throw new ApiError(
      503,
      "Google OAuth 2.0 is not configured on this server. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
    );
  }

  const sanitizedDestination = sanitizeRedirectDestination(returnTo);
  const state = crypto.randomBytes(32).toString("hex");

  // Store CSRF state with 10-minute expiry
  await pool.query(
    `
    INSERT INTO oauth_states (state, redirect_uri, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
    ON CONFLICT (state) DO NOTHING;
    `,
    [state, sanitizedDestination]
  );

  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: env.googleCallbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Handles the Google OAuth callback exchange, validates identity claims,
 * and provisions or authenticates the user account.
 */
export async function processGoogleCallback({ code, state, error }) {
  if (error) {
    if (error === "access_denied") {
      return { cancelled: true, reason: "Google sign-in was cancelled." };
    }
    return { error: `Google OAuth provider returned: ${error}` };
  }

  if (!code || !state) {
    return { error: "Missing authorization code or state parameter from Google." };
  }

  // 1. Validate and consume state token (one-time use, prevents replay attacks)
  const stateRes = await pool.query(
    `
    DELETE FROM oauth_states 
    WHERE state = $1 AND expires_at > NOW()
    RETURNING redirect_uri;
    `,
    [state]
  );

  if (stateRes.rows.length === 0) {
    return { error: "OAuth security state has expired or is invalid. Please try signing in again." };
  }

  const returnDestination = stateRes.rows[0].redirect_uri || "/profile";

  // 2. Exchange authorization code for tokens with Google
  const tokenParams = new URLSearchParams({
    code,
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: env.googleCallbackUrl,
    grant_type: "authorization_code",
  });

  let tokenData;
  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("[Google OAuth] Token exchange error:", errText);
      return { error: "Failed to exchange authorization code with Google. Please try again." };
    }

    tokenData = await tokenResponse.json();
  } catch (err) {
    console.error("[Google OAuth] Token network failure:", err.message);
    return { error: "Network failure communicating with Google OAuth service." };
  }

  const { access_token: accessToken } = tokenData;
  if (!accessToken) {
    return { error: "Google did not return an access token." };
  }

  // 3. Fetch verified userinfo using access token
  let googleUser;
  try {
    const userinfoResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!userinfoResponse.ok) {
      return { error: "Failed to retrieve verified profile information from Google." };
    }

    googleUser = await userinfoResponse.json();
  } catch (err) {
    console.error("[Google OAuth] Userinfo fetch error:", err.message);
    return { error: "Network failure retrieving Google profile identity." };
  }

  const googleSub = googleUser.sub;
  const rawEmail = googleUser.email;
  const isEmailVerified = googleUser.email_verified === true || googleUser.email_verified === "true";
  const importedName = (googleUser.name || googleUser.given_name || "Developer").trim();
  const googlePicture = googleUser.picture;

  if (!googleSub) {
    return { error: "Google did not provide a valid subject identifier." };
  }
  if (!rawEmail || !isEmailVerified) {
    return { error: "Your Google account email address is not verified by Google. Please verify it in Google first." };
  }

  const normalizedEmail = rawEmail.trim().toLowerCase();

  // 4. Case 1: Returning Google user (match google_id)
  const existingGoogleUserRes = await pool.query(
    `
    SELECT id, name, email, avatar, role, status
    FROM users
    WHERE google_id = $1
    LIMIT 1;
    `,
    [googleSub]
  );

  if (existingGoogleUserRes.rows.length > 0) {
    const user = existingGoogleUserRes.rows[0];

    if (user.status === "suspended") {
      return { error: "Your Kruu account has been suspended. Please contact support." };
    }

    // Establish authenticated session
    const sessionResult = await establishUserSession(user);

    // Update last login timestamp asynchronously
    pool.query(
      "UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1;",
      [user.id]
    ).catch(() => {});

    return {
      success: true,
      user,
      accessToken: sessionResult.accessToken,
      refreshToken: sessionResult.refreshToken,
      redirectDestination: returnDestination,
    };
  }

  // 5. Case 2: User exists with this email, but NOT linked to this Google ID
  // Security requirement: Do NOT automatically link accounts merely because emails match!
  const existingEmailUserRes = await pool.query(
    `
    SELECT id, name, email, google_id
    FROM users
    WHERE email = $1
    LIMIT 1;
    `,
    [normalizedEmail]
  );

  if (existingEmailUserRes.rows.length > 0) {
    // Existing password or separate account exists. Refuse automatic takeover.
    return {
      requiresLinking: true,
      email: normalizedEmail,
      message: "An account with this email address already exists. Please log in with your email and password to safely verify ownership before linking Google.",
    };
  }

  // 6. Case 3: New Google user
  // Requirement: If imported name exceeds 25 characters, ask user to choose a compliant display name
  if (importedName.length > 25) {
    const setupToken = jwt.sign(
      {
        googleSub,
        email: normalizedEmail,
        avatar: googlePicture || null,
        purpose: "google_setup_name",
      },
      env.accessTokenSecret,
      { expiresIn: "15m" }
    );

    return {
      requiresNameChoice: true,
      setupToken,
      email: normalizedEmail,
      suggestedName: importedName.slice(0, 25),
      redirectDestination: returnDestination,
    };
  }

  // Name is compliant (<= 25 chars): Create account directly
  const defaultAvatars = [
    "/avatars/avatar-1.svg",
    "/avatars/avatar-2.svg",
    "/avatars/avatar-3.svg",
    "/avatars/avatar-4.svg",
  ];
  const charSum = normalizedEmail.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const assignedAvatar = defaultAvatars[charSum % defaultAvatars.length];

  const newUserRes = await pool.query(
    `
    INSERT INTO users (name, email, google_id, email_verified, avatar)
    VALUES ($1, $2, $3, TRUE, $4)
    RETURNING id, name, email, avatar, role, created_at;
    `,
    [importedName, normalizedEmail, googleSub, assignedAvatar]
  );

  const newUser = newUserRes.rows[0];

  // Create session
  const sessionResult = await establishUserSession(newUser);

  // Queue welcome email via Brevo
  await queueWelcomeEmail({
    recipientEmail: newUser.email,
    recipientName: newUser.name,
    userId: newUser.id,
  });

  return {
    success: true,
    user: newUser,
    accessToken: sessionResult.accessToken,
    refreshToken: sessionResult.refreshToken,
    redirectDestination: returnDestination,
    isNewUser: true,
  };
}

/**
 * Completes new Google user registration when their original Google name exceeded 25 characters.
 */
export async function completeGoogleRegistrationWithName({ setupToken, name }) {
  if (!setupToken || !name || typeof name !== "string") {
    throw new ApiError(400, "Setup token and display name are required.");
  }

  const normalizedName = name.trim();
  if (normalizedName.length < 2 || normalizedName.length > 25) {
    throw new ApiError(400, "Display name must be between 2 and 25 characters.");
  }

  let decoded;
  try {
    decoded = jwt.verify(setupToken, env.accessTokenSecret);
    if (decoded.purpose !== "google_setup_name") {
      throw new Error();
    }
  } catch {
    throw new ApiError(400, "Setup session has expired or is invalid. Please try signing in with Google again.");
  }

  const { googleSub, email: normalizedEmail } = decoded;

  // Check if account was created concurrently
  const existingUserRes = await pool.query(
    "SELECT id FROM users WHERE google_id = $1 OR email = $2 LIMIT 1;",
    [googleSub, normalizedEmail]
  );
  if (existingUserRes.rows.length > 0) {
    throw new ApiError(409, "An account with this email or Google profile already exists.");
  }

  const defaultAvatars = [
    "/avatars/avatar-1.svg",
    "/avatars/avatar-2.svg",
    "/avatars/avatar-3.svg",
    "/avatars/avatar-4.svg",
  ];
  const charSum = normalizedEmail.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const assignedAvatar = defaultAvatars[charSum % defaultAvatars.length];

  const newUserRes = await pool.query(
    `
    INSERT INTO users (name, email, google_id, email_verified, avatar)
    VALUES ($1, $2, $3, TRUE, $4)
    RETURNING id, name, email, avatar, role, created_at;
    `,
    [normalizedName, normalizedEmail, googleSub, assignedAvatar]
  );

  const newUser = newUserRes.rows[0];
  const sessionResult = await establishUserSession(newUser);

  // Queue welcome email via Brevo
  await queueWelcomeEmail({
    recipientEmail: newUser.email,
    recipientName: newUser.name,
    userId: newUser.id,
  });

  return {
    user: newUser,
    accessToken: sessionResult.accessToken,
    refreshToken: sessionResult.refreshToken,
  };
}

/**
 * Creates a new active session and returns JWT pair.
 */
async function establishUserSession(user) {
  const sessionId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, sessionId);
  const refreshTokenHash = await import("bcrypt").then((b) => b.default.hash(refreshToken, 10));

  await pool.query(
    `
    INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
    VALUES ($1, $2, $3, NOW() + INTERVAL '7 days');
    `,
    [sessionId, user.id, refreshTokenHash]
  );

  return { accessToken, refreshToken, sessionId };
}
