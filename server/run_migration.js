const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: process.env.DB_USER || 'tough',
  host: process.env.DB_HOST || 'toughdev.cafe24.com',
  database: process.env.DB_NAME || 'app',
  password: process.env.DB_PASSWORD || 'a1010101',
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync(path.join(__dirname, 'init_db.sql'), 'utf-8');

pool.query(sql)
  .then(() => {
    console.log('✅ Tables created successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error creating tables:', err);
    process.exit(1);
  });
