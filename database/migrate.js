import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("❌ DB_URL environment variable is required to run migrations.");
  process.exit(1);
}

// Support SSL configurations (e.g. Neon, AWS RDS, Heroku, local)
const isSsl = dbUrl.includes("sslmode=require") || process.env.DB_SSL === "true";
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query(`
    SELECT name, applied_at FROM schema_migrations ORDER BY id ASC;
  `);
  return result.rows.map((r) => r.name);
}

export async function runMigrations() {
  const client = await pool.connect();
  const migrationsDir = path.join(__dirname, "migrations");

  try {
    console.log("🔒 Checking database schema & migration registry...");
    await ensureMigrationTable(client);

    const appliedMigrations = await getAppliedMigrations(client);
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`Found ${files.length} total migration file(s). Applied: ${appliedMigrations.length}`);

    let appliedCount = 0;
    for (const file of files) {
      if (appliedMigrations.includes(file)) {
        console.log(`  ⏩ [Already Applied] ${file}`);
        continue;
      }

      console.log(`  🚀 [Applying] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (name) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        console.log(`  ✅ [Success] ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  ❌ [Failed] ${file}: ${err.message}`);
        throw err;
      }
    }

    if (appliedCount === 0) {
      console.log("✨ All migrations are already up to date. No pending migrations.");
    } else {
      console.log(`🎉 Successfully applied ${appliedCount} migration(s).`);
    }

    // Sanity check of existing tables & data counts
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log("\n📊 Active Database Tables:");
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(`   - ${row.table_name}: ${countRes.rows[0].count} row(s)`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations().catch((err) => {
    console.error("Migration fatal error:", err);
    process.exit(1);
  });
}
