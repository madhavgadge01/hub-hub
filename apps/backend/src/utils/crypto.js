import crypto from "crypto";
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;
const KEY_PREFIX_CONSTANT = "dh_live_";

/**
 * Generate a new cryptographically secure API key with prefix and hash.
 * Only the prefix and hash should be saved to the database.
 * The rawKey is displayed to the user ONCE upon creation.
 */
export function generateApiKey() {
  const randomPart = crypto.randomBytes(24).toString("hex"); // 48 chars hex
  const rawKey = `${KEY_PREFIX_CONSTANT}${randomPart}`; // 56 chars total
  const keyPrefix = rawKey.slice(0, 16); // e.g. "dh_live_8526ea14" (16 chars)
  const keyHash = hashApiKeySha256(rawKey);

  return {
    rawKey,
    keyPrefix,
    keyHash,
    algorithm: "sha256",
  };
}

/**
 * Modern fast SHA-256 hash for high-entropy API keys.
 */
export function hashApiKeySha256(rawKey) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Verifies raw API key against stored hash with backward compatibility
 * for legacy bcrypt hashes ($2b$16$...) and modern SHA-256 hashes.
 */
export async function verifyApiKeyHash(rawKey, storedHash, algorithm = null) {
  if (!rawKey || !storedHash) return false;

  // 1. Check if stored hash is legacy bcrypt
  if (algorithm === "bcrypt" || storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$")) {
    return await bcrypt.compare(rawKey, storedHash);
  }

  // 2. Modern SHA-256 comparison with constant-time equality
  const cleanStoredHash = storedHash.replace(/^sha256:/, "");
  const computedHash = hashApiKeySha256(rawKey);

  const hashBufferA = Buffer.from(computedHash, "hex");
  const hashBufferB = Buffer.from(cleanStoredHash, "hex");

  if (hashBufferA.length !== hashBufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBufferA, hashBufferB);
}

/**
 * Hash user password using bcrypt.
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare password against stored hash.
 */
export async function comparePassword(password, storedHash) {
  return await bcrypt.compare(password, storedHash);
}
