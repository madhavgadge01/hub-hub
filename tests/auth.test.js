import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import pool from "../apps/backend/src/config/db.js";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from "../apps/backend/src/services/auth.service.js";

describe("Authentication System Integration Tests", () => {
  const testEmail = `authtest_${Date.now()}@hubhub.dev`;
  const testPassword = "SecurePassword123!";
  let registeredUserId = null;
  let activeRefreshToken = null;

  after(async () => {
    if (registeredUserId) {
      await pool.query("DELETE FROM sessions WHERE user_id = $1;", [registeredUserId]);
      await pool.query("DELETE FROM users WHERE id = $1;", [registeredUserId]);
    }
    await pool.end();
  });

  test("Registration creates user, hashes password, and creates active session", async () => {
    const res = await register({
      name: "Auth Test User",
      email: testEmail.toUpperCase(), // test email normalization
      password: testPassword,
    });

    assert.ok(res.user.id);
    assert.equal(res.user.email, testEmail.toLowerCase());
    assert.equal(res.user.password_hash, undefined);
    assert.ok(res.accessToken);
    assert.ok(res.refreshToken);

    registeredUserId = res.user.id;
    activeRefreshToken = res.refreshToken;
  });

  test("Registration rejects duplicate email with 409 Conflict", async () => {
    await assert.rejects(
      async () =>
        register({
          name: "Duplicate User",
          email: testEmail,
          password: "AnotherPassword123!",
        }),
      (err) => err.statusCode === 409
    );
  });

  test("Registration rejects weak password with 400 Bad Request", async () => {
    await assert.rejects(
      async () =>
        register({
          name: "Short Pwd",
          email: "short@hubhub.dev",
          password: "123",
        }),
      (err) => err.statusCode === 400
    );
  });

  test("Login succeeds with valid credentials and normalizes email", async () => {
    const res = await login({
      email: `  ${testEmail.toUpperCase()}  `,
      password: testPassword,
    });

    assert.equal(res.user.id, registeredUserId);
    assert.equal(res.user.email, testEmail.toLowerCase());
    assert.ok(res.accessToken);
    assert.ok(res.refreshToken);
  });

  test("Login fails with invalid password with 401 Unauthorized", async () => {
    await assert.rejects(
      async () =>
        login({
          email: testEmail,
          password: "WrongPassword!",
        }),
      (err) => err.statusCode === 401
    );
  });

  test("Refresh token rotates session and generates new access token", async () => {
    const refreshed = await refreshAccessToken(activeRefreshToken);
    assert.ok(refreshed.accessToken);
    assert.equal(refreshed.user.id, registeredUserId);
  });

  test("Current user endpoint returns profile without sensitive hashes", async () => {
    const user = await getCurrentUser(registeredUserId);
    assert.equal(user.id, registeredUserId);
    assert.equal(user.password_hash, undefined);
  });
});
