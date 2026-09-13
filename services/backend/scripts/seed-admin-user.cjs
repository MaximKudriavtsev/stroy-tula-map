/**
 * Создаёт или обновляет AdminUser.
 * Env: DB_*, ADMIN_EMAIL, ADMIN_PASSWORD
 */
require('dotenv').config();

const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in env');
    process.exit(1);
  }

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();

  const hash = await bcrypt.hash(password, 10);

  const result = await client.query(
    `INSERT INTO admin_users (email, password)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, "updatedAt" = now()
     RETURNING id, email`,
    [email, hash],
  );

  console.log('Admin user upserted:', result.rows[0]);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
