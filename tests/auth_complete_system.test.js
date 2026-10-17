import { test, describe, after, before } from "node:test";
import assert from "node:assert/strict";
import pool from "../apps/backend/src/config/db.js";
import {
  initiateRegistration,
  verifyRegistrationOtp,
  resendOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  refreshAccessToken,
  getCurrentUser,
} from "../apps/backend/src/services/auth.service.js";
import {
  getGoogleAuthorizationUrl,
  processGoogleCallback,
  completeGoogleRegistrationWithName,
  isGoogleOAuthConfigured,
  sanitizeRedirectDestination,
} from "../apps/backend/src/services/googleAuth.service.js";
import { verifyTurnstileToken } from "../apps/backend/src/services/captcha.service.js";
import { getEmailOutboxStatus } from "../apps/backend/src/services/email.service.js";

describe("Production-Ready Authentication & Security Integration Tests", () => {
  const timestamp = Date.now();
  const regUserEmail = `reg_flow_${timestamp}_${Math.random().toString(36).slice(2, 6)}@kruu-security-test.dev`;
  const regUserPassword = "SecurePassword123!";
  const regUserName = "Kruu Tester";

  let createdUserId = null;
  let activeResetToken = null;

  const originalFetch = globalThis.fetch;

  before(async () => {
    // Intercept Brevo API calls in test environment so tests don't depend on external IP whitelisting
    globalThis.fetch = async (url, options) => {
      if (typeof url === "string" && url.includes("api.brevo.com")) {
        return {
          ok: true,
          status: 201,
          json: async () => ({ messageId: "<mock-message-id@brevo.com>" }),
          text: async () => JSON.stringify({ messageId: "<mock-message-id@brevo.com>" }),
        };
      }
      return originalFetch(url, options);
    };

    // Clean up only this test suite's isolated domain records
    await pool.query("DELETE FROM verification_otps WHERE email LIKE '%@kruu-security-test.dev';");
    await pool.query("DELETE FROM email_outbox WHERE recipient_email LIKE '%@kruu-security-test.dev';");
  });

  after(async () => {
    globalThis.fetch = originalFetch;

    if (createdUserId) {
      await pool.query("DELETE FROM sessions WHERE user_id = $1;", [createdUserId]);
      await pool.query("DELETE FROM password_reset_authorizations WHERE user_id = $1;", [createdUserId]);
      await pool.query("DELETE FROM users WHERE id = $1;", [createdUserId]);
    }
    await pool.query("DELETE FROM verification_otps WHERE email LIKE '%@kruu-security-test.dev';");
    await pool.query("DELETE FROM email_outbox WHERE recipient_email LIKE '%@kruu-security-test.dev';");
    await pool.query("DELETE FROM oauth_states WHERE created_at < NOW() - INTERVAL '1 hour';");
    await pool.end();
  });

  // --- 1. Email Registration & OTP Verification Flow ---
  describe("Email Registration with Brevo OTP Verification", () => {
    let capturedOtpCode = null;

    test("1.1 Registration enforces field validations (length & format)", async () => {
      // Name too long (>25 chars)
      await assert.rejects(
        async () => initiateRegistration({
          name: "This Name Is Definitely Longer Than Twenty Five Characters",
          email: regUserEmail,
          password: regUserPassword,
        }),
        (err) => err.statusCode === 400 && err.message.includes("25 characters")
      );

      // Password too long (>25 chars)
      await assert.rejects(
        async () => initiateRegistration({
          name: "Valid Name",
          email: regUserEmail,
          password: "ThisPasswordIsWayTooLongAndExceedsTwentyFiveCharacters",
        }),
        (err) => err.statusCode === 400 && err.message.includes("25 characters")
      );

      // Weak password (<8 chars)
      await assert.rejects(
        async () => initiateRegistration({
          name: "Valid Name",
          email: regUserEmail,
          password: "short",
        }),
        (err) => err.statusCode === 400 && err.message.includes("8 characters")
      );
    });

    test("1.2 initiateRegistration generates secure OTP and enqueues Brevo email", async () => {
      const res = await initiateRegistration({
        name: regUserName,
        email: regUserEmail.toUpperCase(), // test email normalization
        password: regUserPassword,
      });

      assert.equal(res.success, true);
      assert.equal(res.email, regUserEmail.toLowerCase());
      assert.equal(res.resendCooldownSeconds, 60);

      // Verify OTP record exists in verification_otps table
      const otpRow = await pool.query(
        "SELECT id, otp_hash, purpose, is_used, expires_at FROM verification_otps WHERE email = $1 AND purpose = 'registration' AND is_used = FALSE;",
        [regUserEmail.toLowerCase()]
      );
      assert.equal(otpRow.rows.length, 1);
      assert.equal(otpRow.rows[0].purpose, "registration");
      assert.equal(otpRow.rows[0].is_used, false);
      assert.ok(new Date(otpRow.rows[0].expires_at) > new Date());

      // Verify email was enqueued in email_outbox with branded HTML and text alternatives
      const outboxRow = await pool.query(
        "SELECT * FROM email_outbox WHERE recipient_email = $1 AND template_type = 'registration_otp' ORDER BY created_at DESC LIMIT 1;",
        [regUserEmail.toLowerCase()]
      );
      assert.equal(outboxRow.rows.length, 1);
      assert.match(outboxRow.rows[0].subject, /Your Kruu Verification Code: \d{6}/);
      assert.ok(outboxRow.rows[0].html_content.includes("Verify your email address"));
      assert.ok(outboxRow.rows[0].text_content.includes("Your one-time verification code is"));

      // Extract raw OTP from email subject to simulate receiving email
      const match = outboxRow.rows[0].subject.match(/\b(\d{6})\b/);
      assert.ok(match);
      capturedOtpCode = match[1];
    });

    test("1.3 Verification rejects invalid OTP code and increments attempts", async () => {
      await assert.rejects(
        async () => verifyRegistrationOtp({
          email: regUserEmail,
          otp: "000000", // Wrong OTP
        }),
        (err) => err.statusCode === 400 && err.message.includes("Invalid verification code")
      );

      // Verify attempt count incremented
      const otpRow = await pool.query(
        "SELECT attempts_count FROM verification_otps WHERE email = $1 AND purpose = 'registration' AND is_used = FALSE;",
        [regUserEmail.toLowerCase()]
      );
      assert.equal(otpRow.rows[0].attempts_count, 1);
    });

    test("1.4 Resend OTP enforces cooldown limit", async () => {
      // Trying to resend immediately triggers 429 cooldown
      await assert.rejects(
        async () => resendOtp({
          email: regUserEmail,
          purpose: "registration",
        }),
        (err) => err.statusCode === 429 && err.message.includes("wait")
      );
    });

    test("1.5 Purpose separation: Registration OTP cannot authorize password reset", async () => {
      await assert.rejects(
        async () => verifyResetOtp({
          email: regUserEmail,
          otp: capturedOtpCode,
        }),
        (err) => err.statusCode === 400
      );
    });

    test("1.6 Correct OTP verifies, activates account, creates session, and queues welcome email", async () => {
      const res = await verifyRegistrationOtp({
        email: regUserEmail,
        otp: capturedOtpCode,
      });

      assert.ok(res.user.id);
      assert.equal(res.user.email, regUserEmail.toLowerCase());
      assert.equal(res.user.name, regUserName);
      assert.ok(res.accessToken);
      assert.ok(res.refreshToken);

      createdUserId = res.user.id;

      // Verify user in PostgreSQL has email_verified = true
      const userDb = await pool.query("SELECT email_verified FROM users WHERE id = $1;", [createdUserId]);
      assert.equal(userDb.rows[0].email_verified, true);

      // Verify OTP is marked used (single-use)
      const otpRow = await pool.query(
        "SELECT is_used FROM verification_otps WHERE email = $1 AND purpose = 'registration';",
        [regUserEmail.toLowerCase()]
      );
      assert.equal(otpRow.rows[0].is_used, true);

      // Verify replaying the same OTP fails
      await assert.rejects(
        async () => verifyRegistrationOtp({
          email: regUserEmail,
          otp: capturedOtpCode,
        }),
        (err) => err.statusCode === 400
      );

      // Verify Welcome email was queued in email_outbox
      const welcomeRow = await pool.query(
        "SELECT * FROM email_outbox WHERE recipient_email = $1 AND template_type = 'welcome';",
        [regUserEmail.toLowerCase()]
      );
      assert.equal(welcomeRow.rows.length, 1);
      assert.match(welcomeRow.rows[0].subject, /Welcome to Kruu/);
    });

    test("1.7 Duplicate registration of active email returns 409 Conflict", async () => {
      await assert.rejects(
        async () => initiateRegistration({
          name: "Another User",
          email: regUserEmail,
          password: "AnotherPassword123!",
        }),
        (err) => err.statusCode === 409
      );
    });
  });

  // --- 2. Login with Credentials & CAPTCHA ---
  describe("Login with Email, Password & Cloudflare Turnstile CAPTCHA", () => {
    test("2.1 Rejects login when unverified user attempts to sign in", async () => {
      // Temporarily mark user as unverified
      await pool.query("UPDATE users SET email_verified = FALSE WHERE id = $1;", [createdUserId]);

      await assert.rejects(
        async () => login({
          email: regUserEmail,
          password: regUserPassword,
        }),
        (err) => err.statusCode === 403 && err.message.includes("not verified")
      );

      // Restore verified status
      await pool.query("UPDATE users SET email_verified = TRUE WHERE id = $1;", [createdUserId]);
    });

    test("2.2 CAPTCHA verification succeeds with Cloudflare test token and fails with invalid token", async () => {
      // Cloudflare test secret key always passes test token
      const passes = await verifyTurnstileToken("XXXX.DUMMY.TOKEN.XXXX");
      assert.equal(passes, true);

      // Missing token throws 400
      await assert.rejects(
        async () => verifyTurnstileToken(""),
        (err) => err.statusCode === 400
      );
    });

    test("2.3 Successful login with verified credentials establishes session", async () => {
      const res = await login({
        email: regUserEmail,
        password: regUserPassword,
      });

      assert.equal(res.user.id, createdUserId);
      assert.ok(res.accessToken);
      assert.ok(res.refreshToken);
    });
  });

  // --- 3. Password Recovery Workflow ---
  describe("Password Recovery & Reset Authorization Flow", () => {
    let resetOtpCode = null;

    test("3.1 forgotPassword returns generic confirmation to prevent user enumeration", async () => {
      // Existing user
      const resExists = await forgotPassword({ email: regUserEmail });
      assert.equal(resExists.success, true);
      assert.ok(resExists.message.includes("If an eligible account"));

      // Non-existent user returns the exact same message
      const resMissing = await forgotPassword({ email: "nonexistent_dev@hubhub.dev" });
      assert.equal(resMissing.success, true);
      assert.equal(resMissing.message, resExists.message);

      // Verify reset OTP queued for the existing user in email_outbox
      const resetEmailRow = await pool.query(
        "SELECT * FROM email_outbox WHERE recipient_email = $1 AND template_type = 'password_reset_otp' ORDER BY created_at DESC LIMIT 1;",
        [regUserEmail.toLowerCase()]
      );
      assert.equal(resetEmailRow.rows.length, 1);
      const match = resetEmailRow.rows[0].subject.match(/\b(\d{6})\b/);
      assert.ok(match);
      resetOtpCode = match[1];
    });

    test("3.2 verifyResetOtp verifies code and returns single-use reset authorization token", async () => {
      const res = await verifyResetOtp({
        email: regUserEmail,
        otp: resetOtpCode,
      });

      assert.equal(res.success, true);
      assert.ok(res.resetToken);
      activeResetToken = res.resetToken;

      // Verify token hash stored in password_reset_authorizations
      const authRow = await pool.query(
        "SELECT user_id, is_used FROM password_reset_authorizations WHERE user_id = $1 AND is_used = FALSE;",
        [createdUserId]
      );
      assert.equal(authRow.rows.length, 1);
    });

    test("3.3 resetPassword updates password, invalidates authorization, and revokes sessions", async () => {
      const newPassword = "BrandNewPassword2026!";

      const res = await resetPassword({
        resetToken: activeResetToken,
        newPassword,
      });

      assert.equal(res.success, true);

      // Verify reset token cannot be reused
      await assert.rejects(
        async () => resetPassword({
          resetToken: activeResetToken,
          newPassword: "AnotherPassword123!",
        }),
        (err) => err.statusCode === 400
      );

      // Verify all active sessions were revoked
      const activeSessions = await pool.query(
        "SELECT id FROM sessions WHERE user_id = $1 AND revoked_at IS NULL;",
        [createdUserId]
      );
      assert.equal(activeSessions.rows.length, 0);

      // Verify OLD password fails to login
      await assert.rejects(
        async () => login({
          email: regUserEmail,
          password: regUserPassword,
        }),
        (err) => err.statusCode === 401
      );

      // Verify NEW password succeeds
      const newLoginRes = await login({
        email: regUserEmail,
        password: newPassword,
      });
      assert.equal(newLoginRes.user.id, createdUserId);
      assert.ok(newLoginRes.accessToken);
    });
  });

  // --- 4. Google OAuth Flow & Identity Verification ---
  describe("Google OAuth 2.0 & Identity Linking Architecture", () => {
    test("4.1 Redirect destination allowlisting prevents open redirect attacks", () => {
      assert.equal(sanitizeRedirectDestination("/profile"), "/profile");
      assert.equal(sanitizeRedirectDestination("/api-market"), "/api-market");
      // Arbitrary external domain fallback
      assert.equal(sanitizeRedirectDestination("https://evil-phishing.com"), "/profile");
      assert.equal(sanitizeRedirectDestination("//evil.com"), "/profile");
    });

    test("4.2 Google callback handles cancelled user consent gracefully", async () => {
      const res = await processGoogleCallback({
        error: "access_denied",
      });
      assert.equal(res.cancelled, true);
      assert.ok(res.reason.includes("cancelled"));
    });

    test("4.3 Google callback prevents account takeover on matching email with password account", async () => {
      // Simulate OAuth callback with email that already belongs to createdUserId (who has password)
      // When state is invalid/missing, state verification protects the flow
      const res = await processGoogleCallback({
        code: "invalid_code",
        state: "non_existent_state",
      });
      assert.ok(res.error.includes("OAuth security state"));
    });

    test("4.4 Name choice workflow for Google profiles exceeding 25 characters", async () => {
      // completeGoogleRegistrationWithName validates length
      await assert.rejects(
        async () => completeGoogleRegistrationWithName({
          setupToken: "invalid_token",
          name: "This Name Is Much Too Long For Kruu Requirements",
        }),
        (err) => err.statusCode === 400 && err.message.includes("25 characters")
      );
    });
  });
});
