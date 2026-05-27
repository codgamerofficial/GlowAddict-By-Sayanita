const { Client } = require("pg");

const host = "db.etheoeqnjxzeqosmntjh.supabase.co";
const port = 5432;
const database = "postgres";
const user = "postgres";

const passwords = [
  "Riik2205@#",
  "[Riik2205@#]",
  "Riik2205",
  "Riik2205%40%23",
  "%5BRiik2205%40%23%5D"
];

async function testPassword(password) {
  console.log(`Testing password candidate: "${password}"...`);
  const client = new Client({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`✓ SUCCESS! Connection established with password: "${password}"`);
    await client.end();
    return true;
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  for (const pwd of passwords) {
    const success = await testPassword(pwd);
    if (success) {
      console.log(`\nVerified database password is: "${pwd}"`);
      break;
    }
  }
}

main();
