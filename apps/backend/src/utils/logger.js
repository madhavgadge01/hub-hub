/**
 * Structured logger with automatic secret redaction.
 */
const SENSITIVE_KEYS = new Set([
  "password",
  "password_hash",
  "passwordhash",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "key",
  "rawapikey",
  "apikey",
  "key_hash",
  "authorization",
  "cookie",
  "cookies",
]);

function redactValue(val) {
  if (typeof val === "string") {
    if (val.length <= 8) return "[REDACTED]";
    return `${val.slice(0, 4)}...[REDACTED]`;
  }
  return "[REDACTED]";
}

export function sanitize(data) {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = redactValue(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info(message, meta = {}) {
    console.log(JSON.stringify({
      level: "INFO",
      timestamp: new Date().toISOString(),
      message,
      ...(Object.keys(meta).length > 0 ? { meta: sanitize(meta) } : {}),
    }));
  },
  warn(message, meta = {}) {
    console.warn(JSON.stringify({
      level: "WARN",
      timestamp: new Date().toISOString(),
      message,
      ...(Object.keys(meta).length > 0 ? { meta: sanitize(meta) } : {}),
    }));
  },
  error(message, error = null, meta = {}) {
    console.error(JSON.stringify({
      level: "ERROR",
      timestamp: new Date().toISOString(),
      message,
      ...(error ? { error: error.message || String(error) } : {}),
      ...(Object.keys(meta).length > 0 ? { meta: sanitize(meta) } : {}),
    }));
  },
  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(JSON.stringify({
        level: "DEBUG",
        timestamp: new Date().toISOString(),
        message,
        ...(Object.keys(meta).length > 0 ? { meta: sanitize(meta) } : {}),
      }));
    }
  },
};

export default logger;
