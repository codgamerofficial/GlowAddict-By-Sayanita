import { readFileSync } from "fs";
import pg from "pg";

const sql = readFileSync("supabase/migrations/001_schema.sql", "utf8");

const pool = new pg.Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: process.env.SUPABASE_DB_PORT || 5432,
  database: process.env.SUPABASE_DB_NAME || "postgres",
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log("Migration ran successfully.");
} catch (err) {
  console.error("Migration failed:", err.message);
} finally {
  await pool.end();
}
