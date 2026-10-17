import "dotenv/config";
import pg from "pg";
import { hashPassword } from "../apps/backend/src/utils/crypto.js";

const { Pool } = pg;
const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  console.error("❌ DB_URL environment variable is required.");
  process.exit(1);
}

const isSsl = dbUrl.includes("sslmode=require") || process.env.DB_SSL === "true";
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});

export async function bootstrapAdmin(targetEmail, targetName = "Administrator", targetPassword = null) {
  const client = await pool.connect();
  try {
    const email = (targetEmail || process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.ADMIN_EMAIL || "admin@kruu.online").trim().toLowerCase();
    
    console.log(`🔐 Bootstrapping administrator for email: ${email}`);

    const existingRes = await client.query(
      "SELECT id, name, email, role, status FROM users WHERE email = $1 LIMIT 1;",
      [email]
    );

    if (existingRes.rows.length > 0) {
      const user = existingRes.rows[0];
      if (targetPassword) {
        const passwordHash = await hashPassword(targetPassword);
        await client.query(
          "UPDATE users SET role = 'admin', status = 'active', password_hash = $1, updated_at = NOW() WHERE id = $2;",
          [passwordHash, user.id]
        );
        console.log(`✅ User ${user.email} (ID: ${user.id}) updated to 'admin' role with updated password.`);
      } else {
        await client.query(
          "UPDATE users SET role = 'admin', status = 'active', updated_at = NOW() WHERE id = $1;",
          [user.id]
        );
        console.log(`✅ User ${user.email} (ID: ${user.id}) successfully promoted to 'admin' role.`);
      }
      return { id: user.id, email: user.email, role: "admin", action: "promoted" };
    }

    // If user does not exist, create new administrator account
    const password = targetPassword || process.env.ADMIN_BOOTSTRAP_PASSWORD || "AdminPass123!Kruu";
    const passwordHash = await hashPassword(password);

    const insertRes = await client.query(
      `
      INSERT INTO users (name, email, password_hash, role, status, avatar)
      VALUES ($1, $2, $3, 'admin', 'active', '/avatars/avatar-1.svg')
      RETURNING id, name, email, role, created_at;
      `,
      [targetName, email, passwordHash]
    );

    const newUser = insertRes.rows[0];
    console.log(`🎉 New administrator account created: ${newUser.email} (ID: ${newUser.id})`);
    console.log(`🔑 Initial temporary password: ${password} (Please change upon initial login)`);
    return { id: newUser.id, email: newUser.email, role: "admin", action: "created", initialPassword: password };
  } finally {
    client.release();
    await pool.end();
  }
}

// CLI Execution
if (process.argv[1]?.endsWith("bootstrap_admin.js")) {
  const emailArg = process.argv[2];
  const nameArg = process.argv[3];
  const passArg = process.argv[4];

  bootstrapAdmin(emailArg, nameArg, passArg)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Admin bootstrap failed:", err);
      process.exit(1);
    });
}
