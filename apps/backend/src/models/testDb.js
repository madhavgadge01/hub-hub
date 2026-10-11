import pool from "./db.js";

try {
  const result = await pool.query("SELECT NOW();");

  console.log("✅ PostgreSQL Connected");
  console.log("Database Time:", result.rows[0].now);

} catch (error) {
  console.error("❌ PostgreSQL Connection Failed");
  console.error(error.message);

} finally {
  await pool.end();
}