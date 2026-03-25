const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    user: 'tough',
    host: 'toughdev.cafe24.com',
    database: 'app',
    password: 'a1010101',
    port: 5432,
    ssl: false
  });

  try {
    await client.connect();
    console.log("👉 SUCCESS: Connected with NO SSL");
    await client.end();
  } catch (err) {
    console.log("👉 FAIL (NO SSL):", err.message);
  }

  const clientSSL = new Client({
    user: 'tough',
    host: 'toughdev.cafe24.com',
    database: 'app',
    password: 'a1010101',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await clientSSL.connect();
    console.log("👉 SUCCESS: Connected WITH SSL");
    await clientSSL.end();
  } catch (err) {
    console.log("👉 FAIL (WITH SSL):", err.message);
  }
}
run();
