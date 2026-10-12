import { test, describe, after, before } from "node:test";
import assert from "node:assert/strict";
import pool from "../apps/backend/src/config/db.js";
import {
  getUserProfile,
  updateUserProfile,
  getUserPurchases,
  getUserUsageAnalytics,
  getUserRecentUsage,
} from "../apps/backend/src/services/profile.service.js";
import {
  createApiKeyForUser,
  rotateApiKeyForUser,
  revokeApiKeyForUser,
  validateDeveloperApiKey,
  recordApiKeyUsage,
} from "../apps/backend/src/services/apiKey.service.js";

describe("User Profile, Access Enforcement & Usage Telemetry Tests", () => {
  let userAId = null;
  let userBId = null;
  let productId = null;
  let entitlementId = null;
  let keyObj = null;

  before(async () => {
    // 1. Create User A
    const resA = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, avatar)
      VALUES ('Alice Developer', $1, 'hash', '/avatars/avatar-1.svg')
      RETURNING id;
      `,
      [`alice_${Date.now()}@hubhub.dev`]
    );
    userAId = resA.rows[0].id;

    // 2. Create User B
    const resB = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, avatar)
      VALUES ('Bob Hacker', $1, 'hash', '/avatars/avatar-2.svg')
      RETURNING id;
      `,
      [`bob_${Date.now()}@hubhub.dev`]
    );
    userBId = resB.rows[0].id;

    // 3. Get product and create an active entitlement for Alice
    const prodRes = await pool.query(`SELECT id FROM api_products WHERE slug = 'qr-code' LIMIT 1;`);
    productId = prodRes.rows[0].id;

    const planRes = await pool.query(
      `SELECT id FROM api_plans WHERE api_product_id = $1 LIMIT 1;`,
      [productId]
    );
    const planId = planRes.rows[0].id;

    const purRes = await pool.query(
      `
      INSERT INTO user_purchases (
        purchase_reference, user_id, api_product_id, plan_id,
        amount_paid, currency, status, payment_reference
      ) VALUES ($1, $2, $3, $4, 0, 'INR', 'paid', 'test_grant')
      RETURNING id;
      `,
      [`pur_test_${Date.now()}`, userAId, productId, planId]
    );
    const purchaseId = purRes.rows[0].id;

    const entRes = await pool.query(
      `
      INSERT INTO user_api_entitlements (
        user_id, purchase_id, api_product_id, plan_id, status, requests_quota, requests_used, rate_limit_per_minute
      ) VALUES ($1, $2, $3, $4, 'active', 500, 0, 60)
      RETURNING id;
      `,
      [userAId, purchaseId, productId, planId]
    );
    entitlementId = entRes.rows[0].id;
  });

  after(async () => {
    if (userAId) {
      await pool.query("DELETE FROM api_usage WHERE user_id = $1;", [userAId]);
      await pool.query("DELETE FROM api_keys WHERE user_id = $1;", [userAId]);
      await pool.query("DELETE FROM user_api_entitlements WHERE user_id = $1;", [userAId]);
      await pool.query("DELETE FROM user_purchases WHERE user_id = $1;", [userAId]);
      await pool.query("DELETE FROM users WHERE id = $1;", [userAId]);
    }
    if (userBId) {
      await pool.query("DELETE FROM users WHERE id = $1;", [userBId]);
    }
    await pool.end();
  });

  test("Profile retrieval and avatar validation", async () => {
    const profile = await getUserProfile(userAId);
    assert.equal(profile.name, "Alice Developer");
    assert.equal(profile.avatar, "/avatars/avatar-1.svg");

    // Update with valid avatar
    const updated = await updateUserProfile(userAId, {
      name: "Alice Wonderland",
      avatar: "/avatars/avatar-3.svg",
    });
    assert.equal(updated.name, "Alice Wonderland");
    assert.equal(updated.avatar, "/avatars/avatar-3.svg");

    // Reject arbitrary/external avatar upload or URL
    await assert.rejects(
      async () =>
        updateUserProfile(userAId, {
          avatar: "https://evil-site.com/avatar.jpg",
        }),
      /Invalid avatar selection/i
    );
  });

  test("API key creation bound to entitlement and usage recording", async () => {
    // 1. Create key bound to entitlement
    keyObj = await createApiKeyForUser(
      userAId,
      "Production QR Key",
      productId,
      entitlementId
    );
    assert.ok(keyObj.rawKey);
    assert.equal(keyObj.apiProductId, productId);
    assert.equal(keyObj.entitlementId, entitlementId);

    // 2. Validate API key
    const validated = await validateDeveloperApiKey(keyObj.rawKey);
    assert.equal(validated.userId, userAId);
    assert.equal(validated.apiProductId, productId);
    assert.equal(validated.entitlementId, entitlementId);

    // 3. Record actual usage
    await recordApiKeyUsage({
      keyId: keyObj.id,
      userId: userAId,
      apiProductId: productId,
      entitlementId: entitlementId,
      endpoint: "/api/v1/qr",
      method: "POST",
      statusCode: 200,
      responseTimeMs: 24,
    });

    // 4. Verify telemetry reflected in profile analytics
    const analytics = await getUserUsageAnalytics(userAId);
    assert.ok(analytics.totalRequests >= 1);
    assert.ok(analytics.successfulRequests >= 1);
    assert.equal(analytics.failedRequests, 0);

    const recent = await getUserRecentUsage(userAId, 5);
    assert.ok(recent.length >= 1);
    assert.equal(recent[0].endpoint, "/api/v1/qr");
    assert.equal(recent[0].status_code, 200);
  });

  test("API key rotation generates fresh secret and revokes old key", async () => {
    const oldRawKey = keyObj.rawKey;
    const rotated = await rotateApiKeyForUser(userAId, keyObj.id);

    assert.ok(rotated.rawKey);
    assert.notEqual(rotated.rawKey, oldRawKey);

    // Old key must now be rejected
    await assert.rejects(
      async () => validateDeveloperApiKey(oldRawKey),
      /revoked/i
    );

    // New key is valid
    const valid = await validateDeveloperApiKey(rotated.rawKey);
    assert.equal(valid.id, rotated.id);
  });

  test("Cross-account isolation: User B cannot access or modify User A resources", async () => {
    // Bob cannot revoke Alice's key
    await assert.rejects(
      async () => revokeApiKeyForUser(userBId, keyObj.id),
      /permission/i
    );

    // Bob cannot see Alice's purchases
    const bobPurchases = await getUserPurchases(userBId);
    assert.equal(bobPurchases.length, 0);

    // Bob has zero usage recorded
    const bobAnalytics = await getUserUsageAnalytics(userBId);
    assert.equal(bobAnalytics.totalRequests, 0);
  });
});
