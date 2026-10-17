import pool from "../config/db.js";

/**
 * Records an immutable administrative audit log entry in PostgreSQL.
 * Passwords, secrets, and sensitive tokens MUST NEVER be included in metadata.
 */
export async function recordAuditLog({
  adminId = null,
  adminEmail = null,
  action,
  targetType,
  targetId = null,
  metadata = {},
  ipAddress = null,
}) {
  try {
    // Sanitize metadata to guarantee no secrets or passwords can leak
    const sanitizedMetadata = { ...metadata };
    delete sanitizedMetadata.password;
    delete sanitizedMetadata.passwordHash;
    delete sanitizedMetadata.token;
    delete sanitizedMetadata.secret;
    delete sanitizedMetadata.keyHash;
    delete sanitizedMetadata.keySecret;

    await pool.query(
      `
      INSERT INTO admin_audit_logs (
        admin_id, admin_email, action, target_type, target_id, metadata, ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      [
        adminId,
        adminEmail,
        action,
        targetType,
        String(targetId || ""),
        JSON.stringify(sanitizedMetadata),
        ipAddress,
      ]
    );
  } catch (err) {
    console.error("⚠️ Failed to write audit log:", err.message);
  }
}

export default { recordAuditLog };
