import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import redis from "../apps/backend/src/config/redis.js";

const LUA_RATE_LIMIT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[1]))
end
local ttl = redis.call("TTL", KEYS[1])
return { current, ttl }
`;

describe("Redis Lua Rate Limiting Integration Tests", () => {
  const testKey = `ratelimit:test:${Date.now()}`;

  after(async () => {
    await redis.del(testKey);
    await redis.quit();
  });

  test("Allows first 60 requests and sets expiry TTL", async () => {
    for (let i = 1; i <= 60; i++) {
      const [count, ttl] = await redis.eval(
        LUA_RATE_LIMIT,
        1,
        testKey,
        60,
        60
      );
      assert.equal(count, i);
      assert.ok(ttl <= 60 && ttl > 0, `TTL ${ttl} should be between 1 and 60`);
    }
  });

  test("Rejects the 61st request in the active window", async () => {
    const [count, ttl] = await redis.eval(
      LUA_RATE_LIMIT,
      1,
      testKey,
      60,
      60
    );
    assert.equal(count, 61);
    assert.ok(count > 60, "Request 61 should exceed the limit of 60");
    assert.ok(ttl > 0, "TTL should still be positive");
  });
});
