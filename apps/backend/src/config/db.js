import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.dbUrl,
  ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client:", err.message);
});

export async function testDbConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT NOW();");
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function closeDbPool() {
  try {
    await pool.end();
    console.log("PostgreSQL pool closed gracefully.");
  } catch (err) {
    console.error("Error closing PostgreSQL pool:", err.message);
  }
}

export default pool;
