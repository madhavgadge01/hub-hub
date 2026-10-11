import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import pool from "../apps/backend/src/config/db.js";
import {
  generateApiKey,
  verifyApiKeyHash,
  hashApiKeySha256,
} from "../apps/backend/src/utils/crypto.js";
import {
  createApiKeyForUser,
  listApiKeysForUser,
  revokeApiKeyForUser,
  validateDeveloperApiKey,
} from "../apps/backend/src/services/apiKey.service.js";

describe("API Key System Unit & Integration Tests", () => {
  let testUserId = null;
  let createdKey = null;

  after(async () => {
    if (createdKey) {
      await pool.query("DELETE FROM api_keys WHERE id = $1;", [createdKey.id]);
    }
    if (testUserId) {
      await pool.query("DELETE FROM users WHERE id = $1;", [testUserId]);
    }
    await pool.end();
  });

  test("API key generation has high entropy, recognizable prefix, and SHA-256 hash", () => {
    const key = generateApiKey();
    assert.ok(key.rawKey.startsWith("dh_live_"));
    assert.equal(key.keyPrefix.length, 16);
    assert.equal(key.keyHash.length, 64);
    assert.equal(key.algorithm, "sha256");
  });

  test("Verification works for modern SHA-256 and rejects incorrect keys", async () => {
    const { rawKey, keyHash } = generateApiKey();
    const isValid = await verifyApiKeyHash(rawKey, keyHash, "sha256");
    assert.equal(isValid, true);

    const isInvalid = await verifyApiKeyHash("dh_live_wrongtoken", keyHash, "sha256");
    assert.equal(isInvalid, false);
  });

  test("Backward compatibility: Verification succeeds for legacy bcrypt hashed keys", async () => {
    const legacyRawKey = "dh_live_legacytestkey1234567890abcdef";
    const legacyBcryptHash = await bcrypt.hash(legacyRawKey, 10);

    const isValid = await verifyApiKeyHash(legacyRawKey, legacyBcryptHash, "bcrypt");
    assert.equal(isValid, true);

    const isInvalid = await verifyApiKeyHash("dh_live_wrongtoken", legacyBcryptHash, "bcrypt");
    assert.equal(isInvalid, false);
  });

  test("Database integration: Create, list (masked), validate, and enforce ownership", async () => {
    // 1. Create a temporary test user
    const userRes = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ('Key Test User', $1, 'hashed_pwd')
      RETURNING id;
      `,
      [`keytest_${Date.now()}@hubhub.dev`]
    );
    testUserId = userRes.rows[0].id;

    // 2. Create API key: returns rawKey only once
    createdKey = await createApiKeyForUser(testUserId, "Automated Test Key");
    assert.ok(createdKey.id);
    assert.ok(createdKey.rawKey);
    assert.equal(createdKey.name, "Automated Test Key");
    assert.ok(createdKey.keyPrefix.startsWith("dh_live_"));

    // 3. List API keys: never exposes raw key or hash
    const listedKeys = await listApiKeysForUser(testUserId);
    assert.ok(listedKeys.length >= 1);
    const found = listedKeys.find((k) => k.id === createdKey.id);
    assert.ok(found);
    assert.equal(found.rawKey, undefined);
    assert.ok(found.maskedKey.includes("••••"));
    assert.equal(found.status, "active");

    // 4. Validate developer API key using rawKey
    const validated = await validateDeveloperApiKey(createdKey.rawKey);
    assert.equal(validated.id, createdKey.id);
    assert.equal(validated.userId, testUserId);

    // 5. Ownership check: another user cannot revoke this key
    const fakeUserId = "00000000-0000-0000-0000-000000000000";
    await assert.rejects(
      async () => revokeApiKeyForUser(fakeUserId, createdKey.id),
      /permission/i
    );

    // 6. Owner can revoke
    const revoked = await revokeApiKeyForUser(testUserId, createdKey.id);
    assert.equal(revoked.id, createdKey.id);

    // 7. Revoked key is rejected
    await assert.rejects(
      async () => validateDeveloperApiKey(createdKey.rawKey),
      /revoked/i
    );
  });
});
