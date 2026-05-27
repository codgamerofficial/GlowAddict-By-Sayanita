const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Riik2205%40%23%24@db.etheoeqnjxzeqosmntjh.supabase.co:5432/postgres";

async function main() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    const schemaPath = path.join(__dirname, "../supabase/schema.sql");
    console.log(`Reading SQL schema from ${schemaPath}...`);
    const sql = fs.readFileSync(schemaPath, "utf8");

    console.log("Executing SQL schema commands on Supabase database...");
    await client.query(sql);
    console.log("Database schema successfully pushed and initialized!");
  } catch (error) {
    console.error("Database schema push failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
